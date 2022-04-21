import { Chatbox } from "./chatbox-widget";
import { DashaVoiceWidget } from "../../dasha/dasha-voice-widget";
import axios from "axios";

var socket = io();

const DIALOGUE_SERVICE_API_URL = "http://localhost:8080";
const DASHA_CONCURRENCY = 2;

async function createConversation(input) {
  const res = await axios.post(
    `${DIALOGUE_SERVICE_API_URL}/create_conversation`,
    { socketId: socket.id, input }
  );
  const { convId } = await res.data;
  console.log(`Conversation "${convId}" was created`);
  return convId;
}

/* 
  Sends what user said into your NLU.
  Return your NLU's response text to be pronounced back to user.
*/
async function processUserText(conversationId, userText) {
  const res = await axios.post(
    `${DIALOGUE_SERVICE_API_URL}/process_user_input/${conversationId}`,
    { userText }
  );
  const { aiResponse } = res.data;
  console.log("Got ai response", aiResponse);
  return aiResponse;
}

async function main() {
  const chatBox = new Chatbox();

  /** create dasha application on client side and set your text processing as response function for dasha app */
  const dashaVoiceWidget = await DashaVoiceWidget.create(DASHA_CONCURRENCY, processUserText);
  /** close conversation in your service if dasha conversation is over */
  dashaVoiceWidget.on("close-dasha-conversation", async (e) => {
    socket.emit("system-close-conv");
    const { conversationId } = e;
    await axios.post(
      `${DIALOGUE_SERVICE_API_URL}/close_conversation/${conversationId}`
    );
  });
  /** drop message to chatbox if voice call is started (just to demonstrate) */
  dashaVoiceWidget.on("sip-user-call-received", () => {
    chatBox.addSystemMessage("Voice call started", chatBox.actualConvId);
  });
  /** drop message to chatbox if voice call is over (just to demonstrate) */
  dashaVoiceWidget.on("sip-user-hangup", () => {
    chatBox.addSystemMessage("Voice call is over", chatBox.actualConvId);
  });

  /** */

  chatBox.on("open-chatbox", async (conversationInput) => {
    /* If user opens chatbox, init the conversation on server with some input data */
    const actualConvId = await createConversation(conversationInput);
    chatBox.setActualConversationId(actualConvId);
    chatBox.addSystemMessage("Text conversation started.", actualConvId);
    chatBox.addSystemMessage("Starting the voice call...", actualConvId);
    /* execute dasha conversation */
    dashaVoiceWidget.executeDashaConversation(actualConvId);
  });

  chatBox.on("close-chatbox", async () => {
    /* If user closes chatbox, close current sip connection, close the conversation, clear output */
    socket.emit("system-interrupt-conv");
    /* interrupt conversation */
    await dashaVoiceWidget.hangup();
  });

  chatBox.on("send-button", async (e) => {
    const { userText } = e;
    await axios.post(
      `${DIALOGUE_SERVICE_API_URL}/process_user_input/${chatBox.actualConvId}`,
      {
        userText,
      }
    );
  });

  /** */

  socket.on("system-close-conv", (e) => {
    const { conversationId } = e;
    chatBox.addSystemMessage("Conversation is complete", conversationId);
  });

  socket.on("user-text", (e) => {
    console.log(`Got user message`, e);
    const { userText, conversationId } = e;
    chatBox.addUserMessage(userText, conversationId);
  });

  socket.on("ai-text", (e) => {
    console.log(`Got ai message`, e);
    const { aiResponse, conversationId } = e;
    chatBox.addAiMessage(aiResponse, conversationId);
  });

  chatBox.display();
}

main();
