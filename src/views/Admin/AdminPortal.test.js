/* eslint-disable testing-library/no-unnecessary-act -- Uses native React roots, matching the repository tests. */
import React, {
  act
} from 'react';
import {
  createRoot
} from 'react-dom/client';
import {
  MemoryRouter
} from 'react-router-dom';
import AdminPortal from './AdminPortal';
const mockGet = jest.fn(),
  mockSave = jest.fn();
jest.mock('../../api/AdminAPI', () => jest.fn().mockImplementation(() => ({
  get: (...args) => mockGet(...args),
  save: (...args) => mockSave(...args)
})));
jest.mock('../../components/Layout/MainContainer', () => ({
  children
}) => <div>{children}</div>);
const session = {
  colleges: [{
    id: 1,
    name: 'Science',
    active: true
  }, {
    id: 2,
    name: 'Retired College',
    active: false
  }],
  departments: [{
    id: 10,
    college_id: 1,
    dept_name: 'Biology',
    active: true
  }],
  roles: [{
    id: 1,
    role_name: 'Administrator'
  }, {
    id: 2,
    role_name: 'Researcher'
  }],
  statuses: [{
    id: 5,
    status: 'For Revision'
  }]
};
let root, container;
const settle = async () => act(async () => {
  await new Promise(resolve => setTimeout(resolve, 220));
});
async function open(path = '/admin/colleges') {
  await act(async () => root.render(<MemoryRouter initialEntries={[path]}><AdminPortal/></MemoryRouter>));
  await settle();
}
const button = title => [...document.querySelectorAll('button')].find(node => node.textContent.trim() ===
  title);
const click = async node => {
  expect(node).toBeTruthy();
  await act(async () => node.click());
};
const input = (id, value) => act(() => {
  const node = document.getElementById(id);
  const setter = Object.getOwnPropertyDescriptor(node.tagName === 'SELECT' ? HTMLSelectElement.prototype :
    HTMLInputElement.prototype, 'value').set;
  setter.call(node, value);
  node.dispatchEvent(new Event(node.tagName === 'SELECT' ? 'change' : 'input', {
    bubbles: true
  }));
});
async function submit() {
  await act(async () => document.querySelector('.modal form').dispatchEvent(new Event('submit', {
    bubbles: true,
    cancelable: true
  })));
  await settle();
}
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  mockGet.mockReset();
  mockSave.mockReset();
  mockGet.mockImplementation(async path => ({
    ok: true,
    data: path === 'session' ? session : {
      rows: [],
      total: 0,
      pageSize: 20
    }
  }));
  mockSave.mockResolvedValue({
    ok: true,
    data: {
      id: 3
    }
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});
test('denies access when the backend rejects administrator permissions', async () => {
  mockGet.mockResolvedValue({
    ok: false,
    status: 403,
    data: {}
  });
  await open();
  expect(document.body.textContent).toContain('Administrator access is required.');
  expect(button('Add college')).toBeUndefined();
});
test('creates a college and shows persistence confirmation', async () => {
  await open();
  await click(button('Add college'));
  input('admin-name', 'College of Computing');
  input('admin-initials', 'CC');
  await submit();
  expect(mockSave).toHaveBeenCalledWith('colleges', {
    name: 'College of Computing',
    initials: 'CC',
    active: true
  });
  expect(document.body.textContent).toContain('Changes saved.');
});
test('keeps a failed save open with its error and entered values', async () => {
  mockSave.mockResolvedValue({
    ok: false,
    data: {
      message: 'This college already exists.'
    }
  });
  await open();
  await click(button('Add college'));
  input('admin-name', 'Science');
  await submit();
  expect(document.body.textContent).toContain('This college already exists.');
  expect(document.getElementById('admin-name').value).toBe('Science');
});
test('department creation offers active colleges and submits the relationship', async () => {
  await open('/admin/departments');
  await click(button('Add department'));
  expect(document.getElementById('admin-college_id').textContent).not.toContain('Retired College');
  input('admin-dept_name', 'Computer Science');
  input('admin-college_id', '1');
  await submit();
  expect(mockSave).toHaveBeenCalledWith('departments', expect.objectContaining({
    dept_name: 'Computer Science',
    college_id: '1',
    active: true
  }));
});
test('application inspection displays records without approval controls', async () => {
  mockGet.mockImplementation(async path => ({
    ok: true,
    data: path === 'session' ? session : path === 'applications' ? {
      rows: [{
        id: 9,
        type: 'research',
        title: 'Local research',
        status: 'For Revision'
      }],
      total: 1,
      pageSize: 20
    } : {
      record: {
        title: 'Local research'
      },
      history: [{
        remarks: 'Please revise the abstract.'
      }],
      versions: []
    }
  }));
  await open('/admin/applications');
  await click(button('View'));
  expect(document.body.textContent).toContain('Please revise the abstract.');
  expect([...document.querySelectorAll('button')].some(b => /approve|reject|override/i.test(b
    .textContent))).toBe(false);
});

test('switching admin sections does not render previous-section rows in the new view',async()=>{
  mockGet.mockImplementation(async path=>({ok:true,data:path==='session'?session:path==='colleges'?{rows:[{id:1,name:'Science',active:true}],total:1,pageSize:20}:path==='applications'?{rows:[{id:9,type:'research',title:'Local research',status:'Pending'}],total:1,pageSize:20}:{users:10,colleges:1,departments:1,applications:1,pending:1,byType:[]}}));
  await open('/admin/colleges');
  const nav = title => [...document.querySelectorAll('nav a')].find(a=>a.textContent.trim()===title);
  await click(nav('Applications'));await settle();
  expect(document.body.textContent).toContain('Local research');
  await click(nav('Overview'));await settle();
  expect(document.body.textContent).toContain('Application activity');
  expect(document.body.textContent).not.toContain('Local research');
});

test('uses the shared loader while administrator access is pending', async () => {
  let finish;
  mockGet.mockImplementation(path => path === 'session' ? new Promise(resolve => {finish=resolve;}) : Promise.resolve({ok:true,data:{rows:[],total:0,pageSize:20}}));
  await act(async()=>root.render(<MemoryRouter initialEntries={['/admin/colleges']}><AdminPortal/></MemoryRouter>));
  expect(container.querySelector('.portal-loader__spinner')).not.toBeNull();
  expect(container.textContent).toContain('Checking administrator access…');
  await act(async()=>finish({ok:true,data:session}));
  await settle();
  expect(container.querySelector('.portal-loader')).toBeNull();
});

test('a rejected section request stops the loader and can be retried', async () => {
  let attempts=0;
  mockGet.mockImplementation(async path => {
    if(path==='session') return {ok:true,data:session};
    if(attempts++===0) throw new Error('Connection interrupted');
    return {ok:true,data:{rows:[],total:0,pageSize:20}};
  });
  await open();
  expect(container.textContent).toContain('Records could not be loaded. Please try again.');
  expect(container.querySelector('.portal-loader')).toBeNull();
  await click(button('Retry'));await settle();
  expect(container.textContent).toContain('No matching records.');
  expect(container.querySelector('.portal-loader')).toBeNull();
});

test('closing a loading application prevents its late response from reopening the modal', async () => {
  let finish;
  mockGet.mockImplementation(path => path==='session' ? Promise.resolve({ok:true,data:session}) : path==='applications' ? Promise.resolve({ok:true,data:{rows:[{id:9,type:'research',title:'Pending research'}],total:1,pageSize:20}}) : new Promise(resolve=>{finish=resolve;}));
  await open('/admin/applications');await click(button('View'));
  expect(document.querySelector('.modal .portal-loader')).not.toBeNull();
  expect(document.body.textContent).toContain('Loading application…');
  await click(button('Close'));
  await act(async()=>finish({ok:true,data:{record:{title:'Late research'},history:[],versions:[]}}));
  await act(async()=>{await new Promise(resolve=>setTimeout(resolve,350));});
  expect(document.querySelector('.modal')).toBeNull();
});

test('a rejected save restores the save button and retains the form', async () => {
  mockSave.mockRejectedValue(new Error('Connection interrupted'));
  await open();await click(button('Add college'));input('admin-name','Science');await submit();
  expect(document.body.textContent).toContain('Changes could not be saved. Please try again.');
  expect(button('Save changes').disabled).toBe(false);
  expect(document.querySelector('.modal .portal-loader')).toBeNull();
});

test('activity history is absent from navigation and its old URL redirects to overview', async () => {
  mockGet.mockImplementation(async path=>({ok:true,data:path==='session'?session:{users:10,colleges:1,departments:1,applications:0,pending:0,byType:[]}}));
  await open('/admin/audit');
  expect(container.textContent).toContain('Application activity');
  expect(container.textContent).not.toContain('Activity history');
  expect(container.querySelector('a[href="/admin/audit"]')).toBeNull();
  expect(mockGet.mock.calls.some(([path])=>path==='audit')).toBe(false);
});
