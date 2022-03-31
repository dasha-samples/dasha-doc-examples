const dasha = require("@dasha.ai/sdk");
const fs = require("fs")

async function main() {
  if (process.argv[2] === undefined)
    throw new Error("Please, provide your phone or 'chat' as parameter");
  // deploy application located at .dashaapp file path
  const app = await dasha.deploy("./app");
  // start the application with default parameters
  await app.start();
  // create conversation with provided phone
  const endpoint = process.argv[2];

  // set conversation input
  const input = {endpoint:endpoint};
  const conv = app.createConversation(input);

  const isChat = endpoint === "chat";
  // if starting with phone, set handler for audio transcriptions to show them on the screen
  if (!isChat) conv.on("transcription", console.log);
  // if starting as chat, create chat for current conversation
  if (isChat) dasha.chat.createConsoleChat(conv);
  // execute conversation with corresponding channel
  const result = await conv.execute({ channel: isChat ? "text" : "audio" });
  console.log("conversation output", result.output);
  console.log("conversation transcription", result.transcription);
  if (!isChat) {
    console.log("conversation begin time", result.startTime);
    console.log("conversation end time", result.endTime)
    console.log("conversation duration", result.endTime - result.startTime)
    console.log("conversation record", result.recordingUrl)
  }
  
  await app.stop();
  app.dispose();
}

main().catch((e) => {
  console.log(`Error: ${e.message}`);
});
