const dasha = require("@dasha.ai/sdk");
const axios = require("axios")

class DashaApplication {
  constructor(server, apiKey, externalApiUrl) {
    this.server = server;
    this.apiKey = apiKey;
    this.externalApiUrl = externalApiUrl;
  }

  async start(concurrency) {
    const app = await dasha.deploy("./app", {
      account: { server: this.server, apiKey: this.apiKey },
    });
    await app.start({ concurrency: concurrency });
    app.setExternal("close_conversation", async (args) => {
        const {conversation_id} = args;
        await axios.post(`${this.externalApiUrl}/close_conversation/${conversation_id}`);
    })
    app.setExternal("process_user_text", async (args) => {
        const {conversation_id, user_text} = args;
        const res = await axios.post(`${this.externalApiUrl}/process_user_input/${conversation_id}`, {user_text});
        const {ai_response} = res.data
        return ai_response;
    })
    this.app = app;
  }

  async execute(conversation_id, aor, conversationInput) {
    const dashaConversationInput = {endpoint: aor, conversation_id, ...conversationInput};
    const conv = this.app.createConversation(dashaConversationInput);
    conv.audio.noiseVolume = 0;
    conv.audio.tts = "dasha";
    await conv.execute({ channel: "audio" });
    await axios.post(`${this.externalApiUrl}/close_conversation/${conversation_id}`)
  }

  async stop() {
    await this.app.stop();
  }

  async dispose() {
    this.app.dispose();
  }
}

module.exports = DashaApplication;
