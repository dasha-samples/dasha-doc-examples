# Natural-language understanding service

Natural-language understanding ([NLU](https://en.wikipedia.org/wiki/Natural-language_understanding)) is a subtopic of natural-language processing in artificial intelligence that deals with machine reading comprehension.

Dasha platofrm provides meanings of using our [NLU](https://docs.dasha.ai/en-us/default/natural-language-understanding/) via [NLU API](https://docs.dasha.ai/en-us/default/sdk/node-js/modules/nlu) and via the DSL API for [NLU control](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#nlu-control).

The both ways have the same abilities and are samely configured.
But while the DSL is used in Dasha applications, the NLU API can be used independently.

There are two main NLU terms you should know: entities and intents (see the [nlu doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/), [intents demo](../../Features/NLU%20Intents%20(simple)) and [entitites demo](../../Features/NLU%20Entities%20(simple)) to learn them).

The intents and entities are grouped in *skills*.
A skills contains intents and entities of some particular language (for now only Russian and English languages are available).

Generally, you have two options of using our NLU:
- using the existing pretrained skills ([system intents](https://docs.dasha.ai/en-us/default/natural-language-understanding/system-intents))
- using the custom skills that are obtained from *custom datasets*

The custom dataset defines the training samples for your own entities and intents.
You can see our NLU demos to learn more!

The current example observes the use of NLU API with custom datasets and with our pretrained skills.

The [NLU API](https://docs.dasha.ai/en-us/default/sdk/node-js/modules/nlu) provides [NluService class](https://docs.dasha.ai/en-us/default/sdk/node-js/classes/nlu.nluservice) for creating the instance of NLU service.
All called methods of an instance trigger our core NLU service via GRPC.

The list of methods:
- [create](https://docs.dasha.ai/en-us/default/sdk/node-js/classes/nlu.nluservice#create) - create an instance of NLU service asynchronously
- [train](https://docs.dasha.ai/en-us/default/sdk/node-js/classes/nlu.nluservice#train) - train (for the first time) or load (if dataset was already used for training) several custom skills from your datasets (in this example they are stored in `dataset-en.js` and `dataset-ru.json` files)
- [loadSkills](https://docs.dasha.ai/en-us/default/sdk/node-js/classes/nlu.nluservice#loadskills) for loading list of pretrained skills (they became connected to current instance). In this example the following skills are used:
  - `{ id: "sentiment", language: "ru-RU" }`
  - `{ id: "date-and-time", language: "ru-RU" }`
- [recognize](https://docs.dasha.ai/en-us/default/sdk/node-js/classes/nlu.nluservice#recognize) for making recognition request to our server with pretrained and custom skills that are connected to current instance. It only takes the `text` parameter

You can explore the `index.js` file to see the use of several custom and pretrained skills.

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in the current folder.

## Running the demo

Run `npm start` to execute script `index.js`.

