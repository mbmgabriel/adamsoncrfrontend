const PRODUCTION_API_URL = 'https://adamsoncr.tekteachlms.com';

function validateProductionSettings(apiUrl) {
  let url;
  try {
    url = new URL(apiUrl);
  } catch {
    throw new Error('Production REACT_APP_API_URL must be an absolute HTTPS URL.');
  }
  const hostname = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('Production REACT_APP_API_URL must use HTTPS without credentials, query parameters, or fragments.');
  }
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '[::1]' || hostname === '0.0.0.0' || hostname.startsWith('127.')) {
    throw new Error('Production REACT_APP_API_URL cannot point to a loopback address.');
  }
}

module.exports = { PRODUCTION_API_URL, validateProductionSettings };
