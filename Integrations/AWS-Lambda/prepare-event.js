const fs = require("fs/promises");
const JSZip = require("jszip");
const path = require("path");

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

async function main() {
    const app_zip = await zip_files([
    "dasha-app/app.dashaapp",
    "dasha-app/data.json",
    "dasha-app/main.dsl",
    "dasha-app/phrasemap.json",
  ]);
  const event = JSON.parse((await fs.readFile("event-template.json")).toString())
  const conversations = JSON.parse((await fs.readFile("event-conversations.json")).toString())
  event.body = {}
  event.body.appZipBase64 = Buffer.from(app_zip).toString('base64');
  event.body.conversationInputs = conversations.conversationInputs;
  await fs.writeFile("event.json", JSON.stringify(event,null,2));
}

main()