import EventEmitter from "eventemitter3";
import * as dasha from "@dasha.ai/sdk/web";

import { v4 as uuidv4 } from "uuid";
import JSZip from "jszip";
import {appContents} from "./dasha-application-resources"

const zipApp = async (appData) => {
  const zip = new JSZip();
  for (const filePath in appData) {
    console.log(filePath, appData[filePath].slice(0,100))
    zip.file(filePath, appData[filePath]);
  }
  const appZip = await zip.generateAsync({ type: "uint8array" });
  return appZip;
};

export class DashaVoiceWidget extends EventEmitter {
  constructor() {
    super();
    this.sipUser = undefined;
    this.aor = undefined;
    this.dashaApp = undefined;
  }
  static async create(concurrency,responseFunction) {
    const voiceWidget = new DashaVoiceWidget();
    
    voiceWidget.dashaApp = await voiceWidget._createDashaApp(concurrency,responseFunction);
    const { sipUser, aor } = await voiceWidget._createSipUser();
    voiceWidget.aor = aor; // used as an endpoint for dasha conversation
    voiceWidget.sipUser = sipUser;

    return voiceWidget;
  }
  async executeDashaConversation(conversationId) {
    const dashaConversationInput = {
      endpoint: this.aor,
      conversationId,
    };
    const conv = this.dashaApp.createConversation(dashaConversationInput);
    conv.audio.noiseVolume = 0;
    conv.audio.tts = "dasha";
    await conv.execute({ channel: "audio" });
    this.emit("close-dasha-conversation", { conversationId });
  }
  async hangup() {
    await this.sipUser.hangup().catch(() => {});
  }

  async stop() {
    await this.dashaApp?.stop();
    this.dashaApp?.dispose();
  }

  async _createSipUser() {
    const sipDomain = "sip.us.dasha.ai";
    const sipServerEndpoint = `wss://${sipDomain}/sip/connect`;
    const aor = `sip:reg-${uuidv4()}@${sipDomain}`;
    const sipUser = new SIP.Web.SimpleUser(sipServerEndpoint, { aor });
    await sipUser.connect();
    await sipUser.register();
    const audio = new Audio();
    sipUser.delegate = {
      onCallReceived: async () => {
        await sipUser.answer();
        audio.srcObject = sipUser.remoteMediaStream;
        audio.play();
        this.emit("sip-user-call-received");
      },
      onCallHangup: () => {
        audio.srcObject = null;
        this.emit("sip-user-hangup");
      },
    };
    return { sipUser, aor };
  }

  async _createDashaApp(concurrency, responseFunction) {
    const zippedApp = await zipApp(appContents);
    console.log(`Zipped ${JSON.stringify(zippedApp).slice(0, 100)}`);
    const account = {
      server: process.env.DASHA_SERVER,
      apiKey: process.env.DASHA_APIKEY,
    };

    const app = await dasha.deploy(zippedApp, {
      account: account,
    });

    await app.start({ concurrency });
    app.setExternal("close_conversation", async (args) => {
      const { conversationId } = args;
      this.emit("close-dasha-conversation", { conversationId });
    });
    app.setExternal("process_user_text", async (args) => {
      const { conversationId, userText } = args;
      return responseFunction(conversationId, userText);
    });
    return app;
  }
}
