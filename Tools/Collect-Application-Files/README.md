# Collect Dasha Application Files

This script collects application files into single `zip`-archive.

The script parses application config (`.dashaapp` file), collects files used in this config and all dependent `.dsl` files.

The script is implemented in file `zip-application.js`.

### Input parameters
- Path to folder with `.dashaapp` configuration file

### Usage

Import `zipApplication` function from `zip-application.js` file and pass path to application folder to it.

### Usage example
```js
const dasha = require("@dasha.ai/sdk");
const zipApplication = require("./zip-application");

const appZip = await zipApplication("example-app/app");
const app = await dasha.deploy(appZip);
```

See the `index.js` for full working example.


### Note 

The logic of this script will be built in Dasha SDK in upcoming releases.

The current script will be deleted as unnecessary.
