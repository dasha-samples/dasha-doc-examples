import dasha from "@dasha.ai/sdk";
import fs from "fs";
import { createObjectCsvWriter } from "csv-writer";
import csv from "csv-parser";
import nextChunk from "next-chunk";

const defaultInputParamTransformer = (valueStr) => valueStr;
const defaultOutputParamTransformer = (value) => JSON.stringify(value);
const systemInputParamsSchema = {
  _before: (value) => new Date(value),
  _after: (value) => new Date(value),
  _priority: (value) => Number(value),
};
const systemOutputParamsSchema = {
  _executionStatus: (value) => value,
  _failReason: (value) => value,
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
  constructor(pathToInputCsv, pathToOutputCsv, inputSchema, outputSchema) {
    /** @TODO check all params to be prvided */
    this.pathToInputCsv = pathToInputCsv;
    this.pathToOutputCsv = pathToOutputCsv;
    this.inputTransformSchema = { ...systemInputParamsSchema, ...inputSchema };
    this.outputTransformSchema = {
      ...systemOutputParamsSchema,
      ...outputSchema,
    };

    try {
        this._validateFileExists(pathToInputCsv);
    } catch(e) {
        throw new Error(`Could not create input stream from '${pathToInputCsv}': ${e.message}`)
    }
    this._inputStream = fs.createReadStream(pathToInputCsv).pipe(csv());
    this._lastInputIdx = 0;
    this._app = null;
    this._appInputSchema = null;
    this._appOutputSchema = null;

    this._writeCsvHeaders();
  }
  static create(pathToInputCsv, pathToOutputCsv, inputSchema, outputSchema) {
    const instance = new CsvRunner(
      pathToInputCsv,
      pathToOutputCsv,
      inputSchema,
      outputSchema
    );
    return instance;
  }
  async executeAllConversations() {
    const jobs = [];
    /** @TODO skip conversation if we could not read input */
    // do {
    //     let nextData = await this._readNextInput().catch(/**skip */).then(/** enque, exec */).catch(/**fail */);
    // } while (condition);
    let nextData = await this._readNextInput();
    while (nextData !== null) {
      const { key, input, queuePushOptions } = nextData;
      console.log("running conv with", nextData);
      /** explicitly enqueue conversation to ensure the queue order */
      await this._enqueueConversation(key, queuePushOptions);
      jobs.push(this._executeConversation(key, input, queuePushOptions, false));
      nextData = await this._readNextInput();
    }
    return await Promise.all(jobs);
  }
  async runNextConversation() {
    const data = await this._readNextInput();
    if (data === null) return null;
    const { key, input, queuePushOptions } = data;
    await this._executeConversation(key, input, queuePushOptions, true);
  }
  async _enqueueConversation(key, options) {
    await this._app.queue.push(key, options);
  }
  async _executeConversation(key, input, queuePushOptions, needEnqueuing = false) {
    const task = new AsyncTask();
    let output = undefined;
    const onReady = async (_key, _conv, _info) => {
      console.log(`[${key}-handler] ready:`, { _key, input, _info });
      if (_key != key) return;
      _conv.input = input;
      /** @TODO handle conv errors */
      /** @TODO use executionStatus: completed, failed */
      output = await _conv.execute();
      task.resolve();
    };
    this._app.queue.on("ready", onReady);
    if (needEnqueuing === true) {
      await this._enqueueConversation(key, queuePushOptions);
    }
    await task.promise;
    this._app.queue.off("ready", onReady);
    return output;
  }

  async _readNextInput() {
    let data = await nextChunk(this._inputStream);
    if (data === null) return null;
    data = this._transformRawInputData(data);
    /** prepare queue push options */
    const [before, after, priority] = [
        data._before,
        data._after,
        data._priority,
    ];
    const queuePushOptions = { before, after, priority };
    /** prepare and validate input */
    const input = data; 
    delete input._before;
    delete input._after;
    delete input._priority;
    this._validateInput(input);
    /** prepare public conversation key */
    const key = `${this.pathToInputCsv}-${this._lastInputIdx++}`;
    return { key, input, queuePushOptions };
  }

  async applyToApp(app) {
    this._app = app;
    this._appInputSchema = app.inputSchema;
    this._appOutputSchema = app.outputSchema;
  }

  /**
   * Transform each param using corresponding transformer defined in input transform schema
   * @param {*} rawInputParams raw input parameters read from file
   * @returns transformed params
   */
  _transformRawInputData(rawInputParams) {
    const inputParams = {};
    for (const param of Object.keys(rawInputParams)) {
      const paramTransformer = this.inputTransformSchema[param];
      if (paramTransformer === undefined) {
        throw new Error(
          `Could not transform param '${param}': transformer is not set in input schema`
        );
      }
      try {
        inputParams[param] = paramTransformer(rawInputParams[param]);
      } catch (e) {
        throw new Error(`Could not transform param '${param}': ${e.message}`);
      }
    }
    return inputParams;
  }
  _validateInput(inputParams) {}
  _transformOutput(outputParams) {
    // for each param use corresponding transformer, defined in schema
    // if there is no transformer, use default
  }
  _validateFileExists(path) {
    if (!fs.existsSync(path)) {
        throw new Error(`Path '${path}' does not exist.`);
    };
    if (!fs.statSync(path).isFile()) {
        throw new Error(`'${path}' is not a file`);
    }
  }

  _createOutputCsv() {
    /** @TODO create path to output */
    _writeCsvHeaders();
  }
  _writeCsvHeaders() {}
  _writeConvOutput(output) {
    // throw error if output does not correspond to schema
    // append output to csv
    /**
     * NOTE
     * system csv properties:
     * - _executionStatus
     * - _failReason
     * -
     */
  }
}

// module.exports = CsvRunner
/*

    async _enqueueConvs(){
        // enqueue all conversations 
        // create promises for all jobs
    }
    async awaitAllExecutions(){
        // await Promise.all(all_the_jobs)
    }
    async runConvs(){
        await this.enqueueConvs();
        // create promise for each enqueued conversation
    }

    readInputCsv(pathToCsv){
        // read csv
        // tranform each input
        // save inputs in this._inputs by their ids

        // let _id = 0;
        // for await (let data of fs.createReadStream(pathToCsv).pipe(csv())) {
        //     data = { _id, ...this._transformInput(data) };

        // }
    }
*/
