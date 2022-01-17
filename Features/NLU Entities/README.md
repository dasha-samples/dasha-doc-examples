# NLU: Entities usage example

## Description

[Entities doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-entities)

Entities (or [named entities](https://en.wikipedia.org/wiki/Named_entity)) are the real-world objects that can be denoted with some name. 
Dasha's nlu module has named entity recognition ability ([ner](https://en.wikipedia.org/wiki/Named-entity_recognition)). 
This example demonstrates the usage of entity extraction when building chat bot. 
The main file to be discussed here is `app/data.json`. The `app/main.dsl` contains dialogue logic and the `index.js` is the sdk part of the application.

In the current example a user is asked about his *estimation* of delivery service. 
Then he is asked about *feedback*: what he liked or did not like (depending on his estimation). 
Both estimation and feedback are extracted with our ner system, processed and handled in dialog using [DSL](https://docs.dasha.ai/en-us/default/dasha-script-language/) functions: [`#messageHasData`](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions/#messagehasdata) and [`#messageGetData`](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions/#messagegetdata). 

Entites and their possible values are defined in custom dataset file `app/data.json`. 
Let's take a look on its structure. 
- Every entity is described with its possible values (section `"values"`) and phrases that are going to be used to train entities (sections `"includes"` and `"excludes"`).
- The `"includes"` and `"excludes"` sections are filled with phrases which must and must not contain the entity. Moreover, the `"includes"` section phrases must be marked up due to system be able to learn and recognize them (see [doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-entities) for details)
- Every value has synonyms that will be normalized to a original value when extracted.
- Also note the `open_set` parameter. It defines whether the values set is fixed or not, i.e. if `open_set` is `true` then the system will try to extract values that are not defined in your dataset.

To connect your entities to the application they must be configured in `.dashaapp` file (see [Connecting to the application](https://docs.dasha.ai/en-us/default/natural-language-understanding/connecting-to-the-application)).

In our case we have two entities defined: "estimation" and "service".

The "estimation" entity has **exactly** five possible (since `open_set` is `false`) values which denote user's estimation. 
These extimations will be normalized to a number which will be compared to a threshold (which is equal to `4`).

The "service" entity is specified to extract particular things that concern user (or make him happy). 
For example, it can be something connected with `courier`, `delivery time` or `convenience` of the service. 
Note that this entity's values set is open, so the possible extracted value can be different.

When building your own custom intents, it will probably require testing, debugging and improving your model. See [Improving NLU model doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/improving-models) for the tips and instuctions.

Please, see our [doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-entities) for more details. 

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.

## Detailed script description

...

## Dialogue example

```
AI: Hi, this is delivery service quality control department.
AI: How would you evaluate our service?
USER: It was fine
AI: What did you like about our service?
USER: The courier looked good and delivery was fast
AI: Thank you for your attention. Bye!
conversation result {
  estimation: 4,
  feedback: 'courier looked,delivery,time: The courier looked good and delivery was fast'
}
```