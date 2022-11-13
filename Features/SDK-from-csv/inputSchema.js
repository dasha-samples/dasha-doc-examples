export default {
  endpoint: String,
  // name: String,
  // step: Number,
  coins: (coinsStr) =>
    coinsStr.split(",").map((costStr) => Number(costStr.trim())),
};
