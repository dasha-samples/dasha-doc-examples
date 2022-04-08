const { v4: uuidv4 } = require("uuid");

const responses = [
    `Hi! I know a few interesting facts. Do you want to hear them?`,
    "Did you know that More human twins are being born now than ever before?",
    "Did you know that A narwhal's tusk reveals its past living conditions?",
    "Did you know that The first person convicted of speeding was going eight mph?",
    "Did you know that The world wastes about 1 billion metric tons of food each year?",
    "Did you know that The severed head of a sea slug can grow a whole new body?",
    `I have no more facts for you. Thank you for your attention. Have a nice day! Bye!`,
  ];
  
  class ExternalServiceConversation {
    constructor(inputData) {
        this.responses = [...responses];
        this.id = uuidv4();
        this.input = inputData;
    }
    processUserText(userText) {
      /* mock processing userInput with external NLU and external Dialogue Model */
      /* if there are no more responses, Dasha will receive null and close the dialogue */
      return this.responses.shift();
    }
    close(){};
  }
  
  module.exports = ExternalServiceConversation;
  