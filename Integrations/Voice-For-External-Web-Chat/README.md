# Integration example: Use Dasha for existing text chat as voice provider

## Motivation

Suppose you have working web chat that uses some NLU and Dialogue models (maybe your own ones).

Suppose now, that you want to use the same NLU and Dialogue models, only now you want them to be voiced with Dasha.

That means that user communicates with the same chat bot (on the same web page) but now the communication is carried out with user voice (via Dasha and WebRTC technology).

This demo shows how this could possibly be implemented.

<!-- ## Implementation details

The mock of external service is implemented as an http-server in `external-service.js`. The server provides methods for getting simple html pages with chatboxes and the api to control the conversation.





There is a mocked external service (`external-service.js`) that imitates the work of some NLU and Dialogue model as independent service.

The Dasha is used as a provider for stt, tts and all other necessary services.

The server runs Dasha application and mock service and controls the communication between them. It also acts like a `SIP` server.

When the client is created, the necessary `SIP` credentials are requested from the server to establish connection and further calls. (see [WebRTC example description](../../Features/VoIP-WebRTC) for details)

When the chat-box is triggered, the server creates Dasha conversation along with mock conversation.

The communication pipeline is as follows:
- the user voice is streamed from client to dasha application (on server) via WebRTC.
- Dasha converts user voice to a text and pases it to the server via http request.
- user input is processed on server
- the bot response is sent back to Dasha and to the client's chatbox
- at the same time the response is voiced by Dasha TTS and is streamed to the client via WebRTC -->


## Installation

1. Setup the environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
2. Run `npm i` in a current folder.
3. Create `.env` with Dasha credentials (you need dasha apikey that corresponds to your account)
 
`.env` example:
```
DASHA_SERVER=app.us.dasha.ai
DASHA_APIKEY=xxxx
```

## Running the demo

1. start server: run `npm start` to start server
2. goto `http://localhost:8080/` in browser
3. open chatbox
4. enable microphone (if you started voice chat)
5. talk to Dasha
