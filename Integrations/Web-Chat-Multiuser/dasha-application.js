const dasha = require("@dasha.ai/sdk");

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

class AsyncTask {
  constructor() {
      this.promise = new Promise((resolve, reject) => {
          this.resolve = resolve
          this.reject = reject
      })
   }
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
    const openingTask = new AsyncTask();
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
      // while (!isOpened) {
      //   socket.emit("debug", "waiting for the opened...")
      //   await delay(100)
      // }
      console.log(convId, "Got interrupt request");
      await openingTask;
      await chat.close();
      await conv.removeAllListeners();
      await conv.off();
      socket.emit("system-conv-interrupted", {convId})
    });
    socket.on("disconnect", async (s) => {
      console.log(`closing conversation for user '${socket.id}'`);
      await chat.close();
      await conv.removeAllListeners();
      await conv.off();
    });
    conv.on("debugLog", async (debugLog) => {
      if (debugLog?.msg?.msgId === "OpenedSessionChannelMessage") {
        await delay(100);
        openingTask.resolve();
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
