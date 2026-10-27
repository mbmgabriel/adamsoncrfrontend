import { printApprovedForm } from "./printApprovedForm";

afterEach(() => { document.body.innerHTML = ''; jest.useRealTimers(); });

test('prints the complete form with current values and checked proofs, without action buttons', async () => {
  jest.useFakeTimers();
  document.body.innerHTML = `<main class="assistance-request"><form>
    <div role="table"><div role="row"><div role="columnheader">Information</div><div role="columnheader">Details</div></div>
      <div role="row"><label>Research title</label><div role="cell"><textarea>Original</textarea></div></div>
      <div role="row"><label>Proofs</label><div role="cell"><input type="checkbox"><input type="checkbox"></div></div>
    </div>
    <section class="approval-amount">Approved by the CRD Director: PHP 2,500.50</section>
    <button>Reject</button></form></main>`;
  const sheet = document.querySelector('form');
  sheet.querySelector('textarea').value = 'Long research title '.repeat(25);
  sheet.querySelector('input').checked = true;
  const result = printApprovedForm(sheet);
  const frame = document.querySelector('iframe');
  const print = jest.fn();
  frame.contentWindow.print = print;
  frame.contentWindow.focus = jest.fn();
  await result;
  expect(print).toHaveBeenCalledTimes(1);
  expect(frame.contentDocument.body.textContent).toContain('Long research title '.repeat(25));
  expect(frame.contentDocument.body.textContent).toContain('☑');
  expect(frame.contentDocument.body.textContent).toContain('☐');
  expect(frame.contentDocument.body.textContent).toContain('PHP 2,500.50');
  expect(frame.contentDocument.querySelector('input, textarea, button')).toBeNull();
  expect(frame.contentDocument.querySelectorAll('.printed-form-table tr')).toHaveLength(3);
  expect(frame.contentDocument.querySelectorAll('.printed-form-table th')).toHaveLength(2);
  expect(frame.contentDocument.querySelector('link[rel=stylesheet]')).toBeNull();
  frame.contentWindow.dispatchEvent(new Event('afterprint'));
  expect(document.querySelector('iframe')).toBeNull();
});
