import EventEmitter from "eventemitter3";

export class Chatbox extends EventEmitter {
  constructor() {
    super();
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

  setActualConversationId(convId) {
    this.actualConvId = convId;
  }

  async openChatBox() {
    const someConversationInput = {};
    this.emit("open-chatbox", someConversationInput);
    this.clearChatMessages();
    const chatBox = this.components.chatBox;
    chatBox.classList.add("chatbox--active");
  }

  async closeChatBox() {
    this.emit("close-chatbox");
    this.clearChatMessages();
    const chatBox = this.components.chatBox;
    chatBox.classList.remove("chatbox--active");
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
    this.emit("send-button", { userText });
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
