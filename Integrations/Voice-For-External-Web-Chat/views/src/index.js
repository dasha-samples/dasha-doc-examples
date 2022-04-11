import { Chatbox } from "./chatbox-widget";
import { DashaVoiceWidget } from "../../dasha/dasha-voice-widget";
import axios from "axios";

var socket = io();

const DIALOGUE_SERVICE_API_URL = "http://localhost:8080";
const DASHA_VOICE_SERVER_API_URL = "http://localhost:8090";

async function createConversation(input) {
  const res = await axios.post(`${DIALOGUE_SERVICE_API_URL}/create_conversation`, { socketId: socket.id, input });
  const { convId } = await res.data;
  console.log(`Conversation "${convId}" was created`);
  return convId;
}

async function main() {
  const chatBox = new Chatbox();
  console.log("Chatbox is created");
  const dashaVoiceWidget = await DashaVoiceWidget.create(
    DASHA_VOICE_SERVER_API_URL
  );
  console.log("Voice widget is created");

  chatBox.on("open-chatbox", async (conversationInput) => {
    /* If user opens chatbox, init the conversation on server with some input data */
    const actualConvId = await createConversation(conversationInput);
    chatBox.setActualConversationId(actualConvId);
    chatBox.addSystemMessage("Text conversation started.", actualConvId);

    chatBox.addSystemMessage("Starting the voice call...", actualConvId);
    await dashaVoiceWidget.initSession(actualConvId);
  });

  chatBox.on("close-chatbox", async () => {
    /* If user closes chatbox, close current sip connection, close the conversation, clear output */
    socket.emit("system-interrupt-conv");
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

  dashaVoiceWidget.on("sip-user-call-received", () => {
    chatBox.addSystemMessage("Voice call started", chatBox.actualConvId);
  });

  dashaVoiceWidget.on("sip-user-hangup", () => {
    chatBox.addSystemMessage("Voice call is over", chatBox.actualConvId);
  });

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
