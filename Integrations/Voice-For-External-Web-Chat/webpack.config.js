const path = require('path');

module.exports = {
  entry: './views/src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'views/dist'),
  },
};