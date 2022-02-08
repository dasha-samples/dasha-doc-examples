const dasha = require("@dasha.ai/sdk");
const fs = require("fs/promises");

// wrapped synthesize function with default tts parameters
async function synth(text, voice = {}, options = {}) {
  const defaultVoice = {
    lang: "en-US",
    speaker: "default",
    emotion: "neutral",
    speed: 1,
    variation: 0,
  };
  const defaultOptions = {
    providerName: "default",
  };
  // synthesize request
  const content = await dasha.tts.synthesize(
    text,
    { ...defaultVoice, ...voice },
    { ...defaultOptions, ...options }
  );
  return content;
}

async function main() {
  const outputFile = "output.wav"; // path to output file

  await fs.writeFile(outputFile, Buffer.from(""));
  let voice = {};
  let options = {};
  let text = "";

  text =
    "Hello. This is the demonstration of Dasha text-to-speech service." +
    "This is the default speaker with default voice paremeters. " +
    "We are going to describe all the parameters one by one. " +
    "They will be switched them for you to see the difference. " +
    "First of all let's change the speed parameter." +
    "The default value is 1." +
    "Now let's see how the speech of speed 0.8 sounds.";
  // synthesize text and add synthesized data to file
  await fs.appendFile(outputFile, await synth(text));
  console.log("Synthesized initial text");

  text =
    "As you can see, this speech is slowed down." +
    "Sounds different, right?" +
    "We are going to stay at the speed value equal to 0.8 until the end of this demo." +
    "The next parameter is speaker." +
    "The speaker parameter provides the name of our preptrained speaker." +
    "The default speaker is Kate." +
    "Now it will be changed to Linda.";
  voice = { ...voice, speed: 0.8 };
  await fs.appendFile(outputFile, await synth(text, voice));
  console.log("Synthesized speed text");

  text =
    "Hi, my name is Linda." +
    "I hope you are doing well." +
    "Next we are going to change the emotion of synthesized speech." +
    "The default emotion value is neutral." +
    "To set emotion parameter you have to provide sample sentence that expresses this emotion." +
    "Note that emotion synthezis requires provider name to be set to dasha-emotional." +
    "To show you the difference between emotions there will be two examples with emotions.. sadness.. and.. love.";
  voice = { ...voice, speaker: "Linda" };
  await fs.appendFile(outputFile, await synth(text, voice));
  console.log("Synthesized different speaker text");

  text =
    "This is sentence with emotion extracted from sentence sample. I love you ..." +
    "Sounds lovely to me. Hope it sounds lovely to you as well. I consider the glass to be half full...";
  voice = { ...voice, emotion: "from text: I love you" };
  options = { providerName: "dasha-emotional" };
  await fs.appendFile(outputFile, await synth(text, voice, options));
  console.log("Synthesized lovely emotion");
  text =
    "This is sentence with emotion extracted from sentence sample. Sadness and tears ..." +
    "Sounds sad.. This is the end, my only friend.. I think the glass is half empty...";
  voice = { ...voice, emotion: "from text: sadness and tears" };
  await fs.appendFile(outputFile, await synth(text, voice, options));
  console.log("Synthesized sad emotion");

  text =
    "Let's get back to neutral emotion ..." +
    "The final parameter is the variation." +
    "The default variation value is 0." +
    "We are going to change the variation to 50." +
    "This is the sentence with 0 variation.";
  voice = { ...voice, emotion: "neutral" };
  await fs.appendFile(outputFile, await synth(text, voice));
  voice = { ...voice, variation: 50 };
  text =
    "And now." +
    "This is the sentence with 50 variation." +
    "The intonations became different.";
  await fs.appendFile(outputFile, await synth(text, voice));
  console.log("Synthesized variation");

  text =
    "That's it, we've observed all the parameters." +
    "Thank you and have a nice day!";
  voice = { ...voice, variation: 0 };
  await fs.appendFile(outputFile, await synth(text, voice));
  console.log("Synthesized final text");
}

main();
