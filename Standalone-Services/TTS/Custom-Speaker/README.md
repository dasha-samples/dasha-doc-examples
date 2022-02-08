# Text-To-Speach Service: Custom Speaker

The current example shows the use of Voice Cloning for creating custom speakers via [TTS API](https://docs.dasha.ai/en-us/default/sdk/node-js/modules/tts).

The [TTS API](https://docs.dasha.ai/en-us/default/sdk/node-js/modules/tts) allows you to [create, update](https://docs.dasha.ai/en-us/default/sdk/node-js/modules/tts#addorupdatecustomspeakerbyname), [get](https://docs.dasha.ai/en-us/default/sdk/node-js/modules/tts#getcustomspeakers) and [remove](https://docs.dasha.ai/en-us/default/sdk/node-js/modules/tts#deletecustomspeakerbyname) custom speaker that can be used for speech synthesis.
The created custom speakers are connected to your account and saved on our server.

To create your own custom speaker, you need to provide sample of speaker voice (wav or mp3 file).
> Note: the longer file means the better voice cloning so you should provide long enough sample.
The same goes for sample quality - you should provide sample with 16khz frequency or higher.

The `file contents` have to be read as bytes and provded to `addOrUpdateCustomSpeakerByName` function (along with the speaker's identifying `name`).

That's it. 
Now your speaker is available from your account and can be used for synthesis using the (`synthesize`)[https://docs.dasha.ai/en-us/default/sdk/node-js/modules/tts#synthesize] function.
> Note: the `voice` argument of the `synthesize` function must be configured with the speaker's name and the `options` argument's property `providerName` must be configured with the `"voice-cloning"` value

The current example uses the voice of Joseph Rudyard Kipling during his speech to the Royal Society of Literature in 1933 ([source](https://www.youtube.com/watch?v=QDcdKA4_KBM)).

The text to be synthesized is the famous Rudyard Kipling poem [If](https://en.wikipedia.org/wiki/If%E2%80%94).

After the text is synthesized, the speaker is deleted.

> Note: you can also use our service using the Dashe CLI `tts speaker command`
```
Usage: dasha tts speaker [options] [command]

Manage custom speakers

Options:
  -h, --help                  display help for command

Commands:
  list                        List of created speakers
  add|clone [options] <name>  Create speaker cloning voice from wav or mp3 file
  delete <name>               Delete cloned speaker
  get <name>                  Get cloned speaker information
  help [command]              display help for command
```

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in the current folder.

## Running the demo

Run `npm start` to execute script `index.js`.

