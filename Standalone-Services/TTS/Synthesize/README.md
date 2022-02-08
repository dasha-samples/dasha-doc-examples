# Text-To-Speach Service: Synthesize

There two ways to synthesize speech from text using Dasha tts service: the [TTS API](https://docs.dasha.ai/en-us/default/sdk/node-js/modules/tts) (particularly, the [synthesize](https://docs.dasha.ai/en-us/default/sdk/node-js/modules/tts#synthesize) function) and the CLI `tts synthesize` command:

```
Usage: dasha tts synthesize|synth [options] <text>

Options:
  -o --output <filename>
  --provider-name <name>  TTS provider name (default: "dasha")
  --lang <code>            (default: "en-US")
  --speaker <name>         (default: "default")
  --emotion <emotion>      (default: "neutral")
  --speed <value>          (default: 1)
  --variation <value>      (default: 0)
```

They have the same abilities since CLI command uses the [TTS API](https://docs.dasha.ai/en-us/default/sdk/node-js/modules/tts).

The current example uses the TTS API.

Let's take a look on the synthezis parameters and describe them all.
- The `options` parameter defines the general configuration of synthezis. Properties:
  - `providerName` - name of provider name. Available values are: `"default" | "custom" | "dasha" | "voice-cloning" | "dasha-emotional"`
  - `account` - the [account](https://docs.dasha.ai/en-us/default/sdk/node-js/interfaces/account.account-1) object of your user. By default the current logged user is used
- The `voice` parameter is the object that defines the configuration of speech. Properties:
  - `lang` - using language. For now, only default `"en-US"`
  - `speaker` - using speaker. For now, available speakers are: `Kate` and `Linda`. The default is `Kate`.
  - `emotion` - emotion of synthesed speech. The default is `"neutral"`. To provide custom emotion you have to specify a sample sentence that describes desired emotion in the following format: `"from text: your sample setnence text"`.
> Note: to use emotion synthezis you have to set `providerName` option to `"dasha-emotional"`
  - `speed` - speed of speach. The default value is `1`.
  - `variation` - numeric parameter that affects the pronunciation. The default value is `0`. You can play with it to find desirable value.

See the script `index.js`.
It generates several examples of synthesized speech that demonstrates all the parameters.
Run it and open `output.wav` file to hear the difference between them!

Also, see the function `synth` in the beginning of the script `index.js`.
This function wraps the `dasha.tts.synthesize` to provide default values of speech synthezis. This values can be overrided by arguments provided from outside.
The specified parameters are provided to `dasha.tts.synthesize` and the resulting synthesized speech (which is array of bytes `Uint8Array`) is returned.
The resulting bytes can be written to a file (like in our case) or can be handled any way you want.

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in the current folder.

## Running the demo

Run `npm start` to execute script `index.js`.

