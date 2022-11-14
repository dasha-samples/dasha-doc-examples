import dasha from "@dasha.ai/sdk";
import fs from "fs";
import csvWriter from "csv-writer";
import csvParser from "csv-parser";
import nextChunk from "next-chunk";
import Ajv from "ajv";
import moment from "moment";

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

export default class CsvRunner {
  constructor(pathToInputCsv, pathToOutputCsv) {
    /** @TODO check all params to be prvided */
    this.pathToInputCsv = pathToInputCsv;
    this.pathToOutputCsv = pathToOutputCsv;
    /** _lastInputIdx is set in exe */
    this._lastInputIdx = null;
    /** params below are set in applyToApp */
    this._app = null;
    this._inputValidateFunction = null;
    this.inputTransformSchema = null;
    this.outputTransformSchema = null;

    this.convIdToRawInput = {};
    this.convIdToOutput = {};
  }
  static create(pathToInputCsv, pathToOutputCsv) {
    return new CsvRunner(pathToInputCsv, pathToOutputCsv);
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
      const rawConvInput = this.convIdToRawInput[convId];
      this._writeOutput(convId, ExecutionStatus.rejected, {
        ...rawConvInput,
        _failReason: error.message,
      });
      delete this.convIdToRawInput[convId];
    });
    app.queue.on("timeout", (convId) => {
      const rawConvInput = this.convIdToRawInput[convId];
      this._writeOutput(convId, ExecutionStatus.timeout, {
        ...rawConvInput,
        _failReason: "Conversation timed out",
      });
      delete this.convIdToRawInput[convId];
    });
    app.queue.on("ready", async (convId, conv, info) => {
      const rawConvInput = this.convIdToRawInput[convId];
      conv.input = this._transformData(rawConvInput, this.inputTransformSchema);
      try {
        await conv.execute();
        this._writeOutput(convId, ExecutionStatus.completed, {
          ...rawConvInput,
          _startTime: convResult.startTime,
          _endTime: convResult.endTime,
          _recordingUrl: convResult.recordingUrl,
          ...convResult.output,
        });
      } catch (e) {
        this._writeOutput(convId, ExecutionStatus.failed, {
          ...rawConvInput,
          _failReason: error.message,
        });
      } finally {
        delete this.convIdToRawInput[convId];
      }
    });
  }

  async runCsv(pathToInputCsv, pathToOutputCsv) {
    try {
      this._validateFileExists(pathToInputCsv);
    } catch (e) {
      throw new Error(
        `Could not create input stream from '${pathToInputCsv}': ${e.message}`
      );
    }
    await this.validateAndEnqueueCsv(pathToInputCsv);
    this._csvWriter = this._createCsvWriter(pathToOutputCsv);
  }
  async validateAndEnqueueCsv(pathToInputCsv) {
    const inputCsvStream = this._createCsvStream(pathToInputCsv);
    while (true) {
      const nextData = await this._readNextCsvData(inputCsvStream);
      if (nextData === null) break;

      let { convId, rawConvInput, queuePushOptions } = nextData;
      try {
        /** throws BadInputError */
        this._validateInput(
          this._transformData(rawConvInput, this.inputTransformSchema)
        );
        /** save input to storage */
        this.convIdToRawInput[convId] = rawConvInput;
        queuePushOptions = this._transformCsvInput(queuePushOptions);
        await this._enqueueConv(convId, queuePushOptions);
      } catch (e) {
        throw new Error(
          `Could not read ${this._lastInputIdx}-th input ${JSON.stringify(
            rawConvInput
          )} of csv '${pathToInputCsv}': ${e.message}`
        );
      }
    }
  }

  async executeAllConversations() {
    const jobs = [];
    while (true) {
      const nextData = await this._readNextCsvData();
      try {
        if (nextData === null) break;
        const { convId, convInput, rawConvInput, queuePushOptions } =
          this._transformCsvData(nextData); // throws BadInputError

        const job = this._subscribeToConv(convId, convInput, rawConvInput);
        await this._enqueueConv(convId, queuePushOptions);
        jobs.push(job);
      } catch (e) {
        if (e instanceof BadInputError) {
          const convId = this._createPublicConvId(this._lastInputIdx);
          this._writeOutput(convId, ExecutionStatus.skipped, {
            ...nextData.rawConvInput,
            _failReason: e.message,
          });
        } else {
          throw e;
        }
      }
    }
    return await Promise.all(jobs);
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
    csvOutput = this._transformToCsvOutput(csvOutput);
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
  async _subscribeToConv(convId, input, rawInput) {
    const task = new AsyncTask();
    let convResult = undefined;
    const onReady = async (_convId, _conv, _info) => {
      if (_convId != convId) return;
      _conv.input = input;
      try {
        convResult = await _conv.execute();
        this._writeOutput(convId, ExecutionStatus.completed, {
          ...rawInput,
          _startTime: convResult.startTime,
          _endTime: convResult.endTime,
          _recordingUrl: convResult.recordingUrl,
          ...convResult.output,
        });
        task.resolve();
      } catch (error) {
        this._writeOutput(convId, ExecutionStatus.failed, {
          ...rawInput,
          _failReason: error.message,
        });
      }
    };
    this._app.queue.on("ready", onReady);
    await task.promise;
    this._app.queue.off("ready", onReady);
    return convResult;
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
    /** prepare public conversation key */
    const convId = this._createPublicConvId(this._lastInputIdx++);
    return { convId, rawConvInput, queuePushOptions };
  }
  _transformCsvData(data) {
    let { convId, rawConvInput, queuePushOptions } = data;
    /** prepare and validate input */
    const convInput = this._transformCsvInput(rawConvInput); // throws BadInputError
    this._validateInput(convInput); // BadInputError
    /** prepare queue push options */
    queuePushOptions = this._transformCsvInput(queuePushOptions);
    return { convId, convInput, rawConvInput, queuePushOptions };
  }

  //   /**
  //    * Transform each param using corresponding transformer defined in input transform schema
  //    * @param {*} rawInputParams raw input parameters read from file
  //    * @returns transformed params
  //    */
  //   _transformCsvInput(rawInputParams) {
  //     try {
  //       return this._transformData(rawInputParams, this.inputTransformSchema);
  //     } catch (e) {
  //       throw new BadInputError(`Could not transform input: ${e.message}`);
  //     }
  //   }
  _validateInput(inputParams) {
    if (!this._inputValidateFunction(inputParams)) {
      throw new BadInputError(_appInputSchemaValidator.errors?.join("\n"));
    }
  }
  _transformToCsvOutput(outputParams) {
    return this._transformData(outputParams, this.outputTransformSchema);
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
  _createPublicConvId(idx) {
    return `${this.pathToInputCsv}#${idx}`;
  }
}
