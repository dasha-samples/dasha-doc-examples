const { v4: uuidv4 } = require("uuid");

const randomFacts = [
    "More human twins are being born now than ever before",
    "A narwhal's tusk reveals its past living conditions",
    "The first person convicted of speeding was going eight mph",
    "The world wastes about 1 billion metric tons of food each year",
    "The severed head of a sea slug can grow a whole new body",
]

class ExternalService {
    constructor() {
        /* 
           Maps conversation id to event queue 
           event structure:
            {
                new_messages: string[];
                exit_dialogue: boolean?;
            };
        */
        this.ConversationToEventQeueu = {};
        /* Maps conversation id to available responses (used to mock working of dialogue model) */
        this.ConversationToResponses = {};
        this.ConversationToInput = {};
    }

    async start() { }

    initConversation(conversationInput) {
        /* mock initializing conversation in external dialogue model */
        const conversationId = uuidv4();
        this.ConversationToEventQeueu[conversationId] = [
            {
                messages: [`Hi! I know a few interesting facts. Do you want to hear them?`]
            }
        ]
        this.ConversationToResponses[conversationId] = [...randomFacts];
        this.ConversationToInput[conversationId] = conversationInput;
        return conversationId;
    }

    getConversationInput(conversationId) {
        const input = this.ConversationToInput[conversationId];
        if (input === undefined) 
            throw new Error(`Could not find input for conversation '${conversationId}'`);
        return input;
    }

    async executeConversation(conversationId) { }

    processUserInput(conversationId, userInput) {
        console.debug("got user input", userInput)

        // mock processing userInput with external NLU and external Dialogue Model
        const responses = this.ConversationToResponses[conversationId]
        if (responses === undefined) 
            throw new Error(`Could not find responses for conversation '${conversationId}'`);

        console.debug("got responses")
        
        let response = responses.shift();

        console.debug("got response")

        let event = {};
        if (response === undefined) {
            // no more messages
            event.messages = [`I have no more facts for you. Thank you for your attention. Have a nice day! Bye!`]
            event.exit_dialogue = true;
        } else {
            event.messages = [`Did you know that ${response}?`]
        }

        // push new event to queue
        const eventQueue = this._getEventQueue(conversationId);
        eventQueue.push(event);

        console.debug("pushed new event")
    }

    getNewEvents(conversationId) {
        const eventQueue = this._getEventQueue(conversationId);
        const newEvents = [...eventQueue];
        eventQueue.splice(0,newEvents.length);
        return newEvents;
    }

    closeConversation(conversationId) {
        delete this.ConversationToResponses[conversationId];
        delete this.ConversationToEventQeueu[conversationId];
    }

    _getEventQueue(conversationId) {
        const eventQueue = this.ConversationToEventQeueu[conversationId];
        if (eventQueue === undefined) 
            throw new Error(`Could not find event queue for conversation '${JSON.stringify(conversationId)}'`);
        return eventQueue;
    }
}

module.exports = ExternalService;