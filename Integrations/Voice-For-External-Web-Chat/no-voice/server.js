require("dotenv").config({ path: ".env" });
const express = require("express");
const _ = require("lodash");
const http = require("http");
// const DashaApplication = require("./dasha-application");
const ExternalService = require("../external-service");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

// const DASHA_SERVER = process.env.DASHA_SERVER;
// const DASHA_APIKEY = process.env.DASHA_APIKEY;
// const DASHA_CONCURRENCY = process.env.DASHA_CONCURRENCY;

const PORT = "8080";

// let dashaApp;
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

  // app.use((req, res, next) => {
  //   // if (_.isNil(DASHA_SERVER))
  //   //   throw new Error("Variable DASHA_SERVER is not set in the environment");
  //   // if (_.isNil(DASHA_APIKEY))
  //   //   throw new Error("Variable DASHA_APIKEY is not set in the environment");
  //   next();
  // });


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

  app.delete("/close-conversation/:conv_id", (req, res) => {
    const convId = req.params.conv_id;
    const { socketId } = req.body;

    console.log(`got request to close conversation from user '${convId}'`);
    delete SocketToConversation[socketId];
    externalService.closeConversation(convId);
    res.status(200);
  });

  return app;
}

async function main() {
  const app = createExpressApp();

  // dashaApp = new DashaApplication(
  //   DASHA_SERVER,
  //   DASHA_APIKEY
  // );
  externalService = new ExternalService();

  // await dashaApp.start(DASHA_CONCURRENCY ?? 2);
  await externalService.start();

  const httpServer = http.createServer(app);

  const io = new Server(httpServer);
  io.on("connection", (socket) => {
    console.log("user connected, socket id:", socket.id);
    // register user
    SocketToConversation[socket.id] = undefined;

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

    // socket.on("client-closed-chat", ()=> {
    //   // client closed chatbox
    //   // close conversation in external service
    //   // maybe make it with delete request
    // })

    socket.on("user-text-message", (e) => {
      // send text in external service, get response and emit answer
      const convId = SocketToConversation[socket.id];
      if (convId === undefined) return;

      const { text } = e;

      const responseEvent = externalService.processUserMessage(convId, text);
      console.log(`Sending ai event ${JSON.stringify(responseEvent)}`);
      socket.emit("external-service-event", {
        ...responseEvent,
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
