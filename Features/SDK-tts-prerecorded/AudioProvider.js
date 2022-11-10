const fs = require("fs");
const path = require("path");
const dasha = require("@dasha.ai/sdk");


const defaultVoiceInfo = {
  lang: undefined,
  speaker: "default",
  emotion: "Neutral",
  speed: 1,
  variation: 0,
};

class AudioProvider {
  constructor() {
    this.resources = {};
  }

  /**
   * Create instance of AudioProvider
   * @param {string[]|object[]} audioConfigsOrPaths audio resource configs or paths to files with configs
   * @returns instance of AudioProvider
   */
  static create(audioConfigsOrPaths){
    const audioProvider = new AudioProvider();
    audioProvider.loadConfigs(audioConfigsOrPaths);
    return audioProvider;
  }

  /** Apply audioProvider to Dasha application */
  applyToApp(app) {
    app.customTtsProvider = async (text, voice) => {
      console.log(`Got resource request for ${JSON.stringify({text, voice})}`);
      /** get audio file path for provided text and voice */
      const fname = this.getAudioResourcePath(text, voice);  
      console.log(`Found audio resource for "${text}" in file ${fname}`);
      /** read file and send it as response */
      return dasha.audio.fromFile(fname);
    };
  } 

  /**
   * Build key for phrase audio resource
   */
  getResourceKey(text, voiceInfo) {
    voiceInfo = { ...defaultVoiceInfo, ...voiceInfo };
    return [
      voiceInfo.lang,
      voiceInfo.speaker,
      voiceInfo.emotion,
      voiceInfo.speed,
      voiceInfo.variation,
      text,
    ].join("|");
  }

  /**
   * Load and validate audio resource config.
   * @param {string[]|object[]} audioConfigOrPath audio resource config or path to file with config
   */  
  loadConfig(audioConfigOrPath) {
    let audioConfig = undefined;
    let isPath = false;
    if (typeof audioConfigOrPath === "string") {
      audioConfig = JSON.parse(fs.readFileSync(audioConfigOrPath));
      isPath = true;
    } else {
      audioConfig = audioConfigOrPath;
    }
    const resourcePath = audioConfig.resource_path;
    if (resourcePath === undefined) {
      throw Error(`Audio config does not have property 'resource_path'`);
    }
    const errors = [];
    const pharses = audioConfig.phrases ?? [];
    let i = 0;
    for (const phrase of pharses) {
      i++;
      /** validate phrase description */
      if (phrase.phrase === undefined) {
        errors.push(
          `Phrase ${i}/${pharses.length} does not have property 'phrase'`
        );
        continue;
      }
      const phraseShort = phrase.phrase.length < 20 ? phrase.phrase : `${phrase.phrase.slice(0, 10)}...`;
      if (phrase.audio === undefined) {
        errors.push(
          `Phrase ${i}/${pharses.length} "${phraseShort}" does not have property 'audio'`
        );
        continue;
      }
      /** check audio resource exists */
      let audioFilePath = phrase.audio;
      if (isPath) {
        path.
        audioFilePath = path.join(path.dirname(path.resolve(audioConfigOrPath)), audioFilePath);
      }
      
      if (!fs.existsSync(audioFilePath)) {
        errors.push(
          `Phrase ${i}/${pharses.length} "${phraseShort}" file not found in path '${audioFilePath}'`
        );
        continue;
      }
      const voiceInfo = { ...audioConfig.voice, ...phrase.voice };
      /** build phrase key */
      const resourceKey = this.getResourceKey(phrase.phrase, voiceInfo);
      if (resourceKey in this.resources) {
        /** duplicate is not an error */
        console.warn(
          `Skipping ${i}/${pharses.length} phrase "${phraseShort}" because it duplicates previous phrase`
        );
        continue;
      }
      this.resources[resourceKey] = audioFilePath;
    }
    if (errors.length > 0) {
      throw new Error(
        `Could not load audio resources config. Errors: [${errors
          .map((e) => `'${e}'`)
          .join("\n")}]`
      );
    }
  }

  /**
   * Load and validate audio resource configs.
   * Each audio resource config contains information about audio resources: voice info, phrase descriptions, etc.
   * @param {*} audioConfigsOrPaths audio resource configs or paths to files with configs
   */
  loadConfigs(audioConfigsOrPaths) {
    for (const audioConfigOrPath of audioConfigsOrPaths) {
      this.loadConfig(audioConfigOrPath);
    }
  }

  getAudioResourcePath(text, voiceInfo) {
    const key = this.getResourceKey(text, voiceInfo);
    const resourcePath = this.resources[key];
    if (resourcePath === undefined)
      throw new Error(`Failed to get resource path for key '${key}'`);
    return resourcePath;
  }
  getAudioResource(text, voiceInfo) {
    const resourcePath = this.getAudioResourcePath(text, voiceInfo);
    return fs.readFileSync(resourcePath);
  }
}

module.exports = AudioProvider;
