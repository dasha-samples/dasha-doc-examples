import EventEmitter from "eventemitter3";
import axios from "axios";

const getSipData = async (api) => {
  const response = await axios.get(`${api}/sip_connection`);
  const { aor, sipServerEndpoint } = await response.data;
  return { aor, sipServerEndpoint };
};

const createSipUser = async (aor, server) => {
  const user = new SIP.Web.SimpleUser(server, { aor });
  await user.connect();
  await user.register();
  return user;
};

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
