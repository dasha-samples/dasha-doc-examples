const dasha = require("@dasha.ai/sdk");

async function main() {
  const app = await dasha.deploy("./app");
  await app.start({ concurrency: 1 });
  const conv = app.createConversation({
    phone: process.argv[2] ?? "",
  });

  const isChat = conv.input.phone === "chat";
  if (!isChat) conv.on("transcription", console.log);
  if (isChat) dasha.chat.createConsoleChat(conv);
  const result = await conv.execute({ channel: isChat ? "text" : "audio" });

  console.log("conversation result", result.output);
  await app.stop();
  app.dispose();
}

main().catch((e) => {
  console.log(`Error: ${e.message}`);
});
