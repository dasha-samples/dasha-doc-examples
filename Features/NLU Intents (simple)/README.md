# NLU: Intents usage example

## Description

[Intents doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-intents)

Intents are actions and requests that a user wants to perform (unlike [entities](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-entities) that are rather objects that the user mentions). 
They are used to extract and handle semantic information from the utterances that the system received from the user. 
E.g., if your system is learned to extract intent called `"greeting"`, this intent must be extracted from inputs like: "hello", "good day", etc. 
This makes the system to be able to handle such inputs robustly and efficiently.

The current example demonstrates using a single intent in a simple application.

The intents are defined in `app/data.json` file.
The file may be named what ever you want but it has to be connected to the application in `.dashaapp` file (see Connecting to the application the [doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/connecting-to-the-application)).

Every intent specified in the `app/data.json` has following subsections (see [custom intents doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-intents)):
- `"includes"` (required) that contains phrases where this intent must be extracted
- `"excludes"` (optional) that contains phrases where this intent must NOT be extracted

The only intent specified in this demo is `exit`.
The purpose of this intent is to express user's wish to end the dialogue.
The only thing needed to define its semantics is phrases specified in `includes` section.
All of them should express the desired intention of user.
Take a look on it in `app/data.json`.

Note that every intent should be independent and atomic as much as possible.
It should not serve for several purposes.
Consider creating several intents instead of one that has several meanings.

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.


## Detailed script description

The dialogue script consists of three main nodes: 
- `root` - start node that connects to user and tells him initial information
- `goodbye` - terminal node that is visited if user wishes to end the dialogue
- `echo` - digression that triggers on any other user input and repeats user's words

Also, there is a handler for the event when user hangs up - user hangup `digression`.
Without it the dialogue ends with an error because of the unhandled event.

## Dialogue example

```
AI: Hello, this is a hotel reception.
AI: Is there anything I can do for you?
User: Yes
AI: What do you need?
User: I would like to order some food
AI: Ok, we will bring a dinner to your apartment.
AI: Is there anything I can do for you?
User: Thank you. Also, could you tell me when do I need to check out?
AI: Your checking out is scheduled for Wednesday at 5 pm.
AI: Is there anything I can do for you?
User: Eeh, did I ask you to bring food to my apartment?
AI: Ok, I have already got it.
AI: Is there anything I can do for you?
User: No, nothing
AI: You can call me any time. Goodbye!
conversation result { askedFood: true, askedCleaning: false, askedCheckOutInfo: true }
```
