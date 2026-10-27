export const ENV_LIST = {
  DEVELOPMENT: 'Development',
  STAGING: 'ALPHA',
  PRODUCTION: 'Production',
};

const requestedEnvironment = String(process.env.REACT_APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
const environments = {
  development: ENV_LIST.DEVELOPMENT,
  dev: ENV_LIST.DEVELOPMENT,
  test: ENV_LIST.DEVELOPMENT,
  staging: ENV_LIST.STAGING,
  alpha: ENV_LIST.STAGING,
  production: ENV_LIST.PRODUCTION,
  prod: ENV_LIST.PRODUCTION,
};
if (!Object.prototype.hasOwnProperty.call(environments, requestedEnvironment)) {
  throw new Error('REACT_APP_ENV must be development, staging, or production.');
}
export const ENV = environments[requestedEnvironment];
export const VERSION_CODE = 1;
export const VERSION_NAME = '1.0.0';
