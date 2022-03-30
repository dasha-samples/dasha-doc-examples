const dasha = require("@dasha.ai/sdk");

async function main() {
  if (process.argv[2] === undefined)
    throw new Error("Please, provide your phone or 'chat' as parameter");
  // deploy and start application located at .dashaapp file path
  const app = await dasha.deploy("./app");
  await app.start({ concurrency: 1 });
  // create conversation with provided phone
  const endpoint = process.argv[2];
  const conv = app.createConversation({
    endpoint: endpoint,
  });
  const isChat = endpoint === "chat";
  // if starting with phone, set handler for audio transcriptions to show them on the screen
  if (!isChat) conv.on("transcription", console.log);
  // if starting as chat, create chat for current conversation
  if (isChat) dasha.chat.createConsoleChat(conv);
  // execute conversation with corresponding channel
  const result = await conv.execute({ channel: isChat ? "text" : "audio" });
  console.log("conversation result", result.output);
  
  await app.stop();
  app.dispose();
}

main().catch((e) => {
  console.log(`Error: ${e.message}`);
});
