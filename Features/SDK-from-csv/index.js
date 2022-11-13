// const dasha = require("@dasha.ai/sdk");
// const CsvRunner = require("./CsvRunner")
import dasha from "@dasha.ai/sdk"
import CsvRunner from "./CsvRunner.js"
import inputSchema from "./inputSchema.js"


async function main() {  
  const csvAdapter = CsvRunner.create("./test-input.csv", "output.csv", inputSchema);
  const app = await dasha.deploy("./app");

  csvAdapter.applyToApp(app);
  await app.start({ concurrency: 1 });

  const r = await csvAdapter.executeAllConversations()
  console.log(r)
  

  await app.stop();
  app.dispose();
}

main().catch((e) => {
  throw e
});
