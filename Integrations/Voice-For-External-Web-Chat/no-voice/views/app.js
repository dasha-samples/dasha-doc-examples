var socket = io();

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

  createConversation(input) {
    fetch("http://localhost:8080/create-conversation", {
        method: "POST",
        body: JSON.stringify({socketId: socket.id, input}),
        mode: "cors",
        headers: {
            "Content-Type": "application/json"
        }
      }).then(r => r.json())
      .then(r => {
          const {convId} = r;
          this.actualConvId = convId;
      })
  }

  openChatBox() {
    const chatBox = this.components.chatBox;
    this.clearChatMessages();
      /** If user opens chatbox, init the conversation in Dasha application */
      const mockConversationInput = {};
      this.createConversation(mockConversationInput);
      this.addSystemMessage("Starting the conversation...", this.actualConvId);
      chatBox.classList.add("chatbox--active");
  }

  closeChatBox() {
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
      socket.emit("user-text-message", { convId: this.actualConvId, text: userText });
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

const chatBox = new Chatbox();

socket.on("external-service-event", async (e) => {
  const {message, convId} = e;
  if (message) chatBox.addAiMessage(message, convId);
  else {
    console.log("COMPELTE")
    chatBox.addSystemMessage("Conversation is complete", convId);
    socket.emit("system-close-conv")
  }
    
})

chatBox.display();
