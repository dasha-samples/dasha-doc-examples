import fs from "fs";
import csvParser from "csv-parser";
import nextChunk from "next-chunk";

export default class CsvReader {
  constructor(pathToInputCsv) {
    try {
      this._validateFileExists(pathToInputCsv);
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
    /** prepare queue push options */
    const { _before, _after, _priority } = data;
    const queuePushOptions = {
      _before,
      _after,
      _priority,
    };
    return { rawConvInput, queuePushOptions };
  }
  _validateFileExists(path) {
    if (!fs.existsSync(path)) {
      throw new Error(`Path '${path}' does not exist.`);
    }
    if (!fs.statSync(path).isFile()) {
      throw new Error(`'${path}' is not a file`);
    }
  }
}
