const commander = require("commander");
const dasha = require("@dasha.ai/sdk");

commander
  .command("out")
  .description("check calls from Dasha")
  .requiredOption("-p --phone <phone>", "phone or SIP URI to call to")
  .option("-c --config <name>", "SIP config name", "default")
  .option("-pi --phone_interlocutor <phone>", "phone or SIP URI to interlocutor the call to", "null")
  .option("-v --verbose", "Show debug logs in console")
  .action(async ({ phone, config, phone_interlocutor, verbose }) => {
    if (phone_interlocutor === "null") phone_interlocutor = null;

    const app = await dasha.deploy("./app");  
    await app.start();

    const conv = app.createConversation({ phone, phone_interlocutor: phone_interlocutor });
    conv.on("transcription", console.log);
    if (verbose) {
      conv.on("debugLog", console.log);
    }
    conv.audio.tts = "dasha";
    conv.sip.config = config;

    await conv.execute();

    await app.stop();
    app.dispose();
  });

commander.parseAsync();
