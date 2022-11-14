import EventEmitter from "eventemitter3";

export default class ConversationStorage extends EventEmitter {
  constructor() {
    super();
    this.rawInputs = new Map();
    this.queueOptions = new Map();
    this.jobIds = new Map();
  }
  save(convId, rawConvInput, queueOptions) {
    this.rawInputs.set(convId, rawConvInput);
    this.queueOptions.set(convId, queueOptions);
  }
  saveJobId(convId, jobId) {
    this.jobIds.set(convId, jobId);
  }
  has(convId) {
    return this.rawInputs.has(convId);
  }
  getRawInput(convId) {
    return this.rawInputs.get(convId);
  }
  getQueueOptions(convId) {
    return this.queueOptions.get(convId);
  }
  getJobId(convId) {
    return this.jobIds.get(convId);
  }
  delete(convId) {
    this.rawInputs.delete(convId);
    this.queueOptions.delete(convId);
    this.jobIds.delete(convId);
    if (this.rawInputs.size === 0) {
      this.emit("empty");
    }
  }
}
