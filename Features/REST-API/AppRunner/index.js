require("dotenv").config({ path: ".env" });
const {
  deploy_app,
  get_app_description,
  run_app,
  zip_files,
} = require("./helpers");

async function main() {
  if (process.env.DASHA_APIKEY === undefined)
    throw new Error("Please, set the DASHA_APIKEY env");
  if (process.env.WEBHOOK_SERVER_URL === undefined)
    throw new Error("Please, set the WEBHOOK_SERVER_URL env");
  if (process.argv[2] === undefined)
    throw new Error("Please, provide your phone number as cli argument");
  const phone = process.argv[2];
  const application_files = [
    "app/app.dashaapp",
    "app/main.dsl",
    "app/phrasemap.json",
  ];
  console.log("z")
  const app_zip = await zip_files(application_files);
  console.log("zz")
  console.log("Created zip");
  const id = await deploy_app(app_zip);
  console.log(id);
  const description = await get_app_description(id);
  // console.log(description);
  // const event = await run_app(id, phone);
  // console.log({ event: event.event, input: event.input });
}

main().catch((e) => {
  console.log(`Error: ${e.message}`);
});
