require("dotenv").config({ path: ".env" });
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const ExternalServiceConversation = require("./external-service-conversation");

const PORT = "8080";

const Conversations = {};
const Sockets = {};
const ConversationToSocket = {};
const SocketToConversation = {};

function closeConversation(convId) {
  if (convId === undefined) return;
  // get socket by convId
  const conversation = Conversations[convId];
  const socketId = ConversationToSocket[convId];
  const socket = Sockets[socketId];
  // send request to close conversation to client
  socket?.emit("system-close-conv", { conversationId: conversation.id });
  conversation?.close();
  delete Conversations[convId];
  delete ConversationToSocket[convId];
}

function createApp() {

  const app = express();
  const viewsDir = __dirname + "/views";
  app.use(express.static(viewsDir));
  app.set("views", viewsDir);
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "ejs");
  app.use(cors());
  app.use(
    express.json({ type: ["application/json", "application/json-patch+json"] })
  );

  app.get("/", (req, res) => {
    res.render("index.html");
  });

  app.get("/health", (req, res) => {
    console.log("got request healthcheck");
    return res.status(200).send("OK");
  });

  app.post("/create_conversation", (req, res) => {
    console.log("Got post 'create_conversation'", req.body);
    const { socketId, input } = req.body;

    // initialize conversation in external service
    const conversation = new ExternalServiceConversation(input);
    Conversations[conversation.id] = conversation;
    ConversationToSocket[conversation.id] = socketId;
    SocketToConversation[socketId] = conversation.id;

    res.json({ convId: conversation.id });
  });

  app.post("/process_user_input/:conversationId", (req, res) => {
    const conversationId = req.params.conversationId;
    const { userText } = req.body;
    console.log(
      "Got post 'process_user_input'",
      conversationId,
      req.body
    );

    // get socket by convId
    const conversation = Conversations[conversationId];
    if (conversation === undefined) return undefined;
    const socketId = ConversationToSocket[conversationId];
    if (SocketToConversation[socketId] !== conversationId) return undefined;
    const socket = Sockets[socketId];
    // send userText to client
    socket.emit("user-text", { userText, conversationId });
    // some calculations
    const aiResponse = conversation.processUserText(userText);
    // send ai response to client
    socket.emit("ai-text", { aiResponse, conversationId });
    return res.status(200).send({aiResponse});
  });

  app.post("/close_conversation/:conversationId", (req, res) => {
    const conversationId = req.params.conversationId;
    console.log(
      "Got post 'close_conversation'",
      conversationId
    );
    closeConversation(conversationId);
    return res.status(200);
  });

  return app;
}

async function main() {
  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new Server(httpServer);
  io.on("connection", (socket) => {
    console.log("user connected, socket id:", socket.id);
    // register user
    Sockets[socket.id] = socket;

    // for debugging
    socket.on("debug", (msg) => {
      console.log(`[debug:${socket.id}] ${msg}`);
    });
    socket.on("disconnect", (s) => {
      console.log(
        `user '${socket.id}' disconnected, closing all conversations`
      );
      const conversation = SocketToConversation[socket.id];
      closeConversation(conversation?.id);
    });
    socket.on("system-close-conv", () => {
      const conversation = SocketToConversation[socket.id];
      closeConversation(conversation.id);
    });
    socket.on("system-interrupt-conv", () => {
      const conversation = SocketToConversation[socket.id];
      closeConversation(conversation.id);
    });
  });

  httpServer
    .listen(PORT)
    .on("listening", () => {
      console.log(`Web server listening on http://localhost:${PORT}`);
    })
    .on("error", (err) => {
      console.log(`Failed to open port ${PORT}: ${err}`);
      process.exit(1);
    });
}

main();
