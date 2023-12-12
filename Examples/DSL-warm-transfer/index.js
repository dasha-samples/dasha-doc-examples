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

  commander
  .command("in")
  .description("check calls to Dasha")
  .option("-pi --phone_interlocutor <phone>", "phone or SIP URI to interlocutor the call to", "null")
  .option("-v --verbose", "Show debug logs")
  .action(async ({ phone_interlocutor, verbose }) => {
    if (phone_interlocutor === "null") phone_interlocutor = null;
    const app = await dasha.deploy("./app", { groupName: "Default" });
    app.queue.on("ready", async (id, conv, info) => {
      if (info.sip !== undefined)
        console.log(`Captured sip call: ${JSON.stringify(info.sip)}`);
      conv.input = { phone: "", phone_interlocutor: phone_interlocutor };
      if (verbose === true) {
        conv.on("debugLog", console.log);
      }
      conv.audio.tts = "dasha";
      await conv.execute();
    });

    await app.start();

    console.log("Waiting for calls via SIP");
    const config = (await dasha.sip.inboundConfigs.listConfigs())[
      "warm-transfer-test-app"
    ];
    if (config?.applicationName === "warm-transfer-test-app") {
      console.log(config?.uri);
    }
    console.log("Press Ctrl+C to exit");
    console.log(
      "More details: https://docs.dasha.ai/en-us/default/tutorials/sip-inbound-calls/"
    );
    console.log("Or just type:");
    console.log(
      "dasha sip create-inbound --application-name warm-transfer-test-app warm-transfer-test-app"
    );
    console.log("And call to sip uri returned by command above");
  });

commander.parseAsync();
