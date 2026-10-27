// Load the same production env files as react-scripts before checking the target.
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';
require('react-scripts/config/env');

const { PRODUCTION_API_URL, validateProductionSettings } = require('../src/config/productionSettings');
const target = (process.env.REACT_APP_ENV || 'production').toLowerCase();
if (!['production', 'prod'].includes(target)) {
  throw new Error('Production builds require REACT_APP_ENV=production. Remove development or staging overrides before building.');
}
validateProductionSettings(process.env.REACT_APP_API_URL || PRODUCTION_API_URL);
process.env.REACT_APP_ENV = 'production';
process.env.GENERATE_SOURCEMAP = 'false';
require('react-scripts/scripts/build');
