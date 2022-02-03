# Text-To-Speach Service: Overview

Text-To-Speach ([TTS](https://en.wikipedia.org/wiki/Speech_synthesis)) is the technology that allows you to artificially synthesize human speech.
It is used in a wide range of applications.
One of them is creating chatbots since it is easier to synthesize the speech rather than record real human for all possible cases.
When creating chatbots it also may be very important for bot to sound like human.
That is why this area of TTS application requires high quality of implementation of this technology.

Dasha applications use TTS for speech synthesis as built-in tool (which can be configured in SDK part of the application).
But our TTS is also available as standalone service.

The current examples demonstrate use of our TTS service.

The [Synthesize](Synthesize/) example demonstrates the use of speech synthesis using our pretrained speakers and the meaning of voice parameters.
The [Custom Speaker](Custom-Speaker/) example shows how you can create your own speakers using voice-cloning technology.

> Note: TTS service is also available via CLI:

```
dasha tts -h
Usage: dasha tts [options] [command]

text-to-speech synthesis

Options:
  -h, --help                         display help for command

Commands:
  synthesize|synth [options] <text>
  speaker                            Manage custom speakers
  help [command]                     display help for command
```