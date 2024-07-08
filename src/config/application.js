import {ENV, ENV_LIST} from './env';
import developmentConfig from './environments/development';
import productionConfig from './environments/production';
import stagingConfig from './environments/staging';

let config = {};

switch (ENV) {
  case ENV_LIST.DEVELOPMENT:
    config = developmentConfig;
    break;
  case ENV_LIST.STAGING:
    config = stagingConfig;
    break;
  case ENV_LIST.PRODUCTION:
    config = productionConfig;
    break;
  default:
    break;
}

// config.FROALA_LICENSE = 'lSA3D-17E4B3A2B2E1F1rXYb1VPUGRHYZNRJd1JVOOb1HAc1zG2B1A2D3D6B1A1C4E1A3=='

export default config;
