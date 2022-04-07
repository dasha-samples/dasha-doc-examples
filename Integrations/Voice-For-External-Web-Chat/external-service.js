const responses = [
  `Hi! I know a few interesting facts. Do you want to hear them?`,
  "Did you know that More human twins are being born now than ever before?",
  "Did you know that A narwhal's tusk reveals its past living conditions?",
  "Did you know that The first person convicted of speeding was going eight mph?",
  "Did you know that The world wastes about 1 billion metric tons of food each year?",
  "Did you know that The severed head of a sea slug can grow a whole new body?",
  `I have no more facts for you. Thank you for your attention. Have a nice day! Bye!`,
];

/*
event structure:
{
    messages: string[];
    exit_dialogue: boolean?;
};
*/

class ExternalService {
  constructor() {
    /* Maps conversation id to available responses (used to mock working of dialogue model) */
    this.ConversationToResponses = {};
  }

  async start() {}

  createConversation(conversationInput, conversationId) {
    /* mock initializing conversation in external dialogue model */
    if (conversationId === undefined) conversationId = uuidv4();
    this.ConversationToResponses[conversationId] = [...responses];
  }

  async executeConversation(conversationId) {}

  processUserMessage(conversationId, userInput) {
    console.debug("got user input", userInput);

    // mock processing userInput with external NLU and external Dialogue Model
    const responses = this.ConversationToResponses[conversationId];
    if (responses === undefined) return
      // throw new Error(
      //   `Could not find responses for conversation '${conversationId}'`
      // );

    // console.debug("got responses");

    if (responses.length === 0) return;
      // throw new Error(
      //   `Unexpected request for finished conversation ${conversationId}`
      // );
    let response = responses.shift();

    // console.debug("got response");

    let event = { messages: [response] };
    if (responses.length === 0) {
      // no more messages
      event.exit_dialogue = true;
    }

    return event;
  }

  closeConversation(conversationId) {
    delete this.ConversationToResponses[conversationId];
  }
}

module.exports = ExternalService;
