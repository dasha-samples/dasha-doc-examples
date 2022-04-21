const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./views/src/index.js",
  plugins: [new Dotenv()],
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "views/dist"),
  },
};
