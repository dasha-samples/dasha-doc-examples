# Natural-Language Understanding

## Table of contents

- [Description](#description)
- [Intents](#intents)
- [Entities](#entities)
- [Sentence types](#sentence-types)
- [NLU Skills](#nlu-skills)

## NLU overview

Natural-language understanding (NLU)(https://en.wikipedia.org/wiki/Natural-language_understanding) is a *subfield* of Natural-language processing ([NLP](https://en.wikipedia.org/wiki/Natural_language_processing)). 

While NLP is about text processing in general (e.g. machine translation, topic modeling, Natural-language Generation, etc) the Natural-language understanding focuses on extracting semantic information from the text in the form appropriate for handling in the system.

Generally speaking there are a plenty of methods, approaches, and techniques for these purposes.

Dasha platform implements the following NLU concepts:
- [Intents](#intents)
- [Entities](#entities)
- [Sentence types](#sentence-types)

and provides the two ways of using them:
- standalone via NLU service API
- inside the dialogue model via [DSL API for NLU control](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#nlu-control)

## Intents

Put it simply, `intents` express the *intentions* of a user. 

They are used to extract the general meaning of the user's utterance.

E.g., if your system is learned to extract the `intent` called `"greeting"`, this intent should be extracted from inputs like: "hello", "good day", etc. 
This makes the system to be able to handle such inputs robustly and efficiently.

A single utterance may contain one or several `intents` or none of them.

After the `intents` are extracted the user utterance can be easily handled with some kind of software.
For example, many dialogue systems and conversational AI platforms support handling the `intents` via their API.

The Dasha platform uses the neural networks technologies to implement the concept of `intents`.
In that way, the defining the `intent` means defining the training samples that must include it (and optionally the ones that must not do).

To create basic application you may use our pretrained `intents` ([system intents](https://docs.dasha.ai/en-us/default/natural-language-understanding/system-intents)) which are grouped in [skills](#nlu-skills).

And of cause you can to create your own ones via providing the training dataset to our platform.

## Entities

While `intents` keep the general meaning of the utterance (e.g. actions that a user wants to perform), the `entities` (or [named entities](https://en.wikipedia.org/wiki/Named-entity_recognition)) express the details of the utterance (e.g. objects of user's actions).
Once the `entity` is extracted, it is way more easy to handle programmatically.

Usually, `entities` are used to express categories of the real-world objects such as names, addresses, dates, numbers, organizations, etc.

Decomposing the meaning of any human statement into the actions and objects (`intents` and `entities`) is pretty intuitive and natural.

The following example demonstrates the necessity of using `entities`:

Say we have two utterances:
- `"I want to buy a shirt"`
- `"I want to buy an ice cream"`

...and a good NLU model. 
The NLU model should extract intent `buy` and entity `good` with values `shirt` and `ice cream`. 
So here, without entities these two examples would be the same and the actual meaning of the sentence would be lost.

> Note: Actually, we could create an intent for every single instance of good.
> But this approach is excessive and is not flexible.

## Sentence types

[`Intents`](#intents) and [`entities`](#entities) provides way for extracting dry information that user speech contains.
But, of cause, any action and any data could be mentioned in different contexts.

The simple example:
- `You bought a shirt.` (*Declarative*)
- `You bought a shirt!` (*Exclamation*)
- `Did you buy a shirt?` (*Interrogative*)
- `Buy that shirt!` (*Imperative*)

With only `intents` and `entities` the recognition of these utterances would provide the same information: "`buying` a `shirt`". 
But, from the point of view of dialogue modeling these cases may have dramatic difference.

Dasha NLU service provides the `sentence type recognition`. 
It is able to predict whether the sentence is *Declarative*, *Interrogative* or *Imperative* (*Exclamation* sentences are recognized as *Declarative*).

<!-- - `"statement"` - Declarative sentence
- `"question"` - Interrogative sentence
- `"request"` - Imperative sentence 
- In real life there is one additional sentence type - *Exclamation*, but in Dasha platform this sentence type is parsed as *Declarative*, i.e. statement.
- -->
<!-- 
## NLU Skills

The intents and entities are combined to `NLU skills`.
It is a convenient way to pack bunches of `intents` and `entities` with the same meaning.

Once skill is created, it can be connected to your application.

Also, see our [system skills](https://docs.dasha.ai/en-us/default/natural-language-understanding/system-intents). -->

