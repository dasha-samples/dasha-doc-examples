# SDK: run multiple conversations from csv file

## Description

A single Dasha application can run many conversations.  \
Moreover, it can concurrently run them, i.e. several conversations at a time.

There are many ways to store and pass conversation inputs into an application. 
It depends on the desired architecture and other constraints.

The current example demonstrates the approach for running multiple conversations with inputs described in a `.csv` file.

1. Here we've got a single Dasha application (with concurrency set to `3`) and two .csv files which are passed to the app (asynchronously) as conversation inputs.
2. Conversation inputs are transformed via user-defined schema described in `inputSchema.js` (it is necessary since `.csv` file stores string data and the app may require some specific data type).
3. All results are written into single output `.csv` file. The conversation outputs are transformed into strings via user-defined schema `outputSchema.js`

> Note: You can use this example as a template for your application.

### Project description
- `app` - folder with Dasha files (dialogue script, nlu config, etc...)
- `CsvRunner.js` - a utility class used to handle csv file inputs
- `index.js` - main script
- `inputSchema.js` - schema for csv-input transformation (from string to desired type)
- `outputSchema.js` - schema for dialogue output transformation (from output type to string)
- `input*.csv` - .csv file with conversation inputs

## Installation

1. Setup environment (see [doc](https://docs.dasha.ai/en-us/default/setup-enviroment/))
1. Run `npm i` in a current folder.

## Running the demo

Run `npm start`.

Note that you may change the `endpoint` parameters in .csv files. For instance, you may set your phone number as an endpoint and Dasha will call that number. But, please, watch the `_channel` as well. If you use your phone number as an endpoint, `_channel` must be set to `audio`. Use `chat`  as  `_channel`  value to start your conversation in chat.
