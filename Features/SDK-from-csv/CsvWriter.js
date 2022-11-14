import fs from "fs";
import csvWriter from "csv-writer";
import moment from "moment";
import path from "path";

export default class CsvWriter {
  constructor(outputFilePath, dataTransformer, outputTransformSchema) {
    this.outputTransformSchema = outputTransformSchema
    this.dataTransformer = dataTransformer;
    const dirPath = path.dirname(path.resolve(outputFilePath));
    this._validateDirExists(dirPath);
    let header = Object.keys(this.outputTransformSchema).map((prop) => {
      return { id: prop, title: prop };
    });
    this.csvWriter = csvWriter.createObjectCsvWriter({
      alwaysQuote: true,
      path: outputFilePath,
      header,
    });
  }
  writeOutput(_conversationId, _executionStatus, params) {
    const _timestamp = this._getTimestamp();
    let csvOutput = {
      _conversationId,
      _executionStatus,
      _timestamp,
      ...params,
    };
    csvOutput = this.dataTransformer(csvOutput);
    this.csvWriter.writeRecords([csvOutput]);
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
}
