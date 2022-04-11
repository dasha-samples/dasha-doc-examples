import EventEmitter from "eventemitter3";
// import { Web } from "sip.js";
import axios from "axios";

// 

// const api = "http://localhost:8080";

// let aor;
// let sipUser;

const getSipData = async (api) => {
  const response = await fetch(`${api}/sip_connection`);
  const { aor, sipServerEndpoint } = await response.json();
  return { aor, sipServerEndpoint };
};

const createSipUser = async (aor, server) => {
  const user = new SIP.Web.SimpleUser(server, { aor });
  await user.connect();
  await user.register();
  return user;
};

// const hangupSipUser = async (user) => {
//   await user.hangup().catch(() => {});
// };

// // configure sip connection
// const sipData = await getSipData();
// console.log("sipData", sipData);
// aor = sipData.aor;
// sipUser = await createSipUser(sipData.aor, sipData.sipServerEndpoint);
// // configure web page multimedia and sipUser handlers
// const audio = new Audio();
// sipUser.delegate = {
//   onCallReceived: async () => {
//     await sipUser.answer();
//     audio.srcObject = sipUser.remoteMediaStream;
//     audio.play();
//     chatBox.addSystemMessage("Voice call started", chatBox.actualConvId);
//   },
//   onCallHangup: () => {
//     audio.srcObject = null;
//     chatBox.addSystemMessage("Voice call is over", chatBox.actualConvId);
//   },
// };

export class DashaVoiceWidget extends EventEmitter {
  constructor() {
      super();
    this.voiceServerApiUrl = undefined;
    this.sipUser = undefined;
    this.aor = undefined;
    this.sipServerEndpoint = undefined;
  }
  static async create(dashaVoiceServerApi) {
    const voiceWidget = new DashaVoiceWidget();

    const { aor, sipServerEndpoint } = await getSipData(dashaVoiceServerApi);
    const sipUser = await createSipUser(aor, sipServerEndpoint);
    const audio = new Audio();
    sipUser.delegate = {
      onCallReceived: async () => {
        await sipUser.answer();
        audio.srcObject = sipUser.remoteMediaStream;
        audio.play();
        voiceWidget.emit("sip-user-call-received");
      },
      onCallHangup: () => {
        audio.srcObject = null;
        voiceWidget.emit("sip-user-hangup");
      },
    };

    voiceWidget.voiceServerApiUrl = dashaVoiceServerApi;
    voiceWidget.aor = aor;
    voiceWidget.sipServerEndpoint = sipServerEndpoint;
    voiceWidget.sipUser = sipUser;
    return voiceWidget
  }
  async initSession(conversationId) {
    await axios.post(`${this.voiceServerApiUrl}/execute_conversation`, {
      aor: this.aor,
      conversationId,
    });
  }
  async hangup() {
    await this.sipUser.hangup().catch(() => {});
  }
}
