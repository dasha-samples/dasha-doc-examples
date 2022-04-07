require("dotenv").config({ path: ".env" });
const express = require("express");
const _ = require("lodash");
const http = require("http");
const ExternalService = require("../external-service");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");


const PORT = "8080";

let externalService;

const SocketToConversation = {};

function createExpressApp() {
  const app = express();
  const viewsDir = __dirname + "/views";
  app.use(express.static(viewsDir));
  app.set("views", viewsDir);
  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "ejs");

  app.use(
    express.json({ type: ["application/json", "application/json-patch+json"] })
  );
  app.use(cors());

  app.get("/", (req, res) => {
    res.render("base.html");
  });

  app.get("/health", (req, res) => {
    console.log("got request healthcheck");
    return res.status(200).send("OK");
  });

  app.get("/clients", (req, res) => {
    console.log("got request clients");
    return res.json(SocketToConversation);
  });

  app.post("/create-conversation", (req, res) => {
    const convId = uuidv4();
    const { socketId, input } = req.body;
    console.log(`got request to create conversation from user '${convId}'`);
    externalService.createConversation(input, convId);
    console.log(`conversation '${convId}' created`);

    SocketToConversation[socketId] = convId;
    // call async function
    externalService.executeConversation(convId);

    res.json({ convId });
  });

  return app;
}

async function main() {
  const app = createExpressApp();

  externalService = new ExternalService();

  await externalService.start();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer);
  io.on("connection", (socket) => {
    console.log("user connected, socket id:", socket.id);

    // for debugging
    socket.on("debug", (msg) => {
      console.log(`[debug:${socket.id}] ${msg}`);
    });

    /* @todo make creating with sockets and return convId with promise
    socket.on("system-create-conv", () => {
      // const convId = SocketToConversation[socket.id];
      // externalService.closeConversation(convId);
      // delete SocketToConversation[socket.id];
      console.log(`conversation ${convId} created`);
    });
    */
    socket.on("system-interrupt-conv", () => {
      const convId = SocketToConversation[socket.id];
      externalService.closeConversation(convId);
      delete SocketToConversation[socket.id];
      console.log(`conversation ${convId} interrupted`);
    });
    socket.on("system-close-conv", () => {
      const convId = SocketToConversation[socket.id];
      externalService.closeConversation(convId);
      delete SocketToConversation[socket.id];
      console.log(`conversation ${convId} closed`);
    });

    socket.on("user-text-message", (e) => {
      // send text in external service, get response and emit answer
      const convId = SocketToConversation[socket.id];
      if (convId === undefined) return;

      const { text } = e;
      const response = externalService.processUserMessage(convId, text);
      console.log(`Sending ai event ${JSON.stringify(response)}`);
      socket.emit("external-service-event", {
        message: response,
        convId,
      });
    });

    socket.on("disconnect", function (s) {
      console.log(
        `user '${socket.id}' disconnected, closing all conversations`
      );
      const convId = SocketToConversation[socket.id];
      externalService.closeConversation(convId);
      delete SocketToConversation[socket.id];
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
