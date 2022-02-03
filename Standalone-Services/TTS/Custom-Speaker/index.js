const dasha = require("@dasha.ai/sdk");
const fs = require("fs/promises");

async function main() {
  const speakerName = "my-test-tts-speaker"; // name of the speaker in tts service
  const speakerSampleFile = "Rudyard Kipling (1930s).wav"; // path to file with voice sample
  const outputFile = "output.wav"; // path to output file

  // create speaker with provided voice sample
  const speakerSampleContent = await fs.readFile(speakerSampleFile);
  const createdSpeaker = await dasha.tts.addOrUpdateCustomSpeakerByName(
    speakerName,
    speakerSampleContent
  );
  console.log("Speaker created");
  // read existing speaker (just to demonstrate the api)
  const isSaved =
    createdSpeaker.name ===
    (await dasha.tts.getCustomSpeakerByName(speakerName)).name;
  console.log("Speaker found:", isSaved);

  // use speaker for tts + voice-cloning
  const text =
    "If you can keep your head when all about you ... \n" +
    "Are losing theirs and blaming it on you, ... \n" +
    "If you can trust yourself when all men doubt you, ... \n" +
    "But make allowance for their doubting too ...";
  // configure synthesize parameters
  const voice = {
    lang: "en-US",
    speaker: createdSpeaker.name,
    emotion: "neutral",
    speed: 0.9,
    variation: 50,
  };
  // request synthesize text
  const synthesizedContent = await dasha.tts.synthesize(text, voice, {
    providerName: "voice-cloning",
  });
  // save synthesized data to file
  await fs.writeFile(outputFile, synthesizedContent);
  console.log("Synthesized text saved to", outputFile);

  // delete speaker
  await dasha.tts.deleteCustomSpeakerByName(speakerName);
  console.log("Speaker deleted");
}

main();
