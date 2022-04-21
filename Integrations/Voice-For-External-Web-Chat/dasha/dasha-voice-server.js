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
      const { conversationId } = args;
      this.emit("close-dasha-conversation", { conversationId });
    });
    app.setExternal("process_user_text", async (args) => {
      const { conversationId, userText } = args;
      return this.externalDM(conversationId, userText);
    });
    this.dashaApp = app;
  }

  async _executeDashaConversation(conversationId, aor) {
    const dashaConversationInput = {
      endpoint: aor,
      conversationId,
    };
    const conv = this.dashaApp.createConversation(dashaConversationInput);
    conv.audio.noiseVolume = 0;
    conv.audio.tts = "dasha";
    await conv.execute({ channel: "audio" });
    this.emit("close-dasha-conversation", { conversationId });
  }
}

module.exports = DashaVoiceServer;
