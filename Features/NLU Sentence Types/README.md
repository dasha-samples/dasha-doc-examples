# NLU: Sentence Type usage example

## Description

[Sentence Types doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/sentence-types)

In Dasha platform there is an ability to parse sentence type of the user input. 
[DSL](https://docs.dasha.ai/en-us/default/dasha-script-language/) provides the [#getSentenceType](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#getsentencetype) function that returns sentence type of the last user input. The resulting sentence type is one the following values:
- `"statement"` - Declarative sentence
- `"question"` - Interrogative sentence
- `"request"` - Imperative sentence

In real life there is one additional sentence type - *Exclamation*, but in Dasha platform this sentence type is parsed as *Declarative*, i.e. statement.

This feature can be used to extract additional information from user input becides [intents](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-intents) and [entities](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-entities).

In this demo the user input are parsed with [#getSentenceType](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#getsentencetype) function and the results are stored in corresponding fields of output object.
User is asked for a new sentence in endless loop until he *asks* to finish the conversation.
See also [DSL NLU control documentation](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#nlu-control).

Using sentence type parsing do not require any training data. Although, you need `data.json` file with at least one intent to be connected to your application.

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.


## Detailed script description

The script consists of a few nodes. After initiating a call and dialogue comes to the endless loop:
- node `listen` is used to just get user input and go the node `guess`
- node `guess` is used to say some text about the sentence type and return back to `listen` (or handle the exit trigger )

To interrupt the loop user must say the sentence that contains entity `dialogue`, intent `finish` (see `app/data.json`) and the type of the sentence must be `request` - this is the trigger to end the conversation.

## Dialogue example

```
AI: Hello! Let me guess your sentence type.
USER: ok
AI: I think it is statement sentence.
AI: Please, tell me one more thing or ask me to finish the dialog
USER: An apple
AI: I think it is statement sentence.
AI: Please, tell me one more thing or ask me to finish the dialog
USER: Who are you?
AI: I think it is question sentence.
AI: Please, tell me one more thing or ask me to finish the dialog
USER: Tell me about yourself
AI: I think it is request sentence.
AI: Please, tell me one more thing or ask me to finish the dialog
USER: THIS IS SPARTA
AI: I think it is statement sentence.
AI: Please, tell me one more thing or ask me to finish the dialog
USER: This conversation is over
AI: I think it is statement sentence.
AI: Please, tell me one more thing or ask me to finish the dialog
USER: Finish this conversation
AI: I think it is request sentence.
AI: Seems like you ask me to end this conversation
AI: Bye!
conversation result {
  recognitions: {
    statement: [ 'ok', 'An apple', 'THIS IS SPARTA', 'This conversation is over' ],
    request: [ 'Tell me about yourself', 'Finish this conversation' ],
    question: [ 'Who are you?' ],
    other: []
  }
}
```
