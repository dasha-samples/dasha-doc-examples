const dasha = require("@dasha.ai/sdk");
const fs = require("fs");

fs.appendFileSync("tr-log.txt", `\n`)
const transcriptionHandler = (msg) => {
  const color = {
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    green: (text) => `\x1b[92m${text}\x1b[0m`,
    bright: (text) => `\x1b[1m${text}\x1b[0m`,
    yellow: text => `\x1b[93m${text}\x1b[0m`
  }
  if (msg.speaker === "ai") {
    console.log(`${color.bright("[AI]")}    ${color.yellow(msg.text)}`);
    fs.appendFileSync("tr-log.txt", `[AI]    ${msg.text}\n`)
  } else {
    console.log(`${color.bright("[Human]")} ${color.green(msg.text)}`);
    fs.appendFileSync("tr-log.txt", `[Human] ${msg.text}\n`)
  }
}

fs.appendFileSync("dev-log.txt", `\n`)
const debuglogHandler = (msg) => {
  if (msg.msg.msgId === "RecognizedSpeechMessage" && msg.incoming === true) {
    fs.appendFileSync("dev-log.txt", `${JSON.stringify(msg, null, 2)}\n`)
  }
}

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

  
  conv.on("transcription", transcriptionHandler);
  conv.on("debugLog", debuglogHandler);
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
