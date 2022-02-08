const { nlu } = require("@dasha.ai/sdk");
const { datasetEn } = require("./dataset-en")

let nluService;

process.on("SIGINT", function () {
  console.log("SIGINT was sended, closing NLU service");
  nluService.close();
  process.exit();
});

async function main() {
  nluService = await nlu.NluService.create();
  nluService.loadSkills([
    { id: "sentiment", language: "ru-RU" },
    { id: "date-and-time", language: "ru-RU" },
  ]);
  console.log("Skills are available and will be used in further recognitions.");

  try {
    await nluService.loadSkills([{ id: "not_existing_skill", language: "en-US" }]);
    // NLU service error is thrown
  } catch (e) {
    console.log(e.message);
  }

  await nluService.train("dataset-ru.json", "ru-RU");
  await nluService.train(datasetEn, "en-US");

  console.log("Information about using skills: ", nluService.skillInfo);

  const recognitionInputs = [
    "еж и racoon были рады тому, что утром кто-то перевел деньги to their deposite account"
  ]
  for (const inputText of recognitionInputs){
    const recResult = await nluService.recognize(inputText);
    console.log(
      `Recognition result for '${inputText}':`,
      JSON.stringify(recResult, null, 2)
    );
  }
  

  if (!nluService.closed) {
    nluService.close();
  }
  process.exit(0);
}

main();
