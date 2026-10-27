import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ink = [23, 61, 107];
const sections = { proposal: 'I. Proposal and undertaking', implementation: 'II. Conduct, funds and liquidation', clearance: 'III. Manuscript and clearance' };
export const clearanceOffices = [
  ['Center for Research and Development (CRD)\n[ ] Full budget liquidation\n[ ] Soft copy (2 CDs) of final and full study research (1 file in MS Word Format and 1 file of PDF Format) and 4,000 words manuscript for AdU journal publication (MS Word Format), properly labeled with title of the study.', '', ''],
  ['Innovation and Technology Support Office (ITSO)\nCertificate of patent / copyright registration\n[ ] Copyright\n[ ] Patent', '', ''],
  ['Library\n[ ] Provide one copy of full and final completed research (soft copy in MS Word and PDF Format)', '', ''],
  ['Ethics Review Committee (if applicable)', '', ''],
];
const signatures = ['College Research Coordinator', 'Center for Research and Development Staff', 'Department Chair / Dean', 'Center for Research and Development Director'];
const clean = value => String(value ?? '').replace(/[\r\n\t]/g, ' ').trim();
export const displayDate = value => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
export function clearanceRows(payload) {
  const form = payload.clearance.form;
  return [
    ['Research Title', clean(payload.project.snapshot.title)],
    ['Date of Completion', displayDate(form.date_completed)],
    ['College and Department', clean(form.college_department)],
    ['Faculty Researcher/s / Co-researcher/s (For faculty-led)', form.faculty_researchers.map((name, i) => `${i + 1}. ${clean(name) || '________________________________'}`).join('\n\n')],
    ['Student Researchers', form.student_researchers.map((name, i) => `${i + 1}. ${clean(name) || '________________________________'}`).join('\n\n')],
  ];
}
function header(doc, title, continuation = false) {
  doc.setTextColor(...ink); doc.setFont('helvetica', 'bold'); doc.setFontSize(17);
  doc.text('ADAMSON', 14, 18); doc.setFontSize(11); doc.text('U N I V E R S I T Y', 14, 24);
  doc.setFontSize(9); doc.text('CENTER FOR RESEARCH AND DEVELOPMENT', 196, 15, { align: 'right' });
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text(['900 San Marcelino Street, Manila', '1000 Manila, Philippines', 'Office: (+632) 524-2011 loc. 153', 'Email: adu_crd@adamson.edu.ph'], 196, 20, { align: 'right' });
  doc.setDrawColor(...ink); doc.line(14, 36, 196, 36); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text(title + (continuation ? ' (continued)' : ''), 105, 43, { align: 'center' });
  doc.setTextColor(25, 35, 48);
}
function footers(doc, code) {
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(70, 80, 95);
    doc.text(code, 14, 287); doc.text(`Page ${page} of ${pages}`, 196, 287, { align: 'right' });
  }
  return doc;
}
const tableOptions = { theme: 'grid', margin: { top: 49, bottom: 18, left: 14, right: 14 }, styles: { font: 'helvetica', fontSize: 9, cellPadding: 2.5, lineColor: [125, 137, 150], lineWidth: 0.2, textColor: [25, 35, 48], overflow: 'linebreak' }, headStyles: { fillColor: [237, 242, 248], textColor: ink }, rowPageBreak: 'avoid' };
export function createMonitoringPdf(payload) {
  if (!payload.progress?.finished) throw new Error('Monitoring must be complete before downloading.');
  const doc = new jsPDF(); const title = 'RESEARCH PROJECT MONITORING CHECKLIST FORM'; header(doc, title);
  const snapshot = payload.project.snapshot;
  autoTable(doc, { ...tableOptions, startY: 49, body: [['Research Title', clean(snapshot.title)], ['Researcher/s', snapshot.researchers.map(clean).join(', ')], ['College / Department', [snapshot.college, snapshot.department].filter(Boolean).map(clean).join(' / ')], ['Duration of Research', /^\d+(\.\d+)?$/.test(String(snapshot.duration)) ? `${snapshot.duration} semester(s)` : clean(snapshot.duration)]], columnStyles: { 0: { cellWidth: 43, fontStyle: 'bold' } }, didDrawPage: data => { if (data.pageNumber > 1) header(doc, title, true); } });
  autoTable(doc, { ...tableOptions, startY: doc.lastAutoTable.finalY + 6, head: [['Research process', 'Date submitted', 'Date returned', 'Remarks']], body: payload.items.flatMap((item, i) => [
    ...(i === 0 || payload.items[i - 1].section !== item.section ? [[{ content: sections[item.section] || item.section, colSpan: 4, styles: { fontStyle: 'bold', fillColor: [237, 242, 248] } }]] : []),
    [`${item.status === 'na' ? '[N/A]' : '[x]'} ${clean(item.label)}`, displayDate(item.submitted_on), displayDate(item.returned_on), clean(item.remarks)],
  ]), columnStyles: { 0: { cellWidth: 67 }, 1: { cellWidth: 25 }, 2: { cellWidth: 25 }, 3: { cellWidth: 65 } }, didDrawPage: () => { if (doc.getCurrentPageInfo().pageNumber > 1) header(doc, title, true); } });
  return footers(doc, payload.project.form_version);
}
export function createClearancePdf(payload) {
  if (!payload.progress?.finished || !payload.clearance?.saved) throw new Error('Save the completed clearance form before downloading.');
  const doc = new jsPDF(); const title = 'RESEARCHER/s CLEARANCE FORM'; header(doc, title);
  autoTable(doc, { ...tableOptions, startY: 49, body: clearanceRows(payload), columnStyles: { 0: { cellWidth: 59, fontStyle: 'bold' } }, didDrawPage: data => { if (data.pageNumber > 1) header(doc, title, true); } });
  autoTable(doc, { ...tableOptions, startY: doc.lastAutoTable.finalY + 5, head: [['Cleared by:', 'Signature above printed name:', 'Date:']], body: clearanceOffices, styles: { ...tableOptions.styles, fontSize: 8.5, cellPadding: 2 }, columnStyles: { 0: { cellWidth: 91 }, 1: { cellWidth: 65 }, 2: { cellWidth: 26 } }, didDrawPage: () => { if (doc.getCurrentPageInfo().pageNumber > 1) header(doc, title, true); } });
  let y = doc.lastAutoTable.finalY + 5;
  if (y + 43 > 278) { doc.addPage(); header(doc, title, true); y = 51; }
  doc.setFontSize(9); doc.text('Cleared/Noted by:', 14, y); doc.setFontSize(8);
  signatures.forEach((label, i) => { const x = i % 2 ? 108 : 14, top = y + 10 + Math.floor(i / 2) * 14; doc.line(x, top, x + 86, top); doc.text(label, x, top + 4); });
  doc.setFontSize(9); doc.text('Note: This serves as clearance from CRD, if duly accomplished.', 14, y + 43);
  return footers(doc, payload.clearance.form_version);
}
const escape = text => String(text ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export function clearancePrintHtml(payload) {
  if (!payload.progress?.finished || !payload.clearance?.form) throw new Error('Complete monitoring before printing the clearance form.');
  const rows = clearanceRows(payload).map(row => `<tr><th>${escape(row[0])}</th><td>${escape(row[1])}</td></tr>`).join('');
  return `<header><strong>ADAMSON<br>UNIVERSITY</strong><address><b>CENTER FOR RESEARCH AND DEVELOPMENT</b><br>900 San Marcelino Street, Manila<br>1000 Manila, Philippines<br>Office: (+632) 524-2011 loc. 153<br>Email: adu_crd@adamson.edu.ph</address></header><h1>RESEARCHER/s CLEARANCE FORM</h1><table class="details"><tbody>${rows}</tbody></table><table class="offices"><thead><tr><th>Cleared by:</th><th>Signature above printed name:</th><th>Date:</th></tr></thead><tbody>${clearanceOffices.map(row => `<tr>${row.map(cell => `<td>${escape(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table><p>Cleared/Noted by:</p><div class="signatures">${signatures.map(label => `<div>${escape(label)}</div>`).join('')}</div><p>Note: This serves as clearance from CRD, if duly accomplished.</p><small>${escape(payload.clearance.form_version)}</small>`;
}
export async function printClearance(payload) {
  const html = clearancePrintHtml(payload);
  const frame = document.createElement('iframe'); frame.title = 'Research clearance print preview';
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;bottom:0;right:0'; document.body.appendChild(frame);
  try {
    const doc = frame.contentDocument; doc.documentElement.lang = 'en'; doc.title = 'Researcher clearance form';
    doc.body.innerHTML = html;
    const style = doc.createElement('style'); style.textContent = `@page{size:A4;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#182b43;font:9pt/1.3 Arial,sans-serif}header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #173d6b;padding-bottom:10px;color:#173d6b}header>strong{font-size:18pt}address{text-align:right;font-size:8pt;font-style:normal}h1{text-align:center;font-size:12pt;margin:12px 0}table{width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:12px}th,td{border:1px solid #7d8996;padding:6px;text-align:left;vertical-align:top;white-space:pre-wrap;overflow-wrap:anywhere}.details th{width:32%}.offices th:first-child{width:50%}.offices th:last-child{width:14%}tr{break-inside:avoid}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:22px 24px;margin:25px 0 18px;break-inside:avoid}.signatures>div{border-top:1px solid;padding-top:5px;font-size:8pt}small{font-size:8pt}`; doc.head.appendChild(style);
    frame.contentWindow.addEventListener('afterprint', () => frame.remove(), { once: true });
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    frame.contentWindow.focus(); frame.contentWindow.print(); setTimeout(() => frame.remove(), 60000);
  } catch (error) { frame.remove(); throw error; }
}
