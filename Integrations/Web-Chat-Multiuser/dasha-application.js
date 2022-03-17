const dasha = require("@dasha.ai/sdk");

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

class DashaApplication {
  constructor(server, apiKey) {
    this.server = server;
    this.apiKey = apiKey;
  }

  async start(concurrency) {
    const app = await dasha.deploy("./app", {
      groupName: "Default",
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

  async executeSingleConversation(socket, convId, input) {
    const conv = await this.app.createConversation(input);

    const chat = await dasha.chat.createChat(conv);
    let isOpened = false;
    chat.on("text", (text) => {
      socket.emit("ai-message", {text, convId});
    });
    chat.on("close", () => {
      socket.emit("system-conv-closed", {convId});
    });
    socket.on("user-message", async (data) => {
      if (convId !== data.convId)
        return;
      const {text} = data;
      await chat.sendText(text);
    });
    socket.on("system-interrupt-conv", async () => {
      while (!isOpened) {
        socket.emit("debug", "waiting for the opened...")
        await delay(100)
      }
      await chat.close();
      await conv.removeAllListeners();
      await conv.off();
      socket.emit("system-conv-interrupted", {convId})
    });
    conv.on("debugLog", async (debugLog) => {
      if (debugLog?.msg?.msgId === "OpenedSessionChannelMessage") {
        isOpened = true;
      }
    });

    const result = await conv.execute({ channel: "text" });
    socket.emit("system-conv-completed", {result, convId});
  }

  async enqueue(conversationId) {
    this.app.queue.push(conversationId);
  }
}

module.exports = DashaApplication;
