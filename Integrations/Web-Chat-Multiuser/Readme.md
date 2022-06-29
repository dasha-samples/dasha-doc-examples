This demo shows a way to integrate Dasha in web browser chat.

The communication between the Dasha application and local server is provided by `socket.io`.

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.
2. Create `.env` file in current directory
3. Set environment variables `DASHA_SERVER` and `DASHA_APIKEY` in `.env` file (see `.env-example`)
4. Optionally you may also set `DASHA_CONCURRENCY` variable to change max number of conversations to run at once (default value is `2`)

## Running the demo

1. Run `node server.js` for launching local server.
2. Open `http://localhost:8080` in browser.
