import dasha from "@dasha.ai/sdk";
import CsvRunner from "./CsvRunner.js";
import inputSchema from "./inputSchema.js";
import outputSchema from "./outputSchema.js";

async function main() {
  const app = await dasha.deploy("./app");

  const csvRunner = new CsvRunner(app, inputSchema, outputSchema);
  await app.start({ concurrency: 3 });

  const runCsvJobs = [
    csvRunner.runCsv("./input.csv", "test-output.csv", {
      configureConv: (conv) => {
        conv.sip.config = "default";
        conv.audio.tts = "default";
      },
      logDirectory: "logs",
    }),
    csvRunner.runCsv("./input2.csv", "test-output.csv"),
  ];
  await Promise.all(runCsvJobs);

  await app.stop();
  app.dispose();
  process.exit(0);
}

main().catch((e) => {
  throw e;
});
