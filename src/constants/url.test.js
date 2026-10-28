const keys = ['NODE_ENV', 'REACT_APP_ENV', 'REACT_APP_API_URL', 'REACT_APP_USE_API_PROXY'];
let previous;
beforeEach(() => { previous = Object.fromEntries(keys.map(key => [key, process.env[key]])); process.env.REACT_APP_ENV = 'production'; process.env.REACT_APP_API_URL = 'https://adamsoncr.tekteachlms.com'; });
afterEach(() => { for (const key of keys) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; } });
function urls() { let value; jest.isolateModules(() => { value = require('./url'); }); return value; }
test('local production preview proxies requests while keeping document URLs remote', () => {
  process.env.NODE_ENV = 'development'; process.env.REACT_APP_USE_API_PROXY = 'true';
  expect(urls().API_REQUEST_BASE_URL).toBe(''); expect(urls().BASE_URL).toBe('https://adamsoncr.tekteachlms.com');
});
test('production builds always use the production API even if a proxy flag is set', () => {
  process.env.NODE_ENV = 'production'; process.env.REACT_APP_USE_API_PROXY = 'true';
  expect(urls().API_REQUEST_BASE_URL).toBe('https://adamsoncr.tekteachlms.com');
});
test('the development proxy is opt-in', () => {
  process.env.NODE_ENV = 'development'; delete process.env.REACT_APP_USE_API_PROXY;
  expect(urls().API_REQUEST_BASE_URL).toBe('https://adamsoncr.tekteachlms.com');
});
