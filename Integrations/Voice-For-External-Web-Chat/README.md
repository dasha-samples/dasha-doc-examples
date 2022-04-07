# Integration example: Use Dasha for existing text chat as voice provider

## Motivation

Suppose you have working web chat that uses some NLU and Dialogue models (maybe your own ones).

Suppose now, that you want to use the same NLU and Dialogue models, only now you want them to be voiced with Dasha.

That means that user communicates with the same chat bot (on the same web page) but now the communication is carried out with user voice (via Dasha and WebRTC technology).

This demo shows how this could possibly be implemented.

## Implementation details

### Text chat bot (before using Dasha)



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
