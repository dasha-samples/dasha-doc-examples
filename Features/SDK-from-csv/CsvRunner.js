import dasha from "@dasha.ai/sdk";
import fs from "fs";
import csvWriter from "csv-writer";
import csvParser from "csv-parser";
import nextChunk from "next-chunk";
import Ajv from "ajv";
import moment from "moment";
import EventEmitter from "eventemitter3";
import path from "path";

class BadInputError extends Error {
  constructor(message) {
    super(message);
  }
}

const systemInputParamsSchema = {
  _before: (strValue) => {
    if (strValue === undefined) return undefined;
    return new Date(strValue);
  },
  _after: (strValue) => {
    if (strValue === undefined) return undefined;
    return new Date(strValue);
  },
  _priority: (strValue) => {
    if (strValue === undefined) return undefined;
    return Number(strValue);
  },
};
const systemOutputParamsSchema = {
  _conversationId: (value) => String(value),
  _timestamp: (strValue) => String(strValue),
  _executionStatus: (strValue) => strValue,
  _failReason: (strValue) => strValue,
  _recordingUrl: (strValue) => strValue,
  _startTime: (dateValue) => dateValue.toISOString(),
  _endTime: (dateValue) => dateValue.toISOString(),
};
const ExecutionStatus = {
  completed: "completed",
  failed: "failed",
  skipped: "skipped",
  rejected: "rejected",
  timeout: "timeout",
};

class AsyncTask {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class RawInputStorage extends EventEmitter {
  constructor() {
    super();
    this.storage = new Map();
  }
  save(convId, rawConvInput) {
    this.storage.set(convId, rawConvInput);
  }
  get(convId) {
    return this.storage.get(convId);
  }
  delete(convId) {
    this.storage.delete(convId);
    if (this.storage.size === 0) {
      this.emit("empty");
    }
  }
}

export default class CsvRunner {
  constructor() {
    /** @TODO check all params to be prvided */
    this.pathToInputCsv = null;
    this.pathToOutputCsv = null;
    /** params below are set in applyToApp */
    this._app = null;
    this._inputValidateFunction = null;
    this.inputTransformSchema = null;
    this.outputTransformSchema = null;
    this.task = null;

    this.convIdToRawInput = new RawInputStorage();
  }
  static create() {
    return new CsvRunner();
  }
  async applyToApp(app, inputSchema, outputSchema) {
    this._app = app;
    this.inputTransformSchema = { ...systemInputParamsSchema, ...inputSchema };
    this.outputTransformSchema = {
      ...systemOutputParamsSchema,
      /** add input params to output schema */
      ...Object.fromEntries(
        Object.keys(this.inputTransformSchema).map((key) => [key, String])
      ),
      ...outputSchema,
    };
    /** validate function built with application input schema */
    this._inputValidateFunction = new Ajv().compile(app.inputSchema);
    for (const prop of app.inputSchema.required ?? []) {
      if (this.inputTransformSchema[prop] === undefined) {
        throw new Error(
          `Provided input transform schema does not have transformer for property '${prop}' required by application`
        );
      }
    }
    for (const prop of app.outputSchema.required ?? []) {
      if (this.outputTransformSchema[prop] === undefined) {
        throw new Error(
          `Provided output transform schema does not have transformer for property '${prop}' required by application`
        );
      }
    }
    app.queue.on("rejected", (convId, error) => {
      const rawConvInput = this.convIdToRawInput.get(convId);
      this._writeOutput(convId, ExecutionStatus.rejected, {
        ...rawConvInput,
        _failReason: error.message,
      });
      this.convIdToRawInput.delete(convId);
    });
    app.queue.on("timeout", (convId) => {
      const rawConvInput = this.convIdToRawInput.get(convId);
      this._writeOutput(convId, ExecutionStatus.timeout, {
        ...rawConvInput,
        _failReason: "Conversation timed out",
      });
      this.convIdToRawInput.delete(convId);
    });
    app.queue.on("ready", async (convId, conv, info) => {
      const rawConvInput = this.convIdToRawInput.get(convId);
      conv.input = this._transformData(rawConvInput, this.inputTransformSchema);
      try {
        const convResult = await conv.execute();
        this._writeOutput(convId, ExecutionStatus.completed, {
          ...rawConvInput,
          _startTime: convResult.startTime,
          _endTime: convResult.endTime,
          _recordingUrl: convResult.recordingUrl,
          ...convResult.output,
        });
      } catch (error) {
        this._writeOutput(convId, ExecutionStatus.failed, {
          ...rawConvInput,
          _failReason: error.message,
        });
      } finally {
        this.convIdToRawInput.delete(convId);
      }
    });
  }
  async runCsv(pathToInputCsv, pathToOutputCsv) {
    const task = new AsyncTask();
    this.convIdToRawInput.on("empty", task.resolve);
    try {
      this._csvWriter = this._createCsvWriter(pathToOutputCsv);
      const numConversations = await this.validateAndEnqueueCsv(pathToInputCsv);
      console.log("numConvs", numConversations);
      if (numConversations === 0) {
        task.resolve();
      }
    } catch (e) {
      task.reject(e);
    }
    await task.promise;
    this.convIdToRawInput.off("empty", task.resolve);
  }
  async validateAndEnqueueCsv(pathToInputCsv) {
    const inputCsvStream = this._createCsvStream(pathToInputCsv);
    let inputIdx = 0;
    while (true) {
      const nextData = await this._readNextCsvData(inputCsvStream);
      if (nextData === null) break;
      const convId = `${pathToInputCsv}#${inputIdx++}`;

      let { rawConvInput, queuePushOptions } = nextData;
      try {
        /** throws BadInputError */
        this._validateInput(
          this._transformData(rawConvInput, this.inputTransformSchema)
        );
        /** save input to storage */
        this.convIdToRawInput.save(convId, rawConvInput);
        queuePushOptions = this._transformData(
          queuePushOptions,
          this.inputTransformSchema
        );
        await this._enqueueConv(convId, queuePushOptions);
      } catch (e) {
        throw new Error(
          `Could not read ${inputIdx}-th input ${JSON.stringify(
            rawConvInput
          )} of csv '${pathToInputCsv}': ${e.message}`
        );
      }
    }
    return inputIdx;
  }
  _createCsvStream(pathToInputCsv) {
    try {
      this._validateFileExists(pathToInputCsv);
    } catch (e) {
      throw new Error(
        `Could not create input stream from '${pathToInputCsv}': ${e.message}`
      );
    }
    return fs.createReadStream(pathToInputCsv).pipe(csvParser());
  }
  _createCsvWriter(filePath) {
    const dirPath = path.dirname(path.resolve(filePath));
    this._validateDirExists(dirPath);
    let header = Object.keys(this.outputTransformSchema).map((prop) => {
      return { id: prop, title: prop };
    });
    return csvWriter.createObjectCsvWriter({
      alwaysQuote: true,
      path: filePath,
      header,
    });
  }
  _getTimestamp() {
    return moment().format();
  }
  _writeOutput(_conversationId, _executionStatus, params) {
    const _timestamp = this._getTimestamp();
    let csvOutput = {
      _conversationId,
      _executionStatus,
      _timestamp,
      ...params,
    };
    csvOutput = this._transformData(csvOutput, this.outputTransformSchema);
    this._csvWriter.writeRecords([csvOutput]);
  }
  async _enqueueConv(convId, options) {
    options = {
      before: options._before,
      after: options._after,
      priority: options._priority,
    };
    return await this._app.queue.push(convId, options);
  }
  async _readNextCsvData(inputCsvStream) {
    /** read data from csv */
    const data = await nextChunk(inputCsvStream);
    /** handle csv EOF */
    if (data === null) return null;
    /** prepare raw conversation params */
    const rawConvInput = { ...data };
    delete rawConvInput._before;
    delete rawConvInput._after;
    delete rawConvInput._priority;
    /** prepare queue push options */
    const { _before, _after, _priority } = data;
    const queuePushOptions = {
      _before,
      _after,
      _priority,
    };
    return { rawConvInput, queuePushOptions };
  }
  _validateInput(inputParams) {
    if (!this._inputValidateFunction(inputParams)) {
      // console.log(this._inputValidateFunction.errors.)
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
  _validateFileExists(path) {
    if (!fs.existsSync(path)) {
      throw new Error(`Path '${path}' does not exist.`);
    }
    if (!fs.statSync(path).isFile()) {
      throw new Error(`'${path}' is not a file`);
    }
  }
  _validateDirExists(path) {
    if (!fs.existsSync(path)) {
      throw new Error(`Path '${path}' does not exist.`);
    }
    if (!fs.statSync(path).isDirectory()) {
      throw new Error(`'${path}' is not a directory`);
    }
  }
}
