# REST API: Usage example

## Description

The current example demonstrates using the Dasha AppRunner API for application control.

The abilities of the current API:
- deploy applicaiton
- get application descrtiption
- run the deployed applicaiton with provided settings

API URL: `http://app.us.dasha.ai/api/v1/apprunner`.

### Deploy

Method URL: `http://app.us.dasha.ai/api/v1/apprunner/deploy`

The `deploy` method of AppRunner API is the `POST` method that receives your application, deploys it on our server and returns basic information about deployed app.

To deploy your application you have to create `zip` archive with application files, i.e.:
- `.dashapp` file that configures the whole application
- `.dsl` files of your dialogue model
- `.json` NLU dataset file that is connected to `.dashaapp` (optional) 
- `phrasemap.json` file which defines phrases that can be used in dialogue

The current example uses `JSZIP` package to zip necessary files.
You may consider this or other some approaches, e.g. creating `zip` archive manually.

Created `zip` is sent via `post` request as a byte string.

> Note: you have to specify headers for the request:
> - "Content-Type": "application/zip"
> - Authorization: `Bearer {your_dasha_apikey}`

### Example via axios:

```
await axios.post(`${APPRUNNER_URL}/deploy`, app_zip, {
      headers: {
        "Content-Type": "application/zip",
        Authorization: `Bearer ${process.env.DASHA_APIKEY}`,
      },
    })
```

### Response example:
```
{
  "id": "xxx",
  "name": "dasha-apprunner-demo",
  "description": "",
  "inputSchema": {
    "type": "object",
    "additionalProperties": true,
    "required": [
      "required_prop"
    ],
    "properties": {
      "required_prop": {
        "type": "string"
      }
    }
  },
  "outputSchema": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "output_prop"
    ],
    "properties": {
      "output_prop": {
        "type": "boolean"
      }
    }
  }
}
```

### Get application description

`${id}/description`

### Run the application

`${id}/run`

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
