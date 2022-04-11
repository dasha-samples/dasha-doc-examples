const dasha = require("@dasha.ai/sdk");
const EventEmitter = require("eventemitter3");
const express = require("express");
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

class DashaVoiceServer extends EventEmitter {
  constructor(dashaServer, dashaApiKey) {
    super();
    if (dashaServer === undefined)
      throw new Error(`Parameter 'dashaServer' is not provided.`);
    if (dashaApiKey === undefined)
      throw new Error(`Parameter 'dashaApikey' is not provided.`);

    this.server = dashaServer;
    this.apiKey = dashaApiKey;

    this.dashaApp = undefined;
    this.externalDM = undefined;
  }

  setExternalDialogueModel(handler) {
    this.externalDM = handler;
  }

  async run(port, dashaConcurrency) {
    if (this.externalDM === undefined)
      throw new Error(
        "External Dialogue Model is not set, use `setExternalDialogueModel(handler)`"
      );
    if (dashaConcurrency === undefined)
      throw new Error(`Parameter 'dashaConcurrency' is not provided.`);
    if (port === undefined)
      throw new Error(`Parameter 'port' is not provided.`);

    // await this.dashaApp.start(this.concurrency);
    await this._createDashaApp(dashaConcurrency);
    console.log("Dasha application started")
    const expressApp = this._createExpressApp();
    console.log("Express application is created")
    const httpServer = http.createServer(expressApp);

    httpServer
      .listen(port)
      .on("listening", () => {
        console.log(`Web server listening on http://localhost:${port}`);
      })
      .on("error", async (err) => {
        console.log(`Failed to open port ${port}: ${err}`);
        await this.stop();
        process.exit(1);
      });
  }

  async stop() {
    await this.dashaApp?.stop();
    this.dashaApp?.dispose();
  }

  _createExpressApp() {
    const app = express();
    app.use(
      express.json({ type: ["application/json", "application/json-patch+json"] })
    );
    app.use(cors());

    app.get("/health", (req, res) => {
      console.log("got request healthcheck");
      return res.status(200).send("OK");
    });

    app.get("/sip_connection", async (req, res) => {
      console.log("Got GET 'sip_connection'")
      const domain = this.server.replace("app.", "sip.");
      const sipServerEndpoint = `wss://${domain}/sip/connect`;

      // client sip address should:
      // 1. start with `sip:reg`
      // 2. to be unique
      // 3. use the domain as the sip server
      const aor = `sip:reg-${uuidv4()}@${domain}`;
      console.log("returning", { aor, sipServerEndpoint })

      res.send({ aor, sipServerEndpoint });
    });

    app.post("/execute_conversation", async (req, res) => {
      console.log("Got POST 'execute_conversation'", req.body);
      const { aor, conversationId } = req.body;
      this._executeDashaConversation(conversationId, aor);
      res.status(200);
    });

    return app;
  }

  async _createDashaApp(concurrency) {
    const app = await dasha.deploy("./dasha/app", {
      account: { server: this.server, apiKey: this.apiKey },
    });
    await app.start({ concurrency });
    app.setExternal("close_conversation", async (args) => {
      const { conversation_id } = args;
      this.emit("close-dasha-conversation", { conversation_id });
    });
    app.setExternal("process_user_text", async (args) => {
      const { conversation_id, user_text } = args;
      return this.externalDM(conversation_id, user_text);
    });
    this.dashaApp = app;
  }

  async _executeDashaConversation(conversationId, aor) {
    const dashaConversationInput = {
      endpoint: aor,
      conversation_id: conversationId,
    };
    const conv = this.dashaApp.createConversation(dashaConversationInput);
    conv.audio.noiseVolume = 0;
    conv.audio.tts = "dasha";
    await conv.execute({ channel: "audio" });
    this.emit("close-dasha-conversation", { conversationId });
  }
}

module.exports = DashaVoiceServer;

// class DashaApplication {
//   constructor(server, apiKey, externalApiUrl) {
//     this.server = server;
//     this.apiKey = apiKey;
//     this.externalApiUrl = externalApiUrl;
//   }

//   async start(concurrency) {
//     const app = await dasha.deploy("./app", {
//       account: { server: this.server, apiKey: this.apiKey },
//     });
//     await app.start({ concurrency: concurrency });
//     app.setExternal("close_conversation", async (args) => {
//         const {conversation_id} = args;
//         await axios.post(`${this.externalApiUrl}/close_conversation/${conversation_id}`);
//     })
//     app.setExternal("process_user_text", async (args) => {
//         const {conversation_id, user_text} = args;
//         const res = await axios.post(`${this.externalApiUrl}/process_user_input/${conversation_id}`, {user_text});
//         const {ai_response} = res.data
//         return ai_response;
//     })
//     this.app = app;
//   }

//   async execute(conversation_id, aor, conversationInput) {
//     const dashaConversationInput = {endpoint: aor, conversation_id, ...conversationInput};
//     const conv = this.app.createConversation(dashaConversationInput);
//     conv.audio.noiseVolume = 0;
//     conv.audio.tts = "dasha";
//     await conv.execute({ channel: "audio" });
//     await axios.post(`${this.externalApiUrl}/close_conversation/${conversation_id}`)
//   }

//   async stop() {
//     await this.app.stop();
//   }

//   async dispose() {
//     this.app.dispose();
//   }
// }

// require("dotenv").config({ path: ".env" });
// const express = require("express");
// const _ = require("lodash");
// const http = require("http");
// const { Server } = require("socket.io");
// const cors = require("cors");
// const { v4: uuidv4 } = require("uuid");

// const ExternalServiceConversation = require("../external-service-conversation");
// const DashaApplication = require("./dasha-application");

// const PORT = "8090";
// const API_URL = `http://localhost:${PORT}`;

// const DASHA_SERVER = process.env.DASHA_SERVER;
// const DASHA_APIKEY = process.env.DASHA_APIKEY;
// const DASHA_CONCURRENCY = process.env.DASHA_CONCURRENCY ?? 2;

// let dashaApp;

// // function createExpressApp() {
// //   function checkEnvironment(req, res, next) {
// //     if (_.isNil(DASHA_SERVER))
// //       throw new Error("Variable DASHA_SERVER is not set in the environment");
// //     if (_.isNil(DASHA_APIKEY))
// //       throw new Error("Variable DASHA_APIKEY is not set in the environment");
// //     next();
// //   }

// //   const app = express();

// //   app.use(checkEnvironment);

// //   app.get("/health", (req, res) => {
// //     console.log("got request healthcheck");
// //     return res.status(200).send("OK");
// //   });

// //   app.get("/sip", async (req, res) => {
// //     const domain = DASHA_SERVER.replace("app.", "sip.");
// //     const sipServerEndpoint = `wss://${domain}/sip/connect`;

// //     // client sip address should:
// //     // 1. start with `sip:reg`
// //     // 2. to be unique
// //     // 3. use the domain as the sip server
// //     const aor = `sip:reg-${uuidv4()}@${domain}`;

// //     res.send({ aor, sipServerEndpoint: sipServerEndpoint });
// //   });

// //   return app;
// // }

// async function main() {
//   const app = createExpressApp();
//   dashaApp = new DashaApplication(DASHA_SERVER, DASHA_APIKEY, API_URL);
//   await dashaApp.start(DASHA_CONCURRENCY);

//   const httpServer = http.createServer(app);

//   const io = new Server(httpServer);
//   io.on("connection", (socket) => {
//     console.log("user connected, socket id:", socket.id);
//     // register user
//     Sockets[socket.id] = socket;

//     // for debugging
//     socket.on("debug", (msg) => {
//       console.log(`[debug:${socket.id}] ${msg}`);
//     });
//     socket.on("disconnect", (s) => {
//       console.log(
//         `user '${socket.id}' disconnected, closing all conversations`
//       );
//       const conversation = SocketToConversation[socket.id];
//       closeConversation(conversation?.id);
//     });
//     socket.on("system-close-conv", () => {
//       const conversation = SocketToConversation[socket.id];
//       closeConversation(conversation.id);
//     });
//     socket.on("system-interrupt-conv", () => {
//       const conversation = SocketToConversation[socket.id];
//       closeConversation(conversation.id);
//     });
//   });

//   httpServer
//     .listen(PORT)
//     .on("listening", () => {
//       console.log(`Web server listening on http://localhost:${PORT}`);
//     })
//     .on("error", (err) => {
//       console.log(`Failed to open port ${PORT}: ${err}`);
//       process.exit(1);
//     });
// }

// main();
