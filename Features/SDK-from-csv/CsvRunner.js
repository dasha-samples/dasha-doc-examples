import CsvWriter from "./CsvWriter.js";
import CsvReader from "./CsvReader.js";
import ConversationStorage from "./ConversationStorage.js";
import Ajv from "ajv";

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
  _jobId: (value) => value,
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
  constructor(app, inputSchema, outputSchema) {
    /** params below are set in applyToApp */
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
  }
  async runCsv(pathToInputCsv, pathToOutputCsv, options) {
    /** @TODO */
    // const { convConfigurer, convLogDir } = options;

    const conversationStorage = await this.readValidateCsv(pathToInputCsv);
    if (conversationStorage.rawInputs.size === 0) return;
    const task = new AsyncTask();
    conversationStorage.on("empty", task.resolve);
    await this._subscribeConversationsToApp(
      conversationStorage,
      pathToOutputCsv
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

      let { rawConvInput, queuePushOptions } = nextData;
      try {
        /** throws BadInputError */
        this._validateInput(
          this._transformData(rawConvInput, this.inputTransformSchema)
        );
        queuePushOptions = this._transformData(
          queuePushOptions,
          this.inputTransformSchema
        );
        /** save input to storage */
        conversationStorage.save(convId, rawConvInput, queuePushOptions);
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
  async _subscribeConversationsToApp(conversationStorage, pathToOutputCsv) {
    const transformData = (data) =>
      this._transformData(data, this.outputTransformSchema);
    const csvWriter = new CsvWriter(
      pathToOutputCsv,
      transformData,
      this.outputTransformSchema
    );
    const onRejected = (convId, error) => {
      if (!conversationStorage.has(convId)) return;
      const rawConvInput = conversationStorage.getRawInput(convId);
      csvWriter.writeOutput(convId, ExecutionStatus.rejected, {
        _jobId: conversationStorage.getJobId(convId),
        ...rawConvInput,
        _failReason: error.message,
      });
      conversationStorage.delete(convId);
    };
    const onTimeout = (convId) => {
      if (!conversationStorage.has(convId)) return;
      const rawConvInput = conversationStorage.getRawInput(convId);
      csvWriter.writeOutput(convId, ExecutionStatus.timeout, {
        _jobId: conversationStorage.getJobId(convId),
        ...rawConvInput,
        _failReason: "Conversation timed out",
      });
      conversationStorage.delete(convId);
    };
    const onReady = async (convId, conv, info) => {
      if (!conversationStorage.has(convId)) return;
      const rawConvInput = conversationStorage.getRawInput(convId);
      conv.input = this._transformData(rawConvInput, this.inputTransformSchema);
      try {
        const convResult = await conv.execute();
        csvWriter.writeOutput(convId, ExecutionStatus.completed, {
          _jobId: conversationStorage.getJobId(convId),
          ...rawConvInput,
          _startTime: convResult.startTime,
          _endTime: convResult.endTime,
          _recordingUrl: convResult.recordingUrl,
          ...convResult.output,
        });
      } catch (error) {
        csvWriter.writeOutput(convId, ExecutionStatus.failed, {
          _jobId: conversationStorage.getJobId(convId),
          ...rawConvInput,
          _failReason: error.message,
        });
      } finally {
        conversationStorage.delete(convId);
      }
    };
    this._app.queue.on("rejected", onRejected);
    this._app.queue.on("timeout", onTimeout);
    this._app.queue.on("ready", onReady);
    conversationStorage.on("empty", () => {
      this._app.queue.off("rejected", onRejected);
      this._app.queue.off("timeout", onTimeout);
      this._app.queue.off("ready", onReady);
    });
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
