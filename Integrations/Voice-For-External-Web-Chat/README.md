

Suppose you have working web chat that uses some NLU and Dialogue models (probably, your own ones).

Suppose now, that you want to use the same models, only now you want them to be voiced with Dasha.

That means that user communicates with the same Dialogue model (on the same web page) but now the communication is carried out with user voice (via WebRTC technology).

# Installation

1. `npm i`
2. create `.env` with Dasha credentials, example:
```
DASHA_SERVER=app.us.dasha.ai
DASHA_APIKEY=xxxx
```

# RUN

1. `node server.js`
2. goto `http://localhost:8080/` in browser
3. open chatbox
