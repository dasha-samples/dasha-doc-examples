const dasha = require("@dasha.ai/sdk");
// const commander = require("commander");

const program = require("commander");
program
.description("Call zoom meeting via Dasha. Provide your phone and meeting_id to join zoom meeting")
.arguments('<phone> [m_id] [p_id]')
.option("--m_id <m_id>", "Zoom meeting id")
.option("--p_id <p_id>", "Zoom participant id")
.action(async (phone, m_id, p_id, options) => {
  // console.log(options)
  meeting_id = m_id ?? options.m_id;
  participant_id = p_id ?? options.p_id;
  if (meeting_id === undefined) throw new Error("missing required argument 'm_id'")
  console.log("phone", phone)
  console.log("meeting_id", meeting_id)
  console.log("participant_id", participant_id)
  // console.log(options)

  const app = await dasha.deploy("./app");
  await app.start({ concurrency: 1 });
  // create conversation with provided phone
  const endpoint = process.argv[2];
  const conv = app.createConversation({
    endpoint: phone,
    meeting_id: meeting_id,
    participant_id: participant_id ?? null
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
})

program.parseAsync().catch((err) => {
  console.error(`Command execution failed (${err.message})`);
  process.exitCode = 1;
});

async function main() {
  console.log(process.argv[2])
  // return;
  if (process.argv[2] === undefined)
    throw new Error("Please, provide your phone as parameter");
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

// main().catch((e) => {
//   console.log(`Error: ${e.message}`);
// });
