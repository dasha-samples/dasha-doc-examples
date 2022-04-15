const dasha = require("@dasha.ai/sdk");
const zipApplication = require("./zip-application");

async function main() {
  const appZip = await zipApplication("example-app/app");
  const app = await dasha.deploy(appZip);

  await app.start({ concurrency: 1 });
  const endpoint = "chat";
  const conv = app.createConversation({
    endpoint: endpoint,
  });
  await dasha.chat.createConsoleChat(conv);
  const result = await conv.execute({ channel: "text" });
  console.log("conversation result", result.output);

  await app.stop();
  app.dispose();
}

main().catch((e) => {
  console.log(e);
});
