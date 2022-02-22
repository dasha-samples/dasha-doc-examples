# REST API: Usage example

## Description

<!-- [Feature doc link](https://docs.dasha.ai/en-us/default/current-feature-doc)

Some common information about the feature. What is it? How do we handle it, i.e. what instruments are there in Dasha to rule this feature? [Link to original demo if needed](https://some.demo.com)

Overall example description. What is it about? What does current example contain? What files should user look at?

Please, see our [some-important-link](https://docs.dasha.ai/en-us/default/current-feature-doc) for more details.  -->

## Installation and pre-steps

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.
2. create `.env` file in root folder
3. in `.env` set environment variable `DASHA_APIKEY` (you can get this value running `dasha account info`)
4. `node server.js` - the server will be available on `htpp://localhost:8080`
5. expose local server (e.g. with ngrok: `ngrok http 8080`)
6. in `.env` set environment variable `WEBHOOK_SERVER_URL` with your exposed url

## Running the demo

Run `npm start <your_phone_number>` to start a phone call.
