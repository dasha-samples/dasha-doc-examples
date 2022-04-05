const ExternalService = require("./external-service");
const DashaApplication = require("./dasha-application");


const DASHA_CONCURRENCY = 2;

// test conversation inputs
const testConversations = [
  { endpoint: "79513628606" },
];

async function main() {
  const externalService = new ExternalService();
  const dashaApplication = new DashaApplication();

  /* prepare dashaApplication */

  /* start both applications */
  await dashaApplication.start(DASHA_CONCURRENCY);
  await externalService.start();

  /* define external functions for dsl */
  dashaApplication.app.setExternal("check_new_events", (args) => {
    const { conversation_id } = args;
    return externalService.getNewEvents(conversation_id);
  });
  dashaApplication.app.setExternal("send_user_input", (args) => {
    const { conversation_id, user_input } = args;
    externalService.processUserInput(conversation_id, user_input);
  });
  dashaApplication.app.setExternal("close_conversation", (args) => {
    const { conversation_id } = args;
    externalService.closeConversation(conversation_id);
  });
  /* configure conversation execution handler */
  dashaApplication.app.queue.on("ready", async (conversationId, conv, info) => {
    console.log(`Conv ${conversationId} is ready`);

    conv.on("transcription", (transcription) => {
      console.log(transcription);
      if (transcription.speaker == "human") {
        externalService.processUserInput(conversationId, transcription.text);
      }
    });

    // pass same input to Dasha along with conversation_id which is used to discern conversations in external service
    const input = externalService.getConversationInput(conversationId);
    conv.input = { ...input, conversation_id: conversationId };
    await conv.execute();
    externalService.closeConversation(conversationId);
  });

  for (const input of testConversations) {
    const conversationId = externalService.initConversation(input);
    // enqueue dasha conversation with the same conversationId
    dashaApplication.enqueue(conversationId);
    // call async method to start conversation
    externalService.executeConversation(conversationId);
  }
  // await dashaApplication.stop();
  // await dashaApplication.dispose();
}

main().catch((e) => {
  console.log(`Error: ${e.message}`);
});

// const dasha = require("@dasha.ai/sdk");

// async function main() {
//   if (process.argv[2] === undefined)
//     throw new Error("Please, provide your phone or 'chat' as parameter");
//   // deploy and start application located at .dashaapp file path
//   const app = await dasha.deploy("./app");
//   await app.start({ concurrency: 1 });
//   // create conversation with provided phone
//   const endpoint = process.argv[2];
//   const conv = app.createConversation({
//     endpoint: endpoint,
//   });
//   const isChat = endpoint === "chat";
//   // if starting with phone, set handler for audio transcriptions to show them on the screen
//   if (!isChat) conv.on("transcription", console.log);
//   // if starting as chat, create chat for current conversation
//   if (isChat) dasha.chat.createConsoleChat(conv);
//   // execute conversation with corresponding channel
//   const result = await conv.execute({ channel: isChat ? "text" : "audio" });
//   console.log("conversation result", result.output);

//   await app.stop();
//   app.dispose();
// }
