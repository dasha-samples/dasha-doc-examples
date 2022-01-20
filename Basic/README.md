# Basic example

## Description

This is the very basic demo application.
It is created to introduce you the main concepts, show you files structure and explain you how to start working with Dasha.

Every application made on Dasha platform consists of two parts:
1. Dialogue part
     - contains:
       - dialogue logic (`.dsl` files)
       - nlu dataset (`.json` file) with intents and entities
       - phrasemap (`.json` file)
       - main config (`.dashaapp` file) that combines all together and defines additional nlu skills and dsl entry point
     - running remotely on our servers
1. SDK part
      - is written on Dasha SDK (`JavaScript` for now)
      - puposes:
        - deploy the Dialogue part of application on server
        - configue the whole application and single conversation instances
        - provide dialogue inputs
        - collect dialogue outputs
        - integrations with backend
        - implementation of [external functions](https://docs.dasha.ai/en-us/default/dasha-script-language/external-functions) used in dialogue
      - running localy on your machine

Observation of the files presented in this demo.
- `app/app.dashaapp` - main app file - configures app with main dialogue file, phrasemap and nlu
- `app/main.dsl` - file with dialogue
- `app/phrasemap.json` - phrasemap file - empty in this example
- `index.js` - sdk file, deploys and runs the app and executes the single conversation with cli argument `phone` (or `chat`)
- `package.json` - javascript config file

There is no dataset file in this demo.

The dialog specified in `main.dsl` simply awaits any sounds from user (with 2000 ms timeout), then says "Hello" and awaits for any user input. After that Dasha says "Goodbye" and returns object `{success: true}`.


## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start chat` for launching text chat or run `npm start <your_phone_number>` to start a phone call.

## Dialogue example

```
AI: Hello!
USER: abacaba
AI: Goodbye!
```