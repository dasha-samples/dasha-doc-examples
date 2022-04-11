import { Chatbox } from "./chatbox-widget";
import { DashaVoiceWidget } from "../../dasha/dasha-voice-widget";
import axios from "axios";

var socket = io();

const DIALOGUE_SERVICE_API_URL = "http://localhost:8080";
const DASHA_VOICE_SERVER_API_URL = "http://localhost:8090";

async function createConversation(input) {
  const response = await fetch(
    `${DIALOGUE_SERVICE_API_URL}/create_conversation`,
    {
      method: "POST",
      body: JSON.stringify({ socketId: socket.id, input }),
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const { convId } = await response.json();
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
    chatBox.addSystemMessage("Starting the conversation...", actualConvId);
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
        user_text: userText,
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
    const { conversation_id } = e;
    chatBox.addSystemMessage("Conversation is complete", conversation_id);
  });

  socket.on("user-text", (e) => {
    console.log(`Got user message`, e);
    const { user_text, conversation_id } = e;
    chatBox.addUserMessage(user_text, conversation_id);
  });

  socket.on("ai-text", (e) => {
    console.log(`Got ai message`, e);
    const { ai_response, conversation_id } = e;
    chatBox.addAiMessage(ai_response, conversation_id);
  });

  chatBox.display();
}

main();
