# SDK: Conversation data

## Description

If you are not familiar with SDK and basic Dasha concepts, please see the [SDK overview](../SDK%20overview/README.md).

This example demonstrates working with conversation data, i.e. how to:
- set conversation input parameters
- get conversation output variables
- get conversation transcription
- get link to audio record of a conversation
- get begin and end time of a conversation

Every Dasha application consists of two parts (see [SDK overview](../SDK%20overview/README.md) for details):
- dialogue part
- SDK part

The SDK part (written in `JavaScript`) is responsible for communication between your local machine and our server.

In particular, this example has `index.js` file that uses Dasha SDK for deploying example application located in `"./app"` folder, starting it and runing a single conversation with provided input.

## Setting conversation input

It is often needed to parameterize your dialogue due to make its logic flexible and convenient.

For example, the usual parameter of most of conversations is `endpoint` - the phone number to call.

You can specify the required conversation parameters in DSL file.
And if your conversation has ones, you have to provide them in the SDK part of your app.

To do that, you simply pass an object with parameter values to the `createConversation` function (see lines 14-16 in `index.js`).

In current example we simply pass the single input parameter `endpoint` which is provided from console.

It is also needed to make providing inputs more abstract.
Like providing values from databases, etc.
To learn how to integrate your application to a database, see our Integrations code examples (WIP).

## Getting conversation results

After you execute the conversation (line 24 in `index.js`) the result of conversation is returned.

To execute voice conversation you can call [`execute`](https://docs.dasha.ai/en-us/default/sdk/node-js/interfaces/conversation#execute) method by setting the `channel` parameter's value to `"audio"`.

Note that some of the conversation results are not available for text conversations (the `channel` parameter's value set to `"text"`).

The resulting object contains
- `output` - output variables of the dialogue
- `transcription` - transcription of the conversation, sorted by phrase start time
- `startTime` - a moment when conversation started (available only for voice conversations)
- `endTime` - a moment when conversation ended (available only for voice conversations)
- `record` - an url of a conversation audio record (available only for voice conversations)

See the [conversation result](https://docs.dasha.ai/en-us/default/sdk/node-js/interfaces/conversationresult) description for details.

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.

