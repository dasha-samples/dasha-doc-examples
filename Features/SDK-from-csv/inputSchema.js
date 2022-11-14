export default {
  /** do nothing, i.e. we will use raw string as an argument */
  endpoint: (arg) => arg,
  /** apply Number() to argmument 'numOperations', i.e. it's equal to (arg) => Number(arg) */
  numOperations: Number, 
  /** parse array from raw string provided in csv */
  coins: (coinsStr) => {
    /** transform string input */
    const coins = coinsStr.split(",").map((costStr) => Number(costStr.trim()));
    /** validate it */
    if (coins.length > 12) throw new Error(`Too much coins! Expected: 12, actual: ${coins.length}`)
    return coins;
  }
};
