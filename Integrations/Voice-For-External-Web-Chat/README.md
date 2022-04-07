# Integration example: Use Dasha for existing text chat as voice provider

## Motivation

Suppose you have working web chat that uses some NLU and Dialogue models (maybe your own ones).

Suppose now, that you want to use the same NLU and Dialogue models, only now you want them to be voiced with Dasha.

That means that user communicates with the same chat bot (on the same web page) but now the communication is carried out with user voice (via Dasha and WebRTC technology).

This demo shows how this could possibly be implemented.

## Implementation details

There is a mocked external service (`external-service.js`) that imitates the work of some NLU and Dialogue model.

There are two versions of web-chat implemented:
1. Text chat
2. Voice chat (using Dasha)

Both versions use the same Dasha application and the same mocked external service.

Those chats are made with express server that renders html page with the chat-box.

When the chat-box button is clicked, the chat-box opens and the dialogue begins.

Since the dialogue is provided by simple mock service, any user input will trigger next phrase in a fixed sequence of phrases. The dialogue is finished when there are no more new phrases in a sequence.

### Text chat

In this version the client communicates with the backend external service directly (via `socket.io`).

When the chat-box is triggered, the server creates conversation in mock service. Then every human input triggers ai response.

### Voice chat

This version uses Dasha as a provider for stt, tts and all other necessary services.

The server runs Dasha application and mock service and controls the communication between them. It also acts like a `SIP` server.

When the client is created, the necessary `SIP` credentials are requested from the server to establish connection and further calls. (see [WebRTC example description](../../Features/VoIP-WebRTC) for details)

When the chat-box is triggered, the server creates Dasha conversation along with mock conversation.

The pipeline is as follows:
- the user voice is passed from client to server side dasha app via WebRTC.
- Dasha converts it to text and pases this text to mock service via `socket.io` (just like it was done previously in Text chat).
- user input is processed in mock, the result is voiced by Dasha TTS and sent to the chat-box to visualize it in text



## Installation

1. `npm i`
2. create `.env` with Dasha credentials, example:
```
DASHA_SERVER=app.us.dasha.ai
DASHA_APIKEY=xxxx
```

## Running the demo

1. start server. You have two options here:
   - run `npm start` or `npm run voice` to start server for web text chat supported *with voice* provided by Dasha
   - run `npm run no-voice` to start server with web text chat only
2. goto `http://localhost:8080/` in browser
3. open chatbox
4. enable microphone (if you started voice chat)

Both `npm run voice` and `npm run no-voice` provide the same dialogue provided by mocked external service.
