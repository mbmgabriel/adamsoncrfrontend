import { ENV, ENV_LIST } from './env';
import developmentConfig from './environments/development';
import productionConfig from './environments/production';
import stagingConfig from './environments/staging';
import { validateProductionSettings } from './productionSettings';

const environments = {
  [ENV_LIST.DEVELOPMENT]: developmentConfig,
  [ENV_LIST.STAGING]: stagingConfig,
  [ENV_LIST.PRODUCTION]: productionConfig,
};
const config = {
  ...environments[ENV],
  API: process.env.REACT_APP_API_URL || environments[ENV].API,
};
if (ENV === ENV_LIST.PRODUCTION) validateProductionSettings(config.API);
export default config;
