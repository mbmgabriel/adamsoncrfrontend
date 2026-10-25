import { getLatestDocument, getDocumentName, getDocumentUrl } from './researchRevision';

test('retains the newest uploaded file for each requirement', () => {
  const original = { id: 1, document_title_id: 2, document_filepath: '/original.pdf' };
  const replacement = { id: 3, document_title_id: 2, document_filepath: '/replacement.pdf' };
  expect(getLatestDocument([replacement, original], 2)).toEqual(replacement);
  expect(getLatestDocument([original, replacement], '2')).toEqual(replacement);
  expect(getLatestDocument([original], 1)).toBeNull();
});
test('an absent file does not satisfy an uploaded requirement', () => {
  expect(getLatestDocument([{ document_title_id: 2, document_filepath: '' }], 2)).toBeNull();
});
test('builds local file links and retains HTTPS file links', () => {
  expect(getDocumentUrl('/documents/proposal.pdf', 'http://localhost:3000')).toBe('http://localhost:3000/documents/proposal.pdf');
  expect(getDocumentUrl('https://example.com/proposal.pdf', 'http://localhost:3000')).toBe('https://example.com/proposal.pdf');
  // eslint-disable-next-line no-script-url -- Verifies unsafe stored links are rejected.
  expect(getDocumentUrl('javascript:alert(1)', 'http://localhost:3000')).toBe('');
});
test('displays the original filename from the stored upload path', () => {
  expect(getDocumentName('/document_filepath/2/document_filepath-1792911523945-proposal%20v1.pdf')).toBe('proposal v1.pdf');
});
