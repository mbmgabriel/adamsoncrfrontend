/* eslint-disable testing-library/no-unnecessary-act -- Uses native React roots. */
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Switch, useLocation } from 'react-router-dom';
import ContentPage from './ContentPage';
import { toast } from 'react-toastify';
import SiteAnnouncements from '../../components/SiteContent/SiteAnnouncements';
let mockRows = [];
let mockUnderDevelopment = false;
jest.mock('../../config/features', () => ({get CONTENT_PAGES_UNDER_DEVELOPMENT(){return mockUnderDevelopment;}}));
jest.mock('../../context/SiteContentContext', () => ({useSiteContent:()=>mockRows}));
jest.mock('../../components/Layout/MainContainer', () => ({children}) => <div>{children}</div>);
let root,container;
beforeEach(()=>{global.IS_REACT_ACT_ENVIRONMENT=true;localStorage.clear();mockRows=[];mockUnderDevelopment=false;container=document.createElement('div');document.body.appendChild(container);root=createRoot(container);});
afterEach(()=>{act(()=>root.unmount());container.remove();localStorage.clear();});
function Location(){return <span data-testid="location">{useLocation().pathname}</span>;}
const show = path => act(()=>root.render(<MemoryRouter initialEntries={[path]}><Switch><Route path={['/faqs','/about-crd']} component={ContentPage}/></Switch><Location/></MemoryRouter>));

test('About CRD shows the published title once and preserves its body',()=>{
  mockRows=[{id:1,kind:'about',title:'About CRD',body:'Adamson University\nResearch and development.'}];
  show('/about-crd');
  expect([...container.querySelectorAll('h1,h2')].filter(h=>h.textContent==='About CRD')).toHaveLength(1);
  expect(container.querySelector('.published-copy').textContent).toBe(mockRows[0].body);
});
test('an empty FAQ page has a readable empty state without a card footer',()=>{
  show('/faqs');
  expect(container.textContent).toContain('No FAQs available yet');
  expect(container.querySelector('.published-page-footer')).toBeNull();
  expect(container.textContent).not.toContain('Back to dashboard');
});
test('published FAQs expose the question as an accessible disclosure',()=>{
  mockRows=[{id:2,kind:'faq',title:'How do I submit a proposal?',body:'Open New Research Application.'}];
  show('/faqs');
  expect(container.querySelector('summary').textContent).toContain(mockRows[0].title);
  expect(container.querySelector('.published-faq-answer').textContent).toBe(mockRows[0].body);
});
test('long announcements can expand and collapse without losing their content',()=>{
  const body='Research announcement. '.repeat(40);
  act(()=>root.render(<SiteAnnouncements announcements={[{id:1,title:'Research update',body}]}/>));
  const button=container.querySelector('button');
  expect(button.getAttribute('aria-expanded')).toBe('false');
  act(()=>button.click());
  expect(button.getAttribute('aria-expanded')).toBe('true');
  expect(container.querySelector('.published-copy--collapsed')).toBeNull();
  expect(container.querySelector('.published-copy').textContent).toBe(body);
  act(()=>button.click());
  expect(container.querySelector('.published-copy--collapsed')).not.toBeNull();
});


test.each(['/faqs','/about-crd'])('%s shows the standard development toast and returns to the dashboard',path=>{
  mockUnderDevelopment=true;
  mockRows=[{id:1,kind:'faq',title:'Published question',body:'Published answer'},{id:2,kind:'about',title:'Published about title',body:'Published about body'}];
  const notify=jest.spyOn(toast,'info').mockImplementation(()=>{});
  show(path);
  expect(notify).toHaveBeenCalledWith(`${path==='/faqs'?'FAQs':'About CRD'} is under development.`);
  expect(container.querySelector('[data-testid="location"]').textContent).toBe('/dashboard');
  expect(container.querySelector('.published-page')).toBeNull();
  notify.mockRestore();
  expect(container.textContent).not.toContain('Published answer');
  expect(container.textContent).not.toContain('Published about body');
});
