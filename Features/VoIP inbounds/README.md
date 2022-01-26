# VoIP: inbounds configuration and usage example

## Description

Voice over Internet Protocol ([VoIP](https://en.wikipedia.org/wiki/Voice_over_IP)) is a method and group of technologies for the delivery of voice and multimedia communications over IP networks.
In Dasha platform the VoIP is used to establish phone calls for connecting to your app.
The telephony is the default way of using Dasha.

The inbound call is the common way of designing chat bots.
Dasha platform provides an ability to configure inbound calls for your application.
[Basic](../../Basic) Dasha application allows you to call someone, but the receiving calls requires some additional steps.
The configuring inbound telephony can be made with Dasha CLI and alos some additional code in SDK part is needed.
It does not require any special logic in the dialogue model. 

This example demonstrates configuring the inbound telephony with some existing PSTN phone (in our example the twillio's [PSTN](https://www.twilio.com/docs/glossary/what-is-pstn) is used).

Also, the way of local inbound testing is shown. This alternative way requires microsip.

Also, explore our another [demo](https://github.com/dasha-samples/dasha-sip-test) with inbounds.

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
  "uri": "sip:<uuid>@sip.us.dasha.ai"
}
```

This `uri` is the one that is going to be called in future. You can always get it again running:
```
dasha sip list-inbound
```

### Running incoming calls

If you want to be able to call your application with from some phone, you must have some phone number that is connected to sip inbound uri. 
To create one, you may use some external service, e.g. [twilio](https://www.twilio.com/console/sip-trunking/trunks) (see [sip inbound calls tutorial](https://docs.dasha.ai/en-us/default/tutorials/sip-inbound-calls/)).

[Tutorial](https://docs.dasha.ai/en-us/default/tutorials/sip-inbound-calls#configuration-with-twilio-sip-trunking) for configuration with Twillio SIP tranking.

Alernatively, for testing purposes you may use [microsip](https://www.microsip.org/) (see the instructions below).

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.
2. [Configure inbound](#configuring-with-dasha-cli)
3. Create a phone that is connected to your inbound (see [Running incoming calls](#running-incoming-calls))

Alternatively for local testing:

1. Download and install [microsip](https://www.microsip.org/downloads)
2. Open microsip and create the account:
   1. Right click on the bottom panel
   2. Choose "Add Account"
   3. Fill necessary fields with any letters
   4. Click "Save" button

## Running the demo

1. Run `npm start` - this will start the application that await for incoming calls.
1. Call your application using created phone or microsip (just use sip `uri` from the CLI output as a phone number is microsip)

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
