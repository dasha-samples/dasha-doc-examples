# NLU: Entities usage example

## Description

[Entities doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-entities)

Entities (or [named entities](https://en.wikipedia.org/wiki/Named_entity)) are the real-world objects that can be denoted with some name. 
Dasha's nlu module has named entity recognition ability ([ner](https://en.wikipedia.org/wiki/Named-entity_recognition)). 
This example demonstrates the usage of entity extraction when building chat bot. 
The main file to be discussed here is `app/data.json`. The `app/main.dsl` contains dialogue logic and the `index.js` is the sdk part of the application.

The current example demonstrates usign a single entity in a simple application.

Entities are defined in custom dataset file.
In our case this file is named `app/data.json`. It may be named what ever you want but it has to be connected to the application in `.dashaapp` file (see Connecting to the application the [doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/connecting-to-the-application)).
- Every entity is described with its possible values (section `"values"`) and phrases that are going to be used to train entities (sections `"includes"` and `"excludes"`).
- The `"includes"` and `"excludes"` sections are filled with phrases which must and must not contain the entity. Moreover, the `"includes"` section phrases must be marked up due to system be able to learn and recognize them (see [doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-entities) for details)
- Every value has synonyms that will be normalized to the original value when extracted.
- Also note the `open_set` parameter. It defines whether the values set is fixed or not, i.e. if `open_set` is `true` then the system will try to extract values that are not defined in your dataset.

This demo operates with the only entity - `language`.
This entity will be extracted in phrases like "I speak `<some_language>`".
As you can see from the `includes` section, the phrases used to learn this entity specify the meaning of this entity and the context where this entity should be extracted.
Those phrases are marked up with round `()` and square `[]` brackets.

Our entity `language` has several predefined possible values: "german", "french", "russian", "english", "chinese".
The actual extracted value can be of another value (not only defined in `app/data.json`) because of parameter `open_set` set to `true`.

The current example simply demostrates extracting entity `langugae`.

After initiating the dialogue, Dasha suggests you to answer the question `"What language do you speak?"`.
After you answer this question, Dasha reacts with one of the following phrases:
- `"Oh, " + extractedLanguage + ", I know that one!"` - if `language` was extracted and its value is one of ["german", "french", "russian", "english", "chinese"]
- `"Hm, I don't know about " + extractedLanguage + ", but I think I've heard of it"` - if `language` was extracted but with different value (which is possible due to `open_set` parameter)
- `"Seems like I dont know this language"` - if `language` was not recognized.

Then conversation is loop to the same question about the speaking language.
The conversation lasts until you hang up your phone.

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.

## Detailed script description

The DSL script consists of a few nodes:
- node `root` - initiates the dialogue
- digression `language_echo` - echoes extracted language
- digression `dont_understand` - handles case when nothing was recognized

Also, there is handler for user hang up event - digression `user_hangup`. 
Without it the dialogue would end with an error in case of user hangs up a phone.

The entity is extracted and checked in digression `language_echo`.
Notice the condition of this digresison: it is implemented via `messageHasData` - builtin DSL function that checks if entity is in user's input.
The actual value extraction is made with DSL function `#messageGetData`.
(See those and other NLU functions in out [doc](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#nlu-control))
Then the value is compared with predefined languages and after that Dasha reacts depending on this comparison.

To learn more about digressions see the [digressions doc](https://docs.dasha.ai/en-us/default/dasha-script-language/program-structure#digression)

## Dialogue example

Example demonstrating the real dialogue
