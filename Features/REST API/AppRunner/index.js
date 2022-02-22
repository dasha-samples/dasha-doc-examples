require("dotenv").config({ path: ".env" });
const axios = require("axios");
const fs = require("fs/promises");
const JSZip = require("jszip");
const path = require("path");

const DASHA_APIKEY = process.env.DASHA_APIKEY;
const WEBHOOK_SERVER_URL = process.env.WEBHOOK_SERVER_URL;
const APPRUNNER_URL = `http://app.us.dasha.ai/api/v1/apprunner`;

async function zip_files(file_paths) {
  const zip = new JSZip();
  for (const file_path of file_paths) {
    const str_content = (await fs.readFile(file_path)).toString();
    const file_name = path.parse(file_path).base;
    zip.file(file_name, str_content);
  }
  const zipped_files = await zip.generateAsync({ type: "uint8array" });
  return zipped_files;
}

async function deploy(app_zip) {
  console.log(`Deploying app...`);
  return await axios
    .post(`${APPRUNNER_URL}/deploy`, app_zip, {
      headers: {
        "Content-Type": "application/zip",
        Authorization: `Bearer ${process.env.DASHA_APIKEY}`,
      },
    })
    .then((response) => {
      console.log("deploy finished, status:", response.status);
      const id = response.data.id;
      console.log("app id:", id);
      return id;
    })
    .catch((e) => {
      throw new Error(`Could not deploy app: ${e.message}`);
    });
}

async function get_description(id) {
  console.log(`Getting description of app ${id}...`);
  return await axios
    .get(`${APPRUNNER_URL}/${id}/description`, {
      headers: {
        Authorization: `Bearer ${DASHA_APIKEY}`,
      },
    })
    .then((response) => {
      console.log("Got description, status:", response.status);
      return response.data;
    })
    .catch((e) => {
      throw new Error(`Could not get app description: ${e.message}`);
    });
}

async function run(id, endpoint) {
  console.log(`Running app ${id}...`);
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
      completed: `${WEBHOOK_SERVER_URL}/completed`,
      /* webhook for failure events */
      failed: `${WEBHOOK_SERVER_URL}/failed`,
      /* webhook for timedout events */
      timedout: `${WEBHOOK_SERVER_URL}/failed`,
      /* mapping: external function name to url which implements this function (method post) */
      external: {
        myfunc: `${WEBHOOK_SERVER_URL}/myfunc_external_impl`,
      },
    },
    settings: {
      channel: "sip",
      /* SIP config name */
      // sip: {
      //   config: "sip_config_name"
      // }
      audio: {
        /* tts provider */
        tts: "dasha",
        /* stt provider */
        stt: "default",
      },
    },
  };
  return await axios
    .post(`${APPRUNNER_URL}/${id}/run`, run_request_body, {
      headers: {
        Authorization: `Bearer ${process.env.DASHA_APIKEY}`,
      },
    })
    .then((response) => {
      console.log(
        `App started, status: ${response.status}, event:`,
        response.data
      );
      return response.data;
    })
    .catch((e) => {
      throw new Error(`Could not run app: ${e.message}`);
    });
}

async function main() {
  if (DASHA_APIKEY === undefined)
    throw new Error("Please, set the DASHA_APIKEY env");
  if (WEBHOOK_SERVER_URL === undefined)
    throw new Error("Please, set the WEBHOOK_SERVER_URL env");
  if (process.argv[2] === undefined)
    throw new Error("Please, provide your phone number as cli argument");
  const phone = process.argv[2];
  const application_files = [
    "app/app.dashaapp",
    "app/data.json",
    "app/main.dsl",
    "app/phrasemap.json",
  ];
  const app_zip = await zip_files(application_files);
  console.log("Created zip");
  const id = await deploy(app_zip);
  console.log(id);
  const description = await get_description(id);
  console.log(description);
  const event = await run(id, phone);
  console.log({ event: event.event, input: event.input });
}

main().catch((e) => {
  console.log(`Error: ${e.message}`);
});
