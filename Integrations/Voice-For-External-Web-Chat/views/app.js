var socket = io();
const api = "http://localhost:8080"

const getAccount = async () => {
  const response = await fetch(`${api}/sip`);
  const { aor, sipServerEndpoint } = await response.json();
  return { aor, sipServerEndpoint };
};

const createUser = async (aor, server) => {
  const user = new SIP.Web.SimpleUser(server, { aor });
  await user.connect();
  await user.register();
  return user;
};

class Chatbox {
  constructor(aor, user) {
    this.components = {
      openButton: document.querySelector(".chatbox__button"),
      chatBox: document.querySelector(".chatbox__support"),
      sendButton: document.querySelector(".send__button"),
    };

    this.state = false;
    this.messages = [];
    this.actualConvId = undefined;
    this.aor = aor;
    this.user = user;
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

  // createConversation(input, aor) {
  //   fetch(`${api}/create-conversation`, {
  //     method: "POST",
  //     body: JSON.stringify({ socketId: socket.id, input: {...input, endpoint: aor} }),
  //     mode: "cors",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((r) => r.json())
  //     .then((r) => {
  //       const { convId } = r;
  //       this.actualConvId = convId;
  //       socket.emit("system-reg-socket", { socket, convId });
  //       console.log("!!!!!!!!!!!!!!!!!REGISTRATED")
  //     });
  // }

  createConversation(input, aor) {
    const convId = "12345";
    socket.emit("system-create-conv", { socketId: socket.id, convId, input: {...input, endpoint: aor} });
  }

  openChatBox() {
    const chatBox = this.components.chatBox;
    this.clearChatMessages();
    /** If user opens chatbox, init the conversation in Dasha application */
    const mockConversationInput = {};
    this.createConversation(mockConversationInput, this.aor);
    
    this.addSystemMessage("Starting the conversation...", this.actualConvId);
    chatBox.classList.add("chatbox--active");
    // runCall(aor, "Peter").catch(() => {
    //   runButton.disabled = false;
    //   waitButton.hidden = true;
    // });
  }

  async closeChatBox() {
    await this.user.hangup().catch(() => {

    });

    const chatBox = this.components.chatBox;
    chatBox.classList.remove("chatbox--active");
    /** If user closes chatbox, close the conversation and clear output */
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

  async onSendButton(chatbox) {
    const textField = chatbox.querySelector("input");
    let userText = textField.value;
    if (userText == "") {
      return;
    }
    this.addUserMessage(userText, this.actualConvId);
    textField.value = "";
    if (this.actualConvId)
      socket.emit("user-text-message", {
        convId: this.actualConvId,
        text: userText,
      });
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
  const { aor, sipServerEndpoint } = await getAccount();
  const user = await createUser(aor, sipServerEndpoint);

  const audio = new Audio();
  user.delegate = {
    onCallReceived: async () => {
      await user.answer();
      audio.srcObject = user.remoteMediaStream;
      audio.play();
      chatBox.addSystemMessage("Voice call started", chatBox.actualConvId);
    },
    onCallHangup: () => {
      audio.srcObject = null;
      chatBox.addSystemMessage("Voice call is over", chatBox.actualConvId);
    },
  };
  const chatBox = new Chatbox(aor, user);

  socket.on("external-service-event", (e) => {
    const { messages, exit_dialogue, convId } = e;
    for (const text of messages) chatBox.addAiMessage(text, convId);
    if (exit_dialogue === true) {
      
      socket.emit("system-close-conv");
    }
  });

  socket.on("dasha-transcript", (transcription) => {
    console.log("GOT TRANSCRIPT", transcription)
    if (transcription.speaker == "human") {
      chatBox.addUserMessage(transcription.text, chatBox.actualConvId);
    } else {
      chatBox.addAiMessage(transcription.text, chatBox.actualConvId);
    }
  })
  socket.on("system-close-conv", () => {
    console.log("COMPELTE");
    chatBox.addSystemMessage("Conversation is complete", convId);
  })

  // socket.on("dasha-event", (transcription) => {

  // })

  chatBox.display();
}

main();
