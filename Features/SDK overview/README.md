# Dasha SDK overview

There are plenty of conversation AI forms and purposes.
It could be text chat bot or interactive voice interfaces ([IVRs](https://en.wikipedia.org/wiki/Interactive_voice_response)), user support systems or automated call center, etc.
Within current world technology level any such problem can be decomposed in several parts:
- dialogue logic
- natural language understanding (NLU)
- natural language generation (NLG)
- application environment: integrations, type of the interface, etc

## How does Dasha application work

Dasha platform allows you to flexibly create conversational AI applications.
It encapsulates the application environment from the actual dialogue logic.

It is very important to know that Dasha is a cloud platfrom.
That means that most of the calculations run on our servers.
In particular, these components are run remotely from your machine:
- initiating the call
- actual dialogue model
- transforming user voice into text (speach-to-text)
- recognition of user inputs (natural language understanding)
- speach synthezis of Dasha reactions (text-to-speach)

To configure and deploy your application and to communicate with it you can use our *SDK*.

## What is Dasha SDK

Dasha Software development kit (SDK) is a package of development tools for configuring and deploying your application.

Simply put, SDK communicates with our cloud server via [gRPC](https://en.wikipedia.org/wiki/GRPC) to rule your applicaiton.

So, any Dasha application can be separated into two general parts: 
- *dialogue part* which contains everything that needed for a dialogue (dialogue logic, NLU, NLG). It is deployed via SDK commands and is run on our server.

and the
- *SDK part* which is responsible for telling our server what to do with your app, i.e. deploy, set handlers, etc.

SDK allows you to configure basic application properties like:
- input dialogue parameters
- text-to-speech
- speech-to-text
- conversation queue

And to integrate the application with your system.

Currently our SDK is available only for `Node.js`. 
