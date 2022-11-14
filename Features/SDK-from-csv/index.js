import dasha from "@dasha.ai/sdk";
import CsvRunner from "./CsvRunner.js";
import inputSchema from "./inputSchema.js";
import outputSchema from "./outputSchema.js";

async function main() {
  const app = await dasha.deploy("./app");

  const csvRunner = new CsvRunner(app, inputSchema, outputSchema);
  await app.start({ concurrency: 1 });

  const promises = [
    csvRunner.runCsv("./test-input.csv", "test-output.csv"),
    csvRunner.runCsv("./test-input2.csv", "test-output2.csv"),
  ];
  await Promise.all(promises);

  await app.stop();
  app.dispose();
}

main().catch((e) => {
  throw e;
});
