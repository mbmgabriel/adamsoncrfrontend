const keys = ['NODE_ENV','REACT_APP_ENV','REACT_APP_API_URL'];
let previous;
beforeEach(()=>{previous=Object.fromEntries(keys.map(key=>[key,process.env[key]]));delete process.env.REACT_APP_ENV;delete process.env.REACT_APP_API_URL;});
afterEach(()=>{for(const key of keys){if(previous[key]===undefined)delete process.env[key];else process.env[key]=previous[key];}});
function getConfig(){let config;jest.isolateModules(()=>{config=require('./application').default;});return config;}

test.each(['development','test'])('%s uses the local API without an override',mode=>{
  process.env.NODE_ENV=mode;
  expect(getConfig().API).toBe('http://localhost:3000');
});
test('production builds select the production API',()=>{
  process.env.NODE_ENV='production';
  expect(getConfig().API).toBe('https://adamsoncr.tekteachlms.com');
});
test('an explicit development target overrides the production build default',()=>{
  process.env.NODE_ENV='production';process.env.REACT_APP_ENV='development';
  expect(getConfig().API).toBe('http://localhost:3000');
});
test.each(['development','staging'])('%s supports an explicit API override',mode=>{
  process.env.REACT_APP_ENV=mode;process.env.REACT_APP_API_URL='http://localhost:4100';
  expect(getConfig().API).toBe('http://localhost:4100');
});
test('production supports an HTTPS API override',()=>{
  process.env.REACT_APP_ENV='production';process.env.REACT_APP_API_URL='https://api.example.com';
  expect(getConfig().API).toBe('https://api.example.com');
});
test.each([
  'http://api.example.com', 'https://localhost:3000', 'https://127.0.0.1',
  'https://[::1]', '/api', 'https://user:password@api.example.com',
  'https://api.example.com?token=secret', 'https://api.example.com#fragment',
])('production rejects unsafe API configuration: %s',api=>{
  process.env.REACT_APP_ENV='production';process.env.REACT_APP_API_URL=api;
  expect(getConfig).toThrow(/Production REACT_APP_API_URL/);
});
test('invalid environment targets fail instead of selecting an unintended API',()=>{
  process.env.REACT_APP_ENV='unknown';
  expect(getConfig).toThrow('REACT_APP_ENV must be development, staging, or production.');
});
