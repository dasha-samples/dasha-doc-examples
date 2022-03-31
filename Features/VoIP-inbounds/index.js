const dasha = require("@dasha.ai/sdk");

async function main() {
  // deploy and start application located at .dashaapp file path
  // also note the explicit providing groupName here
  const app = await dasha.deploy("./app", { groupName: "Default" });
  app.queue.on("ready", async (id, conv, info) => {
    if (info.sip !== undefined)
      console.log(`Captured sip call: ${JSON.stringify(info.sip)}`);
    console.log(info);
    // set the conversation inputs
    conv.input = { endpoint: "" };
    conv.on("transcription", console.log);
    // execute conversation and log its output
    const result = await conv.execute();
    console.log("conversation result", result.output);
  });

  // start app that waits for incoming calls
  await app.start();

  // log some information about sip uri
  // it can also be got by Dasha CLI using `dasha sip list-inbound`
  console.log("Waiting for calls via SIP");
  // name of the using app
  const appName = "dasha-voip-inbound-local-demo";
  // find config for this app
  const config = Object.values(await dasha.sip.inboundConfigs.listConfigs()).filter(c => c.applicationName === appName)[0];
  if (config === undefined) throw new Error(`Could not find config for application ${appName}`)
  console.log("URI to call:", config?.uri)
  console.log("Press Ctrl+C to exit");
}

main();
