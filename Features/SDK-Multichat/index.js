const dasha = require("@dasha.ai/sdk");
const readline = require("readline");
async function main() {
  const app = await dasha.deploy(`${__dirname}/app`);

  app.setExternal("set_denominator", (args, conv) => {
    console.log("set_denominator", args);
    conv.denominator = args.den;
    return "ok";
  });

  app.setExternal("get_division_result", (args, conv) => {
    console.log("get_division_result", args);
    return Math.trunc(conv.input.numerator / conv.denominator);
  });

  await app.start();

  const conv = app.createConversation({
    phone: process.argv[2] ?? "",
    username: "veneamin",
    numerator: Math.round(Math.random() * 42 + 10),
  });

  if (conv.input.phone) {
    conv.on("transcription", console.log);
  } else {
    const chat = await dasha.multichannelChat.createMultichannelChat(conv);
    const interface = readline.createInterface(process.stdin);
    const chats = [];
    interface.on("line", (text) => {
      try{
        const msg = text.split(':').map(x=>x.trim());
        console.log(msg);
        console.log(chats);
        const chatId = parseInt(msg[0]);
        if(chats.length <= chatId) console.warn(`No chat with this id`);
        else chats[chatId].sendText(msg[1]).catch((error) => chatChannel.emit("error", error));
      }
      catch(ex)
      {
        console.log(ex);
      }
    });

    chat.on("open", async (endpoint, channelId) => {
      const chatChannel = await chat.sendOpen(channelId);
      console.log(`opened ${chats.length} chat with id ${channelId}, endpoint ${endpoint}`);
      chats.push(chatChannel);

      console.log("chat started");

      chatChannel.on("text", (text) => console.log(`AI: ${text}`));
      chatChannel.on("close", () => {
        console.log("chat close");
      });
      chatChannel.on("closed", () => {
        console.log("chat closed");
      });
    }
    )
  }

  const result = await conv.execute({ channel: conv.input.phone ? "audio" : "text" });

  console.log(result.output);

  await app.stop();
  app.dispose();
}

main().catch(() => { });
