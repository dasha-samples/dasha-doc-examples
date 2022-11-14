const dasha = require("@dasha.ai/sdk");
const AudioProvider = require("./AudioProvider");

async function main() {
  if (process.argv[2] === undefined)
    throw new Error("Please, provide your phone or 'chat' as parameter");
  const endpoint = process.argv[2];

  /** prepare audio resource */
  const audioProvider = AudioProvider.create(["audio-resources-config.json"]);
  console.log("Successfully loaded audio resource config")

  /** deploy and start application located at .dashaapp file path */
  const app = await dasha.deploy("./app");
  /** use audioProvider as custom tts handler */
  audioProvider.applyToApp(app);
  await app.start({ concurrency: 1 });

  /** create conversation with provided endpoint */
  const conv = app.createConversation({
    endpoint: endpoint,
  });
  /** use custom tts handler for this conversation */
  conv.audio.tts = "custom";
  conv.on("transcription", console.log);

  /** execute conversation with corresponding channel */
  const result = await conv.execute({ channel: "audio" });
  console.log("conversation result", result.output);

  await app.stop();
  app.dispose();
}

main().catch((e) => {
  throw e;
});
