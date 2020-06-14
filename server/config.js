const Fs = require('fs');

// define constants
const DEFAULT_CONFIG_FILE_PATH = __dirname + '/config-default.json';

// create the JSON configuration object
let result;
let defaultJson = {};
if (Fs.existsSync(DEFAULT_CONFIG_FILE_PATH)) {
  const defaultContents = Fs.readFileSync(DEFAULT_CONFIG_FILE_PATH);
  defaultJson = JSON.parse(defaultContents);
  result = defaultJson;
} else {
  throw new Error('Config File Not Fount...');
}

// export the configuration
module.exports = result;
