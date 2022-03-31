# NLU: Intents usage example

## Description

<!-- [Intents doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-intents)

Intents are actions and requests that a user wants to perform (unlike [entities](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-entities) that are rather objects that the user mentions). 
They are used to extract and handle semantic information from the utterances that the system received from the user. 
E.g., if your system is learned to extract intent called `"greeting"`, this intent must be extracted from inputs like: "hello", "good day", etc. 
This makes the system to be able to handle such inputs robustly and efficiently. -->

The current example is aimed to demonstrate how the *intents* can be used to implement automatic control over hotel reception service. 
The application calls a user and asks him about his needs (that will be expressed with intents). 
All the custom intents that are created specificly for this application are specified in `app/data.json` file. 
Also this demo uses system intents "common_phrases" - pretrained intents that are available (see [system intents doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/system-intents) to see the lists of all our system intents). 
After the dialogue is done the output with user needs is returned. 
This output can be used outside the app by your business application.

For simplicity the application reactions are hard coded due to make intents logic clear. 
Note also that this demo is basically simplified version of our demo: https://github.com/dasha-samples/automated-hotel-receptionist.

<!-- TODO remove or reformulate the following -->

The main file of the demo to be discussed here is `app/data.json`. 
The `app/main.dsl` contains dialogue logic and the `index.js` is the sdk part of the application.

<!-- To connect your custom intents and Dasha system intents to the application they must be configured in `.dashaapp` file (see [Connecting to the application](https://docs.dasha.ai/en-us/default/natural-language-understanding/connecting-to-the-application)). -->

Let's take a look at `app/data.json` file. 
The following intents are specified there:
- `"what_services"` - denotes user's request to ask about list of hotel reception services
- `"order_food"` - extracted if user wants to order some food
- `"need_cleaning"` - extracted if user says that he wants his apartment to be cleaned
- `"check_out_info"` - extracted if user asks about his checking out information
- `"agreement#pos"` - denotes user's agreement (intent `agreement` with `positive` state)
- `"agreement#neg"` - denotes user's disagreement (intent `agreement` with `negative` state)
- `"nothing"` - extracted if user says that he don't want anything

<!-- Every intent specified in the `data.json` has following subsections (see [custom intents doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/custom-intents)):
- `"includes"` (required) that contains phrases where this intent must be extracted
- `"excludes"` (optional) that contains phrases where this intent must NOT be extracted -->

<!-- To handle the intents in dialogue script [DSL](https://docs.dasha.ai/en-us/default/dasha-script-language/) provides functions like: [#messageHasIntent](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions/#messagehasintent), [#messageHasAnyIntent](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions/#messagehasanyintent). 
They allow you to understand whether such intent was extracted or not.
See also [DSL NLU control documentation](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#nlu-control). -->

<!-- Note that if you need to extract some intent with particular `state` the `#messageHasIntent` function provides corresponding parameter, i.e. if you want to extract user's *disagreement* you must do it like this `#messageHasIntent("agreement", "negative")`. -->

<!-- When building your own custom intents, it will probably require testing, debugging and improving your model. See [Improving NLU model doc](https://docs.dasha.ai/en-us/default/natural-language-understanding/improving-models) for the tips and instuctions. -->

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.


## Script description

This demo mostly uses [digressions](https://docs.dasha.ai/en-us/default/dasha-script-language/program-structure#digression) since the logic of the script assume that user asks questions and requests us about something.

After the initiating the call in `root` and asking the user in `greeting` the dialog waits in node `main_hub`.
This node is made just for waiting for any triggers and returning back here after the trigger is handled.

The triggers are implemented with digressions (`what_services`, `order_food`, `check_out_info`, `need_cleaning`, `goodbye`) and corresponding intents that are specified in `data.json`. 
Note that intent `"bye"` is the system intent. It is available due to enabling skill "common_phrases" in `.dashaapp`.

Every digression contains phrases that are said to the user and after they are done, dialog returns to the further listening. Except for `goodbye` - this digression is used as a trigger for exiting dialog.

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
