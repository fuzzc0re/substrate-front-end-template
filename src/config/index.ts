import configCommon from './common.json';
// Using `require` as `import` does not support dynamic loading (yet).
const configEnv = require(`./${process.env.NODE_ENV}.json`);

// Accepting React env vars and aggregating them into `config` object.
const envVarNames = ['REACT_APP_PROVIDER_SOCKET', 'REACT_APP_DEVELOPMENT_KEYRING'];

const envVars = envVarNames.reduce((mem, n) => {
  // Remove the `REACT_APP_` prefix
  if (process.env[n] !== undefined) mem[n.slice(10)] = process.env[n];
  return mem;
}, {});

interface IConfig {
  // Types for ...configCommon
  APP_NAME: string;
  DEVELOPMENT_KEYRING: boolean;
  RPC: {};
  // Types for ...configEnv
  PROVIDER_SOCKET: string;
  // Types for ...envVars
  REACT_APP_PROVIDER_SOCKET: string;
  REACT_APP_DEVELOPMENT_KEYRING: boolean;
}

const config: IConfig = { ...configCommon, ...configEnv, ...envVars };
export default config;
