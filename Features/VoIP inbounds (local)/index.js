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

  // log some information about sip uri - it can also be got in CLI
  console.log("Waiting for calls via SIP");
  const config = (await dasha.sip.inboundConfigs.listConfigs())[
    "dasha-voip-inbound-local-demo"
  ];
  if (config?.applicationName === "dasha-voip-inbound-local-demo") {
    console.log("URI to call:", config?.uri);
  }
  console.log("Press Ctrl+C to exit");
  console.log(
    "More details: https://docs.dasha.ai/en-us/default/tutorials/sip-inbound-calls/"
  );
}

main();

// dasha sip create-inbound --application-name dasha-voip-inbound-local-demo dasha-voip-inbound-local-demo

// {
//  "applicationName": "dasha-voip-inbound-local-demo",
//  "priority": 0,
//  "groupName": "Default",
//  "uri": "sip:8e988902-a333-4527-b434-c319526ca78b@sip.us.dasha.ai"
// }
