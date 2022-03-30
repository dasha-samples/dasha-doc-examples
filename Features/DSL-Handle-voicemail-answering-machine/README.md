# DSL example: Handle voicemail, answering machine and operator messages

(Work on the description is in progress)

See `answering_machine` description in our [system intents](https://docs.dasha.ai/en-us/default/natural-language-understanding/system-intents).

<!-- ## Description

[Feature doc link](https://docs.dasha.ai/en-us/default/current-feature-doc)

Some common information about the feature. What is it? How do we handle it, i.e. what instruments are there in Dasha to rule this feature? [Link to original demo if needed](https://some.demo.com)

Overall example description. What is it about? What does current example contain? What files should user look at?

Please, see our [some-important-link](https://docs.dasha.ai/en-us/default/current-feature-doc) for more details.  -->

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.


<!-- ## Detailed script description

This section is needed to make code example clear to user. What exactly is going on in the example? How current feature is related to this example?

This section probalby uses other features - they must be mentioned and referenced (references to the docs and demos) -->

## Dialogue example

```log
2022-03-30T11:24:18.096Z [conv:5ad364] info conversation started
User: The number you have reached is not in service at this time
2022-03-30T11:24:23.228Z [conv:5ad364] info conversation complete
conversation result { status: 'Voice mail' }
```

```log
2022-03-30T11:25:04.028Z [conv:d917de] info conversation started
User: Hi, this is John, please leave a message is unable to pick up the phone right now, can you please leave a message can not come to the phone
2022-03-30T11:25:09.181Z [conv:d917de] info conversation complete
conversation result { status: 'Voice mail' }
```

```log
2022-03-30T11:25:49.632Z [conv:fdd573] info conversation started
User: hello?
AI: Hi! Seems like you are alive human.
AI: What is your name?
User: Bob
AI: Pleasure to meet you, My name is Bob! Bye!
2022-03-30T11:26:12.307Z [conv:fdd573] info conversation complete
conversation result { status: 'Done' }
```