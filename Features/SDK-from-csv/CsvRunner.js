import dasha from "@dasha.ai/sdk";
import Ajv from "ajv";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import nextChunk from "next-chunk";
import csvWriter from "csv-writer";
import queue from "queue";
import { EventEmitter } from "events";


const systemInputParamsSchema = {
  _before: (strValue) => {
    if (strValue === "") strValue = undefined;
    if (strValue === undefined) return undefined;
    return new Date(strValue);
  },
  _after: (strValue) => {
    if (strValue === "") strValue = undefined;
    if (strValue === undefined) return undefined;
    return new Date(strValue);
  },
  _priority: (strValue) => {
    if (strValue === "") strValue = undefined;
    if (strValue === undefined) return undefined;
    return Number(strValue);
  },
  _channel: (strValue) => {
    if (strValue === "") strValue = undefined;
    if (strValue === undefined | strValue === "text" | strValue === "audio") return strValue;
    throw new Error(`Could not transform value of property '_channel'. Expected values: undefined, "text" or "audio", actual: ${strValue}`);
  }
};
const systemOutputParamsSchema = {
  _conversationId: (value) => String(value),
  _jobId: (value) => value,
  _timestamp: (strValue) => String(strValue),
  _executionStatus: (strValue) => strValue,
  _failReason: (strValue) => strValue,
  _recordingUrl: (strValue) => strValue,
  _startTime: (dateValue) => {
    if (dateValue === undefined) return undefined;
    return dateValue.toISOString()
  },
  _endTime: (dateValue) => {
    if (dateValue === undefined) return undefined;
    return dateValue.toISOString();
  },
};
const ExecutionStatus = {
  completed: "completed",
  failed: "failed",
  skipped: "skipped",
  rejected: "rejected",
  timeout: "timeout",
};

class BadInputError extends Error {
  constructor(message) {
    super(message);
  }
}

class CsvWriterError extends Error {
  constructor(message) {
    super(message);
  }
}

class AsyncTask {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

function validateFileExists(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`Path '${path}' does not exist.`);
  }
  if (!fs.statSync(path).isFile()) {
    throw new Error(`'${path}' is not a file`);
  }
}

function validateDirExists(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`Path '${path}' does not exist.`);
  }
  if (!fs.statSync(path).isDirectory()) {
    throw new Error(`'${path}' is not a directory`);
  }
}

class ConversationStorage extends EventEmitter {
  constructor() {
    super();
    this.rawInputs = new Map();
    this.queueOptions = new Map();
    this.jobIds = new Map();
    this.convOptions = new Map();
  }
  save(convId, rawConvInput, queueOptions, convOptions) {
    this.rawInputs.set(convId, rawConvInput);
    this.queueOptions.set(convId, queueOptions);
    this.convOptions.set(convId, convOptions);
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
  getConvOptions(convId) {
    return this.convOptions.get(convId);
  }
  getJobId(convId) {
    return this.jobIds.get(convId);
  }
  getSize(){
    return this.rawInputs.size;
  }
  delete(convId) {
    this.rawInputs.delete(convId);
    this.queueOptions.delete(convId);
    this.jobIds.delete(convId);
    this.convOptions.delete(convId);
    if (this.rawInputs.size === 0) {
      this.emit("empty");
    }
  }
}

class CsvReader {
  constructor(pathToInputCsv) {
    try {
      validateFileExists(pathToInputCsv);
    } catch (e) {
      throw new Error(
        `Could not create input stream from '${pathToInputCsv}': ${e.message}`
      );
    }
    this.inputCsvStream = fs.createReadStream(pathToInputCsv).pipe(csvParser());
  }
  async readNextCsvData() {
    /** read data from csv */
    const data = await nextChunk(this.inputCsvStream);
    /** handle csv EOF */
    if (data === null) return null;
    /** prepare raw conversation params */
    const rawConvInput = { ...data };
    delete rawConvInput._before;
    delete rawConvInput._after;
    delete rawConvInput._priority;
    delete rawConvInput._channel;
    /** prepare queue push options */
    const { _before, _after, _priority } = data;
    const queuePushOptions = {
      _before,
      _after,
      _priority,
    };
    const { _channel } = data;
    const convOptions = { _channel };
    return { rawConvInput, queuePushOptions, convOptions };
  }
}

class CsvWriter {
  constructor(dataTransformer, headers) {
    this.dataTransformer = dataTransformer;
    this.headers = headers;
    this.writers = {};
    this.taskQueue = queue({ autostart: true });
  }
  getWriter(outputFilePath) {
    const isAlreadyRegistered = this.writers[outputFilePath] !== undefined;
    if (!isAlreadyRegistered) {
      this._registerWriterForPath(outputFilePath)
    }
    const writeOutput = (_conversationId, _executionStatus, params) => {
      return this.writeOutputToFile(
        outputFilePath,
        _conversationId,
        _executionStatus,
        params
      );
    };
    return writeOutput;
  }
  _registerWriterForPath(outputFilePath) {
    const dirPath = path.dirname(path.resolve(outputFilePath));
    validateDirExists(dirPath);
    this._writeHeaders(outputFilePath, this.headers);

    this.writers[outputFilePath] = csvWriter.createObjectCsvWriter({
      alwaysQuote: true,
      path: outputFilePath,
      header: this.headers,
      append: true,
    });
  }
  writeOutputToFile(outputFilePath, _conversationId, _executionStatus, params) {
    if (this.writers[outputFilePath] === undefined) {
      throw new Error(`Unregistered path '${outputFilePath}'`);
    }
    const _timestamp = this._getTimestamp();
    let csvOutput = {
      _conversationId,
      _executionStatus,
      _timestamp,
      ...params,
    };
    const task = this.writers[outputFilePath]
      .writeRecords([this.dataTransformer(csvOutput)])
      .catch((e) => {
        throw new CsvWriterError(e.message);
      });
    this.taskQueue.push(function () {
      return task;
    });
  }
  _writeHeaders(outputFilePath, headers) {
    fs.writeFileSync(
      outputFilePath,
      `${headers.map(({ title }) => title).join(",")}\n`
    );
  }
  _getTimestamp() {
    return new Date().toISOString()
  }
}



export default class CsvRunner {
  constructor(app, inputSchema, outputSchema) {
    /** params below are set in applyToApp */
    this._app = app;
    this.csvInputTransformSchema = {
      ...systemInputParamsSchema,
      ...inputSchema,
    };
    this.csvOutputTransformSchema = {
      ...systemOutputParamsSchema,
      /** add input params to output schema */
      ...Object.fromEntries(
        Object.keys(this.csvInputTransformSchema).map((key) => [key, String])
      ),
      ...outputSchema,
    };
    const transformData = (data) =>
      this._transformData(data, this.csvOutputTransformSchema);
    const csvHeaders = Object.keys(this.csvOutputTransformSchema).map(
      (prop) => {
        return { id: prop, title: prop };
      }
    );
    this.csvWriter = new CsvWriter(transformData, csvHeaders);
    /** validate function built with application input schema */
    this._inputValidateFunction = new Ajv().compile(app.inputSchema);
    for (const prop of app.inputSchema.required ?? []) {
      if (this.csvInputTransformSchema[prop] === undefined) {
        throw new Error(
          `Provided input transform schema does not have transformer for property '${prop}' required by application`
        );
      }
    }
    for (const prop of app.outputSchema.required ?? []) {
      if (this.csvOutputTransformSchema[prop] === undefined) {
        throw new Error(
          `Provided output transform schema does not have transformer for property '${prop}' required by application`
        );
      }
    }
  }
  async runCsv(pathToInputCsv, pathToOutputCsv, options = {}) {
    options.configureConv = options.configureConv ?? ((conv) => {});
    if (options.logDirectory) {
      validateDirExists(options.logDirectory);
    }

    const conversationStorage = await this.readValidateCsv(pathToInputCsv);
    if (conversationStorage.rawInputs.size === 0) return;
    const task = new AsyncTask();
    conversationStorage.on("empty", task.resolve);
    await this._subscribeConversationsToApp(
      conversationStorage,
      pathToOutputCsv,
      // task,
      options
    );
    await this._enqueueConversations(conversationStorage);
    await task.promise;
    conversationStorage.off("empty", task.resolve);
  }
  async readValidateCsv(pathToInputCsv) {
    const conversationStorage = new ConversationStorage();
    const csvReader = new CsvReader(pathToInputCsv);
    let inputIdx = 0;
    while (true) {
      const convId = `${pathToInputCsv}#${inputIdx++}`;
      const nextData = await csvReader.readNextCsvData();
      if (nextData === null) break;

      let { rawConvInput, queuePushOptions, convOptions } = nextData;
      try {
        /** throws BadInputError */
        this._validateInput(
          this._transformData(rawConvInput, this.csvInputTransformSchema)
        );
        queuePushOptions = this._transformData(
          queuePushOptions,
          this.csvInputTransformSchema
        );
        convOptions = this._transformData(convOptions, this.csvInputTransformSchema);
        /** save input to storage */
        conversationStorage.save(convId, rawConvInput, queuePushOptions, convOptions);
      } catch (e) {
        throw new Error(
          `Could not read ${inputIdx}-th input ${JSON.stringify(
            rawConvInput
          )} of csv '${pathToInputCsv}': ${e.message}`
        );
      }
    }
    return conversationStorage;
  }
  async _subscribeConversationsToApp(
    conversationStorage,
    pathToOutputCsv,
    // task,
    options
  ) {
    const writeOutput = this.csvWriter.getWriter(pathToOutputCsv);

    const onRejected = (convId, error) => {
      if (!conversationStorage.has(convId)) return;
      writeOutput(convId, ExecutionStatus.rejected, {
        _jobId: conversationStorage.getJobId(convId),
        ...conversationStorage.getRawInput(convId),
        ...conversationStorage.getQueueOptions(convId),
        ...conversationStorage.getConvOptions(convId),
        _failReason: error.message,
      });
      conversationStorage.delete(convId);
      // if (conversationStorage.getSize() === 0) {
      //   task.resolve();
      //   unsubscribe();
      // }
    };
    const onTimeout = (convId) => {
      if (!conversationStorage.has(convId)) return;
      writeOutput(convId, ExecutionStatus.timeout, {
        _jobId: conversationStorage.getJobId(convId),
        ...conversationStorage.getRawInput(convId),
        ...conversationStorage.getQueueOptions(convId),
        ...conversationStorage.getConvOptions(convId),
        _failReason: "Conversation timed out",
      });
      conversationStorage.delete(convId);
      // if (conversationStorage.getSize() === 0) {
      //   task.resolve();
      //   unsubscribe();
      // }
    };
    const onReady = async (convId, conv, info) => {
      if (!conversationStorage.has(convId)) return;

      options.configureConv(conv);
      let logFile;
      if (options.logDirectory) {
        const logDirectory = options.logDirectory;
        logFile = await fs.promises.open(
          path.join(logDirectory, `${convId}.txt`),
          "w"
        );
        await logFile.appendFile("#".repeat(100) + "\n");
        conv.on("transcription", async (entry) => {
          await logFile.appendFile(`${entry.speaker}: ${entry.text}\n`);
        });
        conv.on("debugLog", async (event) => {
          if (event?.msg?.msgId === "RecognizedSpeechMessage") {
            const logEntry = event?.msg?.results[0]?.facts;
            await logFile.appendFile(
              JSON.stringify(logEntry, undefined, 2) + "\n"
            );
          }
        });
      }

      const convOptions = conversationStorage.getConvOptions(convId);
      if (convOptions._channel === "text") await dasha.chat.createConsoleChat(conv);
      const rawConvInput = conversationStorage.getRawInput(convId);
      conv.input = this._transformData(
        rawConvInput,
        this.csvInputTransformSchema
      );
      try {
        const convResult = await conv.execute({channel: convOptions._channel});
        writeOutput(convId, ExecutionStatus.completed, {
          _jobId: conversationStorage.getJobId(convId),
          ...rawConvInput,
          ...conversationStorage.getQueueOptions(convId),
          ...conversationStorage.getConvOptions(convId),
          _startTime: convResult.startTime,
          _endTime: convResult.endTime,
          _recordingUrl: convResult.recordingUrl,
          ...convResult.output,
        });
      } catch (error) {
        if (error instanceof CsvWriterError) {
          throw error;
        }
        writeOutput(convId, ExecutionStatus.failed, {
          _jobId: conversationStorage.getJobId(convId),
          ...rawConvInput,
          ...conversationStorage.getQueueOptions(convId),
          ...conversationStorage.getConvOptions(convId),
          _failReason: error.message,
        });
      } finally {
        conversationStorage.delete(convId);
        await logFile?.close();
        // if (conversationStorage.getSize() === 0) {
        //   task.resolve();
        //   unsubscribe();
        // }
      }
    };
    const unsubscribe = () => {
      this._app.queue.off("rejected", onRejected);
      this._app.queue.off("timeout", onTimeout);
      this._app.queue.off("ready", onReady);
    };

    this._app.queue.on("rejected", onRejected);
    this._app.queue.on("timeout", onTimeout);
    this._app.queue.on("ready", onReady);
    conversationStorage.on("empty", () => unsubscribe);
  }

  async _enqueueConversations(conversationStorage) {
    for (const [
      convId,
      queueOptions,
    ] of conversationStorage.queueOptions.entries()) {
      const { jobId } = await this._enqueueConv(convId, queueOptions);
      conversationStorage.saveJobId(convId, jobId);
    }
  }
  async _enqueueConv(convId, options) {
    options = {
      before: options._before,
      after: options._after,
      priority: options._priority,
    };
    return await this._app.queue.push(convId, options);
  }
  _validateInput(inputParams) {
    if (!this._inputValidateFunction(inputParams)) {
      throw new BadInputError(
        JSON.stringify(
          this._inputValidateFunction.errors
            ?.map(({ message }) => message)
            .join(",")
        )
      );
    }
  }
  _transformData(data, schema) {
    const transformedData = {};
    for (const param of Object.keys(data)) {
      const paramTransformer = schema[param];
      if (paramTransformer === undefined) {
        throw new Error(
          `Could not transform param '${param}': transformer is not set in schema`
        );
      }
      try {
        transformedData[param] = paramTransformer(data[param]);
      } catch (e) {
        throw new Error(`Could not transform param '${param}': ${e.message}`);
      }
    }
    return transformedData;
  }
}
