const { createProxyMiddleware } = require('http-proxy-middleware');
const { validateProductionSettings } = require('./config/productionSettings');

module.exports = app => {
  if (process.env.NODE_ENV !== 'development' || process.env.REACT_APP_USE_API_PROXY !== 'true') return;
  const target = process.env.REACT_APP_API_URL;
  validateProductionSettings(target);
  app.use('/api', createProxyMiddleware({ target, changeOrigin: true, secure: true, logLevel: 'warn' }));
};
