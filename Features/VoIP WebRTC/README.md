# VoIP: WebRTC usage example

## Description

By default, Dasha allows you to run your application using telephony.
But since this is not always needed, Dasha provides an ability of using [WebRTC](https://en.wikipedia.org/wiki/WebRTC) instead.
This allows you to build solutions that use web browsers or mobile applications (instead of telephony) for connecting with user.

This example demonstrates simple browser application that connects to `node js` http server based on Dasha SDK.

### Client

From the user's point of view the application (browser client) looks like a button `RUN`.
When a button is pressed, client send http post request to the server.
The request contains conversation input parameters:
- [aor](https://en.wiktionary.org/wiki/address_of_record) - sip uri that is used as an endpoint in our app
- name - name of the user (hardcoded to `Peter`)

When client is being created, it requests the following data from the http server:
- [`aor`](https://en.wiktionary.org/wiki/address_of_record) - sip uri that will used as an endpoint in our app
- `sipServerEndpoint` - address that will be used for creating [sip.js](https://sipjs.com/) server (establishes voice communications with the app)

Client's `aor` (sip uri address) should:
1. start with `sip:reg`
2. to be unique
3. use the *domain* as the sip server. 

In our case the *domain* should be `sip.<server>.dasha.ai` where server is one of `us`,`ru`.

In this demo `aor` (sip uri) is constructed as `sip:reg-${uuid}@${domain}`. The `sipServerEndpoint` is constructed as `wss://${domain}/sip/connect`

### Server

The server is a simple http server with only two methods:
- `get:/sip` - get `aor` and `sipServerEndpoint`
- `post:/call` - post conversation inputs and run a call with these parameters

This demo is based on our another demo [dasha-browser-webrtc-sipjs](https://github.com/dasha-samples/dasha-browser-webrtc-sipjs).

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.


## Running the demo

1. Login to dasha account via `npx dasha account login`
2. Make `npm i` to install dependencies
3. Make `npm start` to run dasha application on nodejs server and launch a web application that will communicate with the server via rest api
5. Open `http://localhost:1234/` and click to Start button for run call


## Dialogue example

```
[server] {
[server]   speaker: 'ai',
[server]   text: 'Hello Peter',
[server]   startTime: 2022-01-24T12:10:58.455Z,     
[server]   endTime: 2022-01-24T12:10:59.256Z        
[server] }
[server] {
[server]   speaker: 'ai',
[server]   text: 'Now i can work into browser by web rtc!',
[server]   startTime: 2022-01-24T12:10:59.258Z,     
[server]   endTime: 2022-01-24T12:11:02.035Z        
[server] }
[server] {
[server]   speaker: 'ai',
[server]   text: "Okay, i can repeat your phrase just for fun. Let's say something!",
[server]   startTime: 2022-01-24T12:11:02.038Z,     
[server]   endTime: 2022-01-24T12:11:05.615Z        
[server] }
[server] {
[server]   speaker: 'human',
[server]   text: 'Something.',
[server]   startTime: 2022-01-24T12:11:13.976Z,     
[server]   endTime: 2022-01-24T12:11:15.098Z        
[server] }
[server] {
[server]   speaker: 'ai',
[server]   text: 'You said',
[server]   startTime: 2022-01-24T12:11:15.102Z,     
[server]   endTime: 2022-01-24T12:11:15.735Z        
[server] }
[server] {
[server]   speaker: 'ai',
[server]   text: 'Something.',
[server]   startTime: 2022-01-24T12:11:15.738Z,     
[server]   endTime: 2022-01-24T12:11:16.336Z        
[server] }
```
