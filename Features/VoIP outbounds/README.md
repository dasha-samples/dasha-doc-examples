# VoIP: outbounds configuration and usage example

## Description

If you are not familiar with Voice over Internet Protocol, SIP or SIP trunks see the [VoIP overwiev](../VoIP/README.md) to learn about basic terms connected with this technology.

In Dasha platform the VoIP is used to establish phone calls for connecting to your app.
The telephony is the default way of using Dasha.

By default, Dasha application will use our telephony when making a call to a user, i.e. the user will see our phone number when recieving a call.
You may want to redirect this call to be made wihthin your telephony and phone number.
To do that you have to configure the sip outbound.

This example demonstrates configuring the outbound telephony.

At first we will configure the telephony using Dasha CLI and then the configured telephony will be connected to the application in SDK part of the application.

Also, see our another [demo](https://github.com/dasha-samples/dasha-sip-test) that demonstrates creating outbounds.

### Create SIP trunk

To test this demo you need a SIP trunk (see [VoIP overview](../VoIP%20overview/README.md) to learn what SIP trunk is) aquired from some SIP provider.
E.g. you can follow [this instruciton](https://docs.dasha.ai/en-us/default/tutorials/sip-outbound-calls) to learn how to create a SIP trunk in [twillio](https://www.twilio.com/).

The following steps require information about your SIP trunk:
- termination URI
- account name
- password

### Configuring with Dasha CLI

Suppose, you already have your SIP trunk and all required data about it.
Now it's time to configure the applicaiton for using it.

To configure a new outbound telephony, use Dasha CLI `sip create-outbound` command:
```
Usage: dasha sip create-outbound [options] <configName>

create an outbound SIP configuration

Options:
  --server <serverIpOrDns>
  --account <sipAccountName>
  --domain <domain>
  --password <password>
  --ask-password
  --transport <tcp|udp>        (default: "udp")
```
Where
- `server` - IP address or domain name with optional port (i.e. `ip:port` or `dns_name:port`, by default port is 5060) (in this example it is obtained when creating trunk)
- `account` - Username, that will be used in SIP [`From`](https://datatracker.ietf.org/doc/html/rfc3261#section-8.1.1.3) header and in Auth Challenge if auth is required (in this example it is obtained when creating trunk)
- `domain` - (optional) domain name, that will be used in [`From`](https://datatracker.ietf.org/doc/html/rfc3261#section-8.1.1.3) and [`To`](https://datatracker.ietf.org/doc/html/rfc3261#section-8.1.1.2) headers (after @)
- `password` - password that will be used to connect to your trunk (obtained when creating trunk)
- `transport` - lower-level transport protocol, that will be used for transferring SIP messages (TCP or UDP, by default the UDP is used)
- `<config_name>` - the name of the configuration that **will be used later** when configuring the conversation in the SDK code.

(See the [VoIP overview](../VoIP%20overview/README.md) to learn basic SIP terms.)

The current example's SDK code expects that `<config_name>` is set to `dasha-voip-outbound-demo`.

Example
```
dasha sip create-outbound --server your-unique-uri.pstn.twilio.com --account +19733588889 --ask-password dasha-voip-outbound-demo
password: enter_your_password_here
```

Note: You can use `dasha sip list-outbound` command to get all your defined configurations.

### Configuring the conversation via SDK

The SDK code is almost the same as in the [Basic example](../../Basic/index.js).
The only difference here is choosing the sip config:
```
conv.sip.config = "dasha-voip-outbound-demo";
```

## Checking outbounds

After [installation](#installation) and [running a call](#running-the-demo) to your phone number, you can see that incoming call is made from your SIP trunk.

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start <your_phone_number>` to start a phone call directed to your number.

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
