import { auditChanges, auditValue, displayDate, money } from './adminPresentation';

test('audit comparisons omit unchanged profile fields and preserve the actual activation change', () => {
  const profile = { first_name:'Local', last_name:'Reviewer', dept_id:1 };
  expect(auditChanges(JSON.stringify({active:{before:false,after:true},profile:{before:profile,after:{...profile}}}))).toEqual([{path:'active',field:'Active',before:false,after:true}]);
});
test('audit comparisons flatten changed profile values and omit secret values', () => {
  expect(auditChanges({profile:{before:{first_name:'Old',dept_id:1},after:{first_name:'New',dept_id:1}},password:{before:'old secret',after:'new secret'}})).toEqual([{path:'profile.first_name',field:'First name',before:'Old',after:'New'}]);
});
test('unreadable audit data is handled without crashing', () => {
  expect(auditChanges('{bad json')).toBeNull();
  expect(auditChanges({})).toEqual([]);
});
test('audit values use readable activation and relationship names', () => {
  expect(auditValue(false,'active',{})).toBe('Inactive');
  expect(auditValue(1,'profile.dept_id',{departments:[{id:1,dept_name:'Biology'}]})).toBe('Biology');
});
test('application values format dates and money while retaining missing values', () => {
  expect(displayDate('2026-10-26T00:00:00.000Z')).not.toContain('T00:');
  expect(displayDate(null)).toBe('Not provided');
  expect(money(null)).toBe('Not specified');
  expect(money('2500')).toContain('2,500.00');
});
