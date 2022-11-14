import dasha from "@dasha.ai/sdk"
import CsvRunner from "./CsvRunner.js"
import inputSchema from "./inputSchema.js"
import outputSchema from "./outputSchema.js"


async function main() {  
  const app = await dasha.deploy("./app");
  
  const csvAdapter = CsvRunner.create();
  await csvAdapter.applyToApp(app, inputSchema, outputSchema);
  await app.start({ concurrency: 1 });

  await csvAdapter.runCsv("./test-input.csv", "test-output.csv");
  console.log("finished csv");

  await app.stop();
  app.dispose();
}

main().catch((e) => {
  throw e
});
