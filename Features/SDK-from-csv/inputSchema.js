/** Schema for csv-input transformation (from string to desired type) */
export default {
  /** apply String() to argmument 'endpoint', i.e. it's equal to (arg) => String(arg) */
  endpoint: String,
  /** check if argument is of particular values */
  operation: (operationStr) => {
    if (operationStr === "get" | operationStr === "put") return operationStr;
    throw new Error(`Unknown operation: '${operationStr}'`)
  }, 
  /** parse array from raw string provided in csv */
  coins: (coinsStr) => {
    /** transform string input */
    const coins = coinsStr.split(",").map((costStr) => Number(costStr.trim()));
    /** validate it */
    if (coins.length > 12) throw new Error(`Too much coins! Expected: 12, actual: ${coins.length}`)
    return coins;
  }
};
