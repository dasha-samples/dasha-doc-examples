# VoIP: inbounds configuration and usage example

## Description

Voice over Internet Protocol ([VoIP](https://en.wikipedia.org/wiki/Voice_over_IP)) is a method and group of technologies for the delivery of voice and multimedia communications over IP networks.

Dasha platform provides an ability to configure inbound calls for your application.
Basic Dasha application allows you to call someone, but receiving calls requires some additional steps.
The configuring inbound telephony can be made with Dasha CLI and alos some additional code in SDK part is needed.
It does not require any special logic in the dialogue model. 

### SDK part

Since our application is going to recieve calls, an arbitrary conversation is going to come to a application queue.
Dasha SDK provides handlers for this queue.

Particularly, we have to set the handler for the event "ready": `async (id, conv, info) => { ... }`.
Here, `id` is the key of the current call, `conv` is the conversation object that is goind to be executed and `info` contains information about the received call.

Basically, this is all that needed here.

### Configuring with Dasha CLI

As you can see, the SDK part does not require any particular configuration of inbounds - we just created a queue that awaits for new conversations. 
The actual inbound configuration is performed via Dasha CLI.

To do that we have to use sip API (run `dasha sip -h` for details).
Creating an inbound is connected to your account, application name and aplication groupName (default groupName is `"Default"`).

From Dasha sip api:
```
dasha sip create-inbound -h
Usage: dasha sip create-inbound [options] <configName>
```

In our case the application name is `dasha-voip-inbound-local-demo` (see `app/app.dashaapp`).
So, to create the inbound for this demo you can run the following:
```
dasha sip create-inbound --application-name dasha-voip-inbound-local-demo my-inbound
```

The result of command above:
```
{
  "applicationName": "dasha-voip-inbound-local-demo",
  "priority": 0,
  "groupName": "Default",
  "uri": "sip:8e988902-a333-4527-b434-c319526ca78b@sip.us.dasha.ai"
}
```

This `uri` is the one that is going to be called in future. You can always get it again running:
```
dasha sip list-inbound
```

### Running incoming calls

If you want to be able to call your application with from some phone, you must have some phone number that is connected to sip uri. To create one, you may use some external service, e.g. [twilio](https://www.twilio.com/console/sip-trunking/trunks) (see [sip inbound calls tutorial](https://docs.dasha.ai/en-us/default/tutorials/sip-inbound-calls/)).

For simplicity this example does not require any external services. 
We are going to use [microsip](https://www.microsip.org/) instead.

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.
2. [Configure inbound](#configuring-with-dasha-cli)
3. Download and install [microsip](https://www.microsip.org/downloads)
4. Open microsip and create the account:
   1. Right click on the bottom panel
   2. Choose "Add Account"
   3. Fill necessary fields with any letters
   4. Click "Save" button

## Running the demo

1. Run `npm start` - this will start the application that await for incoming calls.
1. Call your application using microsip (just use sip `uri` from the CLI output as a phone number is microsip)

## Detailed script description

This section is needed to make code example clear to user. What exactly is going on in the example? How current feature is related to this example?

This section probalby uses other features - they must be mentioned and referenced (references to the docs and demos)

## Dialogue example

```
{
  speaker: 'ai',
  text: 'Hello, can you hear me?',
  startTime: 2022-01-20T09:07:26.636Z,
  endTime: 2022-01-20T09:07:28.070Z
}
{
  speaker: 'human',
  text: 'yes i can',
  startTime: 2022-01-20T09:07:31.412Z,
  endTime: 2022-01-20T09:07:32.997Z
}
{
  speaker: 'ai',
  text: 'And I can hear you too. Goodbye',
  startTime: 2022-01-20T09:07:33.001Z,
  endTime: 2022-01-20T09:07:35.190Z
}
----
conversation result { success: true }
```
