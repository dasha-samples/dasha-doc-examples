# NLU: Entities usage example

## Description

[Entities doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-entities)

<!-- Some common information about the feature. What is it? How do we handle it, i.e. what instruments are there in Dasha to rule this feature? [Link to original demo if needed](https://some.demo.com)

Overall example description. What is it about? What does current example contain? What files should user look at?

Please, see our [some-important-link](https://docs.dasha.ai/en-us/default/current-feature-doc) for more details.  -->
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

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.

## Dialogue example

Example demonstrating the real dialogue
