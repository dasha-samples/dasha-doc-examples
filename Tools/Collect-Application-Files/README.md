# Collect Dasha Application Files

This script collects application files into single `zip`-archive.

The script parses application config (`.dashaapp` file), collects files used in this config and all dependent `.dsl` files.

### Input parameters
- Path to folder with `.dashaapp` configuration file

### Usage example
```js
const dasha = require("@dasha.ai/sdk");
const zipApplication = require("./zip-application");

const appZip = await zipApplication("example-app/app");
const app = await dasha.deploy(appZip);
```


### Note 

The logic of this script will be built in Dasha SDK in upcoming releases.

The current script will be deleted as unnecessary.
