require("dotenv").config({ path: ".env" });
const express = require("express");
const _ = require("lodash");
const http = require("http");
const DashaApplication = require("./dasha-application");
const ExternalService = require("./external-service");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const DASHA_SERVER = process.env.DASHA_SERVER;
const DASHA_APIKEY = process.env.DASHA_APIKEY;
const DASHA_CONCURRENCY = process.env.DASHA_CONCURRENCY ?? 2;

const PORT = "8080";

let dashaApplication;
let externalService;

dashaApplication = new DashaApplication(DASHA_SERVER, DASHA_APIKEY);
externalService = new ExternalService();

const SocketToConversation = {};
const ConversationToEventQueue = {};
const ConversationToInput = {};
// omg
const ConversationToSocket = {};

function closeConversation(convId) {
  const socket = ConversationToSocket[convId]
  externalService.closeConversation(convId);
  delete SocketToConversation[socket.id];
  ConversationToEventQueue[convId] = [];
  delete ConversationToInput[convId];
}

function getNewEvents(convId) {
  const eventQueue = ConversationToEventQueue[convId];
  if (eventQueue === undefined) throw new Error("Event queue was not found");
  newEvents = [...eventQueue];
  eventQueue.splice(0, newEvents.length);
  return newEvents;
}

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

  app.use((req, res, next) => {
    if (_.isNil(DASHA_SERVER))
      throw new Error("Variable DASHA_SERVER is not set in the environment");
    if (_.isNil(DASHA_APIKEY))
      throw new Error("Variable DASHA_APIKEY is not set in the environment");
    next();
  });

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

  app.get("/sip", async (req, res) => {
    const domain = dashaApplication.app.account.server.replace("app.", "sip.");
    const sipServerEndpoint = `wss://${domain}/sip/connect`;

    // client sip address should:
    // 1. start with `sip:reg`
    // 2. to be unique
    // 3. use the domain as the sip server
    const aor = `sip:reg-${uuidv4()}@${domain}`;

    res.send({ aor, sipServerEndpoint: sipServerEndpoint });
  });

  return app;
}

async function main() {
  const app = createExpressApp();

  await dashaApplication.start(DASHA_CONCURRENCY);
  await externalService.start();

  dashaApplication.app.setExternal("check_new_events", (args) => {
    const { conversation_id } = args;
    return getNewEvents(conversation_id);
  });
  dashaApplication.app.setExternal("close_conversation", (args) => {
    const { conversation_id } = args;
    closeConversation(conversation_id);
  });
  /* configure conversation execution handler */
  dashaApplication.app.queue.on("ready", async (conversationId, conv, info) => {
    console.log(`Conv ${conversationId} is ready`);
    const socket = ConversationToSocket[conversationId];

    conv.on("transcription", (transcription) => {
      console.log(transcription);
      socket.emit("dasha-transcript", transcription);
      if (transcription.speaker == "human") {
        console.log("EMITTING")

        const responseEvent = externalService.processUserMessage(conversationId, transcription.text);
        console.log(`Sending ai event ${JSON.stringify(responseEvent)}`);
        ConversationToEventQueue[conversationId].push(responseEvent);
      }
    });

    // pass same input to Dasha along with conversation_id which is used to differ conversations in external service
    const input = ConversationToInput[conversationId];
    conv.input = { ...input, conversation_id: conversationId };
    conv.audio.noiseVolume = 0;
    conv.audio.tts = "dasha";
    conv.execute({channel: "audio"}).then(r => {
      socket.emit("system-close-conv");
    });
    
  });

  const httpServer = http.createServer(app);

  const io = new Server(httpServer);
  io.on("connection", (socket) => {
    console.log("user connected, socket id:", socket.id);
    // register user
    ConversationToEventQueue[socket.id] = [];

    // for debugging
    socket.on("debug", (msg) => {
      console.log(`[debug:${socket.id}] ${msg}`);
    });

    socket.on("system-interrupt-conv", () => {
      const convId = SocketToConversation[socket.id];
      closeConversation(convId);
      console.log(`conversation ${convId} interrupted`);
    });
    socket.on("system-close-conv", () => {
      const convId = SocketToConversation[socket.id];
      closeConversation(convId);
      console.log(`conversation ${convId} closed`);
    });

    /* @todo generate convId here and return it to client within Promise */
    socket.on("system-create-conv", async (e) => {
      const { socketId, convId, input} = e;

      console.log(`got request to create conversation from user '${convId}'`);

      SocketToConversation[socketId] = convId;
      ConversationToInput[convId] = input;
      ConversationToEventQueue[convId] = [];
      ConversationToSocket[convId] = socket;

      // call async function
      externalService.createConversation(input, convId);
      await dashaApplication.enqueue(convId);
      externalService.executeConversation(convId);
      console.log(`conversation '${convId}' created`);
    })

    socket.on("user-text-message", (e) => {
      console.log(`GOT USER MESSAGE ${JSON.stringify(e)}`)
      // send text in external service, get response and emit answer
      const convId = SocketToConversation[socket.id];
      if (convId === undefined) return;

      const { text } = e;

      const responseEvent = externalService.processUserMessage(convId, text);
      console.log(`Sending ai event ${JSON.stringify(responseEvent)}`);
      ConversationToEventQueue[convId].push(responseEvent);
    });

    socket.on("disconnect", function (s) {
      console.log(
        `user '${socket.id}' disconnected, closing all conversations`
      );
      const convId = SocketToConversation[socket.id];
      const queue = ConversationToEventQueue[convId]
      queue?.splice(0,queue?.length);
      queue?.push({messages: [], exit_dialogue: true});
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
