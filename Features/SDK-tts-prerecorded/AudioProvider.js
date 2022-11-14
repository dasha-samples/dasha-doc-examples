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
    /** set AudioProvider.handleTtsRequest method as tts provider for dasha application */
    app.customTtsProvider = this.handleTtsRequest;
  } 

  /**
   * Handles tts request from dasha runtime application
   * @param {string} text phrase text
   * @param {object} voiceInfo phrase voice information: lang, speaker, emotion, speed, variation
   * @returns dasha.audio.Audio object of a resource file.
   */
  async handleTtsRequest(text, voiceInfo) {
    console.log(`Got resource request for ${JSON.stringify({text, voiceInfo})}`);
    /** get audio file path for provided text and voiceInfo */
    const fname = this.getAudioResourcePath(text, voiceInfo);  
    console.log(`Found audio resource for "${text}" in file ${fname}`);
    /** read file and send it as response */
    return dasha.audio.fromFile(fname);
  };

  /**
   * Build key for phrase audio resource
   * @param {string} text 
   * @param {object} voiceInfo 
   * @returns string that is unique for provided text and voiceInfo
   */
  getResourceKey(text, voiceInfo) {
    voiceInfo = { ...defaultVoiceInfo, ...voiceInfo };
    for (const prop of Object.keys(defaultVoiceInfo)) {
      if (voiceInfo[prop] === undefined) {
        throw new Error(
          `Could not create resource key for ${JSON.stringify({text, voiceInfo})}: ` + 
          `provided oice info does not have property '${prop}'`
        )
      }
    }
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
    /** if provided argument is a string, it is considered as path to config */
    let audioConfig = undefined;
    let isPath = false;
    if (typeof audioConfigOrPath === "string") {
      audioConfig = JSON.parse(fs.readFileSync(audioConfigOrPath));
      isPath = true;
    } else {
      audioConfig = audioConfigOrPath;
    }

    const errors = [];
    const pharses = audioConfig.phrases ?? [];
    let i = 0;
    /** walk through the phrase descriptions in config, validate them and save if they are ok */
    for (const phrase of pharses) {
      i++;
      /** validate phrase description */
      if (phrase.phrase === undefined) {
        errors.push(`Phrase ${i}/${pharses.length} does not have property 'phrase'`);
        continue;
      }
      const phraseShort = phrase.phrase.length < 20 ? phrase.phrase : `${phrase.phrase.slice(0, 10)}...`;
      if (phrase.audio === undefined) {
        errors.push(`Phrase ${i}/${pharses.length} "${phraseShort}" does not have property 'audio'`);
        continue;
      }
      /** check audio resource exists */
      let audioFilePath = phrase.audio;
      if (isPath) {
        /** if config was provided as a path, resolve path to audio file */
        audioFilePath = path.join(path.dirname(path.resolve(audioConfigOrPath)), audioFilePath);
      }
      if (!fs.existsSync(audioFilePath)) {
        errors.push(`Phrase ${i}/${pharses.length} "${phraseShort}" file not found in path '${audioFilePath}'`);
        continue;
      }
      const voiceInfo = { ...audioConfig.voice, ...phrase.voice };
      /** build phrase key */
      const resourceKey = this.getResourceKey(phrase.phrase, voiceInfo);
      if (resourceKey in this.resources) {
        /** duplicate is not considered as an error */
        console.warn(
          `Skipping ${i}/${pharses.length} phrase "${phraseShort}" because it duplicates previous phrase`
        );
        continue;
      }
      this.resources[resourceKey] = audioFilePath;
    }
    /** if there were any invalid phrases, throw an error all the issues */
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

  /**
   * Get saved audio resource path for provided text and voice info.
   */
  getAudioResourcePath(text, voiceInfo) {
    /** build key */
    const key = this.getResourceKey(text, voiceInfo);
    const resourcePath = this.resources[key];
    /** check if key is valid */
    if (resourcePath === undefined)
      throw new Error(`Failed to get resource path for key '${key}'`);
    return resourcePath;
  }
  /** Get path to audio resource, read and return audio */
  getAudioResource(text, voiceInfo) {
    const resourcePath = this.getAudioResourcePath(text, voiceInfo);
    return fs.readFileSync(resourcePath);
  }
}

module.exports = AudioProvider;
