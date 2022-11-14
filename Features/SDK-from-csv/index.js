import dasha from "@dasha.ai/sdk"
import CsvRunner from "./CsvRunner.js"
import inputSchema from "./inputSchema.js"
import outputSchema from "./outputSchema.js"


async function main() {  
  const csvAdapter = CsvRunner.create("./test-input.csv", "test-output.csv");
  const app = await dasha.deploy("./app");
  app.queue.push()

  await csvAdapter.applyToApp(app, inputSchema, outputSchema);
  await app.start({ concurrency: 1 });

  const r = await csvAdapter.executeAllConversations();
  console.log(r);

  await app.stop();
  app.dispose();
}

main().catch((e) => {
  throw e
});
