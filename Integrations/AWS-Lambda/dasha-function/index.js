const dasha = require("@dasha.ai/sdk");

// const AWSXRay = require("aws-xray-sdk-core");
// const AWS = AWSXRay.captureAWS(require("aws-sdk"));

// // Create client outside of handler to reuse
// const lambda = new AWS.Lambda();

exports.handler = async function (event, context, callback) {
  console.log(`# Got event: ${JSON.stringify(event, null, 2)}`);

  checkEnvironment();
  const DASHA_SERVER = process.env.DASHA_SERVER;
  const DASHA_APIKEY = process.env.DASHA_APIKEY;
  const DASHA_CONCURRENCY = process.env.DASHA_CONCURRENCY;

  const appZip = new Uint8Array(Buffer.from(event.body.appZipBase64, 'base64'));
  const conversationInputs = event.body.conversationInputs;
  console.log(
    `# Got ${conversationInputs.length} conversation inputs: ${JSON.stringify(
      conversationInputs
    )}`
  );

  console.log(`# Deploying the application...`);
  const app = await dasha.deploy(appZip, {
    groupName: "Default",
    account: { server: DASHA_SERVER, apiKey: DASHA_APIKEY },
  });

  await app.start({ DASHA_CONCURRENCY });

  const results = []
  for (const inputIdx in conversationInputs) {
    console.log(`# Executing conversation ${Number(inputIdx) + 1}/${conversationInputs.length}...`);
    const input = conversationInputs[inputIdx];
    console.log(`# Input data: ${JSON.stringify(input)}`);
    const conversation = app.createConversation(input);
    try {
      const result = await conversation.execute();
      console.log(`# Got result: ${JSON.stringify(result)}`);
      results.push(result);
    } catch (e) {
      console.log(`# Conversation execution failed: ${e.message}`);
      results.push({failReason: e.message});
    }
  }
  return results;
};

function checkEnvironment() {
  console.log(
    `Checking environment variables DASHA_SERVER,DASHA_APIKEY,DASHA_CONCURRENCY to start the application...`
  );
  if (!process.env.DASHA_SERVER)
    throw new Error(
      `Environment variable DASHA_SERVER is required but is not set`
    );

  if (!process.env.DASHA_APIKEY)
    throw new Error(
      `Environment variable DASHA_APIKEY is required but is not set`
    );

  if (!process.env.DASHA_CONCURRENCY)
    throw new Error(
      `Environment variable DASHA_CONCURRENCY is required but is not set`
    );
  console.log(`Environment is ok.`);
}
