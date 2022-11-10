const dasha = require("@dasha.ai/sdk");
const AudioProvider = require("./AudioProvider");

/** Apply audioProvider to Dasha application */
function applyCustomeTtsToApp(audioProvider, app) {
  app.customTtsProvider = async (text, voice) => {
    console.log(`Got resource request for ${JSON.stringify({ text, voice })}`);
    /** get audio file path for provided text and voice */
    const fname = audioProvider.getAudioResourcePath(text, voice);
    console.log(`Found audio resource for "${text}" in file ${fname}`);
    /** read file and send it as response */
    return dasha.audio.fromFile(fname);
  };
}

async function main() {
  if (process.argv[2] === undefined)
    throw new Error("Please, provide your phone or 'chat' as parameter");
  const endpoint = process.argv[2];

  /** prepare audio resource */
  const audioProvider = AudioProvider.create(["audio-resources-config.json"]);
  console.log("Successfully loaded audio resource config")
  console.log(audioProvider.resources)

  // deploy and start application located at .dashaapp file path
  const app = await dasha.deploy("./app");

  applyCustomeTtsToApp(audioProvider, app);

  await app.start({ concurrency: 1 });
  // create conversation with provided endpoint
  const conv = app.createConversation({
    endpoint: endpoint,
  });
  conv.audio.tts = "custom";
  conv.on("transcription", console.log);
  // execute conversation with corresponding channel
  const result = await conv.execute({ channel: "audio" });
  console.log("conversation result", result.output);

  await app.stop();
  app.dispose();
}

main().catch((e) => {
  throw e;
});
