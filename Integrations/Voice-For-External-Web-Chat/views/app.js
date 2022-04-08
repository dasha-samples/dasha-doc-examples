var socket = io();
const api = "http://localhost:8080";

let aor;
let sipUser;

const getSipData = async () => {
  const response = await fetch(`${api}/sip`);
  const { aor, sipServerEndpoint } = await response.json();
  return { aor, sipServerEndpoint };
};

const createSipUser = async (aor, server) => {
  const user = new SIP.Web.SimpleUser(server, { aor });
  await user.connect();
  await user.register();
  return user;
};

const hangupSipUser = async (user) => {
  await user.hangup().catch(() => {});
};

class Chatbox {
  constructor() {
    this.components = {
      openButton: document.querySelector(".chatbox__button"),
      chatBox: document.querySelector(".chatbox__support"),
      sendButton: document.querySelector(".send__button"),
    };

    this.state = false;
    this.messages = [];
    this.actualConvId = undefined;
  }

  display() {
    const { openButton, chatBox, sendButton } = this.components;
    openButton.addEventListener("click", () => {
      this.toggleState(chatBox);
    });

    sendButton.addEventListener("click", () => {
      this.onSendButton(chatBox);
    });
    const node = chatBox.querySelector("input");
    node.addEventListener("keyup", ({ key }) => {
      if (key == "Enter") {
        this.onSendButton(chatBox);
      }
    });
  }

  async createConversation(input) {
    const response = await fetch(`${api}/create_conversation`, {
      method: "POST",
      body: JSON.stringify({ aor, socketId: socket.id, input }),
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const {convId} = await response.json();
    console.log(`Conversation "${convId}" was created`);
    return convId;
  }

  async openChatBox() {
    /* If user opens chatbox, init the conversation on server with some input data */
    const chatBox = this.components.chatBox;
    this.clearChatMessages();
    const mockConversationInput = {};
    this.actualConvId = await this.createConversation(mockConversationInput);
    this.addSystemMessage("Starting the conversation...", this.actualConvId);
    chatBox.classList.add("chatbox--active");
  }

  async closeChatBox() {
    /* If user closes chatbox, close current sip connection, close the conversation, clear output */
    await hangupSipUser(sipUser);
    const chatBox = this.components.chatBox;
    chatBox.classList.remove("chatbox--active");
    socket.emit("system-interrupt-conv");
    this.clearChatMessages();
  }

  toggleState() {
    this.state = !this.state;
    if (this.state) {
      this.openChatBox();
    } else {
      this.closeChatBox();
    }
  }

  /** HAS NO EFFECT BECAUSE OF VOICE COMMUNICATION */
  async onSendButton(chatbox) {
    const textField = chatbox.querySelector("input");
    textField.value = "";
    return;
    // const textField = chatbox.querySelector("input");
    // let userText = textField.value;
    // if (userText == "") {
    //   return;
    // }
    // this.addUserMessage(userText, this.actualConvId);
    // textField.value = "";
    // socket.emit("user-text-message", {
    //   convId: this.actualConvId,
    //   text: userText,
    // });
  }

  addMessage(message) {
    const { author, text, convId } = message;
    if (convId !== this.actualConvId)
      throw new Error(
        `Could not add message ${JSON.stringify(
          message
        )} since it does not correspond to actual conversation id '${
          this.actualConvId
        }'`
      );
    this.messages.push(message);

    let html;
    if (author === "system") {
      html = `<div>${text}</div>`;
    } else if (author === "user") {
      html = `<div class="messages__item messages__item--visitor">${text}</div>`;
      1;
    } else if (author === "ai") {
      html = `<div class="messages__item messages__item--operator">${text}</div>`;
    } else {
      throw new Error(`Could not add message: unknown author '${author}'`);
    }
    const chatbox = this.components.chatBox;
    const chatmessage = chatbox.querySelector(".chatbox__messages");
    chatmessage.innerHTML = html + chatmessage.innerHTML;
  }

  addSystemMessage(text, convId) {
    this.addMessage({ author: "system", text, convId });
  }

  addUserMessage(text, convId) {
    this.addMessage({ author: "user", text, convId });
  }

  addAiMessage(text, convId) {
    this.addMessage({ author: "ai", text, convId });
  }

  clearChatMessages() {
    this.messages = [];
    const chatbox = this.components.chatBox;
    const chatmessage = chatbox.querySelector(".chatbox__messages");
    chatmessage.innerHTML = "";
  }
}

async function main() {
  const chatBox = new Chatbox();

  // configure sip connection
  const sipData = await getSipData();
  aor = sipData.aor;
  sipUser = await createSipUser(sipData.aor, sipData.sipServerEndpoint);
  // configure web page multimedia and sipUser handlers
  const audio = new Audio();
  sipUser.delegate = {
    onCallReceived: async () => {
      await sipUser.answer();
      audio.srcObject = sipUser.remoteMediaStream;
      audio.play();
      chatBox.addSystemMessage("Voice call started", chatBox.actualConvId);
    },
    onCallHangup: () => {
      audio.srcObject = null;
      chatBox.addSystemMessage("Voice call is over", chatBox.actualConvId);
    },
  };

  socket.on("system-close-conv", () => {
    // @todo fix conv id
    chatBox.addSystemMessage("Conversation is complete", chatBox.actualConvId);
  });

  socket.on("user-text", (e)=>{
    console.log(`Got user message ${JSON.stringify(e)}`)
    const {user_text,conversation_id} = e;
    chatBox.addUserMessage(user_text, conversation_id);
  });
  socket.on("ai-text", (e) => {
    console.log(`Got ai message ${JSON.stringify(e)}`)
    const {ai_response,conversation_id} = e;
    chatBox.addAiMessage(ai_response,conversation_id);
  });

  chatBox.display();
}

main();
