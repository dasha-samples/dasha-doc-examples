const dasha = require("@dasha.ai/sdk");

class DashaApplication {
  constructor(server, apiKey) {
    this.server = server;
    this.apiKey = apiKey;
  }

  async start(concurrency) {
    const app = await dasha.deploy("./app", {
      account: { server: this.server, apiKey: this.apiKey },
    });
    await app.start({ concurrency: concurrency });
    this.app = app;
  }
  async stop() {
    await this.app.stop();
  }
  async dispose() {
    await this.app.dispose();
  }
  async enqueue(conversationId) {
    this.app.queue.push(conversationId);
  }
}

module.exports = DashaApplication;
