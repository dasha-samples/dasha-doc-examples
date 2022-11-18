# DSL exmaple: Warm Transfer

## Description

One of the most common ways to use conversational AI is to build a bot that is used for user routing, simple user support, lead generation, etc.
In all such cases a dialogue is usually ended with forwarding a user to a human operator who is able to handle further complex dialogue.

In DSL there is a simple function [`#forward`](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#forward) that redirects the user to different endpoint. At that moment the dialogue between the user and Dasha bot is over. This approach is easy to implement but it has several disadvantages like:
- inability to hadle connection isses, e.g. cases when the operator can not pick up the phone on his side
- inability to notify the operator about the user issue or pass some useful user information to the operator
- inability to stay with the user until the connection to the operator is successfully established  \
So, basically the user is already cooled down when (and if) is connected to the operator.

Considering the issues above (and some other reasons) we decided to implement mechanism of multi-user conversations and asynchronous dialogues.

The current example demonstrates the *warm transfer* - the technique of connecting a user to an operator in a *warm* way.
Basically, it made like two conversations are executed simultaniously: Dasha-user and Dasha-operator, and then it becomes single user-operator conversation with Dasha being a connection provider.

Also this example demonstrates the use of [async blocks](https://docs.dasha.ai/en-us/default/dasha-script-language/program-structure#async-block) and DSL features connected with handling multi-user conversation:
- [`#disableRecognition`](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#disablerecognition)
- [`#getAsyncBlockDescription`](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#getasyncblockdescription)
- [`#isBlockMessage`](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#isblockmessage)
- [`#getAsyncBlockMessage`](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#getasyncblockmessage)
- [`#sendMessageToAsyncBlock`](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#sendmessagetoasyncblock)
- [`#bridgeChannel`](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#bridgechannel)
- [`#sayTextChanneled`](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#saytextchanneled-blocking-call)
- [`#sayChanneled`](https://docs.dasha.ai/en-us/default/dasha-script-language/built-in-functions#saychanneled-blocking-call)

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start -- out --phone <your_phone_number> --phone_interlocutor <operator_phone_number>`, where
- `<your_phone_number>` - phone number that will be used as a client endpoint 
- `<operator_phone_number>` - phone number that will be used as an operator endpoint

## Detailed script description

The script logic is as follows:
1. We connect to a user's endpoint 
2. If operator's endpoint is not provided, then ask the user to provide it next time
3. Otherwise, ask the user a few questions (nodes `ask_how_are_you`, `ask_message`)
4. Call async block `TalkToOperator` (node `connect_to_operator`), connect to the operator, tell him collected information about the user and ask him to accept the user (node `TalkToOperator:root`)
5. If operator declines call, notify parent block (node `TalkToOperator:decline_user`) with a content message, terminate both dialogues (node `handle_block_content_message`)
6. If operator accepts the call, notify parent block (node `TalkToOperator:accept_user`) with a content message
7. Bridge operator and user together and disable recognition (node `handle_block_content_message`). Now Dasha is only a connection provider
8. Now operator can hear user and vice versa
9. If anyone at any moment drops his phone, terminate both dialogues (nodes `exit_when_any_child_exit`, `TalkToOperator:exit_when_parent_block_exit`)

See comments in dsl code for details.

## Dialogue example

```log
{ speaker: 'ai-to-user', text: 'Hello!' }
{ speaker: 'ai-to-user', text: "I'm gonna ask you a few questions and then I will connect you to an operator." }
{ speaker: 'ai-to-user', text: 'How are you doing?' } 
{ speaker: 'user', text: "I'm fine." } 
{ speaker: 'ai-to-user', text: 'What would you like me to say to an operator?' } 
{ speaker: 'user', text: 'be happy' } 
{ speaker: 'ai-to-user', text: 'Let me connect you to our operator.' } 
{ speaker: 'ai-to-user', text: 'Waiting for operator to response...' } 
{ speaker: 'ai-to-user', text: 'Nice weather, huh?' }
{ speaker: 'user', text: 'Yeah.' }
{ speaker: 'ai-to-user', text: 'Mhm..' }
{ speaker: 'ai-to-user', text: 'Did you know that Australia is wider than the moon?' }
[application] info [parent] got message: {"messageType":"Content","content":{"status":"operator answered"},"sourceRouteId":"-1","targetRouteId":"","biDirectional":null}
{ speaker: 'user', text: 'Really.' }
{ speaker: 'ai-to-operator', text: 'Hi, this is Dasha AI bot. I have a user who wants to talk to you right now.' }
{ speaker: 'ai-to-operator', text: 'The user said that he is not doing well right now.' }
{ speaker: 'ai-to-operator', text: 'He asked to give you a message. He said: be happy' }
{ speaker: 'ai-to-operator', text: 'Are you ready to accept the call?' }
{ speaker: 'operator', text: 'yes'}
{ speaker: 'ai-to-operator', text: 'Ok, I am now going to connect the user to you in a few seconds. Thank you!'}
{ speaker: 'ai-to-user', text: 'Connecting you to the operator right now. Bye!!' }
[application] info [parent] got message: {"messageType":"Content","content":{"status":"operator accepted call"},"sourceRouteId":"-1","targetRouteId":"","biDirectional":null}
[application] info [child] got message: {"messageType":"Bridge","content":null,"sourceRouteId":"","targetRouteId":"-1","biDirectional":true}

<unrecognized-user-operator-dialogue-here>

[application] info [parent] user hangup
[application] info [child] got message: {"messageType":"Terminated","content":null,"sourceRouteId":"","targetRouteId":"-1","biDirectional":null}
[application] info [child] terminating, reason:{"messageType":"Terminated","content":null,"sourceRouteId":"","targetRouteId":"-1","biDirectional":null}
```