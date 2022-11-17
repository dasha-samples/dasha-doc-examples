import fs from "fs";
import csvWriter from "csv-writer";
import moment from "moment";
import path from "path";
import queue from "queue";

export class CsvWriterError extends Error {
  constructor(message) {
    super(message);
  }
}

export default class CsvWriter {
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
    this._validateDirExists(dirPath);
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
    // throw new Error("HAHAHA")
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
    return moment().format();
  }
  _validateDirExists(path) {
    if (!fs.existsSync(path)) {
      throw new Error(`Path '${path}' does not exist.`);
    }
    if (!fs.statSync(path).isDirectory()) {
      throw new Error(`'${path}' is not a directory`);
    }
  }
  _validateFileExists(path) {
    if (!fs.existsSync(path)) {
      throw new Error(`Path '${path}' does not exist.`);
    }
    if (!fs.statSync(path).isFile()) {
      throw new Error(`'${path}' is not a file`);
    }
  }
  _checkFileExists(path) {
    try {
      this._validateFileExists(path);
      return true;
    } catch (e) {
      return false;
    }
  }
}
