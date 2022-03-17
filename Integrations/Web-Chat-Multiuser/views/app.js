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

  toggleState() {
    const chatBox = this.components.chatBox;
    this.state = !this.state;
    if (this.state) {
      this.clearChatMessages();
      /** If user opens chatbox, init the conversation in Dasha application */
      this.actualConvId = new Date().getMilliseconds().toString();
      this.addSystemMessage("Starting the conversation...", this.actualConvId);
      socket.emit("system-start-conv", { convId: this.actualConvId });
      chatBox.classList.add("chatbox--active");
    } else {
      document
        .querySelector(".chatbox__support")
        .classList.remove("chatbox--active");
      /** If user closes chatbox, close the conversation and clear output */
      socket.emit("system-interrupt-conv");
      this.clearChatMessages();
    }
  }

  async onSendButton(chatbox) {
    var textField = chatbox.querySelector("input");
    let userText = textField.value;
    if (userText == "") {
      return;
    }
    this.addUserMessage(userText, this.actualConvId);
    socket.emit("user-message", { convId: this.actualConvId, text: userText });
    textField.value = "";
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

socket.on("ai-message", (data) => {
  const { text, convId } = data;
  chatBox.addAiMessage(text, convId);
});

socket.on("system-conv-completed", (data) => {
  const { result, convId } = data;
  chatBox.addSystemMessage(
    `output: ${JSON.stringify(result.output, null, 2)}`,
    convId
  );
});

socket.on("system-conv-closed", (data) => {
  const { convId } = data;
  chatBox.addSystemMessage("Conversation is completed", convId);
});

socket.on("system-conv-interrupted", (data) => {
  const { convId } = data;
  chatBox.addSystemMessage("Conversation is interrupted", convId);
});

chatBox.display();
