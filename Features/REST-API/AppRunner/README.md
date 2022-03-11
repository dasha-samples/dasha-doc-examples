# REST API: Usage example

## Description

The current example demonstrates using the Dasha AppRunner API for application control.

The abilities of the current API:
- deploy applicaiton
- get application descrtiption by id
- run the deployed applicaiton with provided settings

API URL: 
- RU cluster: `http://app.ru.dasha.ai/api/v1/apprunner`
- US cluster: `http://app.us.dasha.ai/api/v1/apprunner`

## Deploy

Method URL: 
- RU cluster: `http://app.ru.dasha.ai/api/v1/apprunner/deploy`
- US cluster: `http://app.us.dasha.ai/api/v1/apprunner/deploy`

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

### Http request example via `axios`:

```js
await axios.post(`http://app.us.dasha.ai/api/v1/apprunner/deploy`, app_zip, {
      headers: {
        "Content-Type": "application/zip",
        Authorization: `Bearer ${process.env.DASHA_APIKEY}`,
      },
    })
```

### Response example:
```json
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

## Get the application description

Method URL: 
- RU cluster: `http://app.ru.dasha.ai/api/v1/apprunner/${id}/description`
- US cluster: `http://app.us.dasha.ai/api/v1/apprunner/${id}/description`

You can use this method to get description of deployed application.

### Http request example via axios
```js
await axios.get(`http://app.us.dasha.ai/api/v1/apprunner/${id}/description`, {
      headers: {
        Authorization: `Bearer ${process.env.DASHA_APIKEY}`,
      },
    })
```

### Response example

```json
{
  "id": "xxx",
  "name": "dasha-apprunner-demo",
  "description": "",
  "inputSchema": {
    "type": "object",
    "additionalProperties": true,
    "required": ["endpoint"],
    "properties": { "endpoint": { "type": "string" } }
  },
  "outputSchema": {
    "type": "object",
    "additionalProperties": false,
    "required": ["success"],
    "properties": { "success": { "type": "boolean" } }
  }
}
```

### Run the application

Method URL:
- RU cluster: `http://app.ru.dasha.ai/api/v1/apprunner/${id}/run`
- US cluster: `http://app.us.dasha.ai/api/v1/apprunner/${id}/run`

This `POST` method triggers application to execute some actual conversation with specific settings.


The request body contains
- `input:object` - input data for the dialogue script (*required*)
- `before:string` - date of the deadline for the application to start
- `webhooks:object` - webhooks where to send application lifecycle events (*required*)
  - `headers:object` - headers to send along with events
  - `completed:string` - webhook url to send `completed` event
  - `failed:string` - webhook url to send `failed` event
  - `timedout:string` - webhook url to send `timedout` event
  - `external:object` - object that maps `external function` names to `url` to `POST` methods with their implementation
- `settings:object`
  - `channel:string` - conversaton channel (for now only `sip` values is available) (*required*)
  - `sip:object` - SIP configuration
    - `config:string` - SIP config name (*required*)
  - `audio:object`
    - `tts:string` - TTS provider to use
    - `stt:string` - STT provider to use

### Request example

```js
const run_request_body = {
  /* input data for the application */
  input: { endpoint },
  /* deadline for the application to start */
  before: "2022-02-10:11:12.613Z",
  /* webhooks to send application lifecycle events to */
  webhooks: {
    /* headers to send along with events */
    headers: {},
    /* webhook for completion events */
    completed: `${process.env.WEBHOOK_SERVER_URL}/completed`,
    /* webhook for failure events */
    failed: `${process.env.WEBHOOK_SERVER_URL}/failed`,
    /* webhook for timedout events */
    timedout: `${process.env.WEBHOOK_SERVER_URL}/failed`,
    /* mapping: external function name to url which implements this function (method post) */
    external: {
      getUserNameByPhone: `${process.env.WEBHOOK_SERVER_URL}/get_user_name_by_phone_impl`,
    },
  },
  settings: {
    channel: "sip",
    audio: {
      /* tts provider */
      tts: "dasha",
      /* stt provider */
      stt: "default",
    },
  },
};
return await axios.post(`http://app.us.dasha.ai/api/v1/apprunner/${id}/run`, run_request_body, {
    headers: {
      Authorization: `Bearer ${process.env.DASHA_APIKEY}`,
    },
})
```

### Response example



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
