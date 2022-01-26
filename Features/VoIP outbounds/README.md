# VoIP: outputs configuration and usage example

## Description

Voice over Internet Protocol ([VoIP](https://en.wikipedia.org/wiki/Voice_over_IP)) is a method and group of technologies for the delivery of voice and multimedia communications over IP networks.
In Dasha platform the VoIP is used to establish phone calls for connecting to your app.
The telephony is the default way of using Dasha.

By default, Dasha application will use our telephony when making a call to a user, i.e. the user will see our phone number when recieving a call.
You may want to redirect this call to be made wihthin your telephony and phone number.
Dasha platform provides an ability for that.

This example demonstrates configuring the outbound telephony.

At first we will configure the telephony using Dasha CLI and then the configured telephony will be connected to the application in SDK part of the application.

Also, see our another [demo](https://github.com/dasha-samples/dasha-sip-test) with creating outbounds.

### Configuring with Dasha CLI

To configure a new outbound telephony, use Dasha CLI `sip create-outbound` command:
```
sage: dasha sip create-outbound [options] <configName>

create an outbound SIP configuration

Options:
  --server <serverIpOrDns>
  --account <sipAccountName>
  --domain <domain>
  --password <password>
  --ask-password
  --transport <tcp|udp>        (default: "udp")
```
The `<config_name>` will be used later when configuring the telephony in the SDK.

The current example uses [twillio](https://www.twilio.com/) as PSTN provider

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.


## Detailed script description

This section is needed to make code example clear to user. What exactly is going on in the example? How current feature is related to this example?

This section probalby uses other features - they must be mentioned and referenced (references to the docs and demos)

## Dialogue example

Example demonstrating the real dialogue
