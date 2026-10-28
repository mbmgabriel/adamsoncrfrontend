import config from '../config/application'
export const BASE_URL = config.API
// Local preview can proxy API requests to HTTPS production without browser CORS.
// Production builds always call the configured API directly.
export const API_REQUEST_BASE_URL = process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_API_PROXY === 'true' ? '' : BASE_URL;
