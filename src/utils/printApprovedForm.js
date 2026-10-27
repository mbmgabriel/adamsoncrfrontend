export const PRINT_FORM_STYLES = `
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; color: #182b43; font: 10pt/1.4 Arial, Helvetica, sans-serif; }
  main, form { margin: 0; padding: 0; width: 100%; }
  header { display: flex; align-items: center; justify-content: space-between; gap: 20px;
    padding-bottom: 14px; margin-bottom: 16px; border-bottom: 2px solid #173b70; }
  header > div { display: flex; align-items: center; gap: 10px; }
  header img { width: 54px; height: 54px; object-fit: contain; }
  header > div > span { color: #173b70; font-size: 13pt; font-weight: bold; letter-spacing: 1px; line-height: 1.15; }
  address { margin: 0; font-size: 8pt; font-style: normal; line-height: 1.5; }
  address strong { font-size: 9pt; }
  h1 { margin: 0 0 16px; color: #173b70; font-size: 13pt; line-height: 1.35; text-align: center; }
  .printed-form-table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9pt; }
  .printed-form-table th, .printed-form-table td { border: 1px solid #a8b5c3; padding: 7px 9px;
    text-align: left; vertical-align: top; overflow-wrap: anywhere; }
  .printed-form-table th { background: #edf2f8; color: #173b70; font-weight: bold; }
  .printed-form-table th:first-child, .printed-form-table td:first-child { width: 32%; font-weight: bold; }
  .printed-form-table p { margin: 6px 0 0; font-size: 8pt; font-weight: normal; }
  .printed-form-table tr { break-inside: avoid; }
  .printed-form-value { white-space: pre-wrap; overflow-wrap: anywhere; }
  .printed-form-check { display: inline-block; flex: 0 0 13px; font-size: 11pt; line-height: 1.15; color: #000; }
  .publication-incentive__checkbox-list { display: flex; flex-direction: column; gap: 6px; }
  .publication-incentive__checkbox-list label { display: flex; align-items: flex-start; gap: 6px; font-weight: normal; }
  .assistance-request__proof-item + .assistance-request__proof-item { margin-top: 7px; }
  .assistance-request__proof-item label { display: grid; grid-template-columns: 16px 13px minmax(0, 1fr);
    align-items: start; gap: 5px; font-weight: normal; }
  .approval-amount { display: flex; justify-content: space-between; gap: 20px; break-inside: avoid;
    border: 1px solid #a8b5c3; border-left: 3px solid #173b70; padding: 12px 14px; margin-top: 16px; }
  .approval-amount__heading, .approval-amount__field { display: flex; flex-direction: column; gap: 4px; }
  .approval-amount__heading > span { font-size: 8pt; color: #52677d; }
  .approval-amount__field label { font-size: 8pt; color: #52677d; }
  .approval-amount__field > span { font-weight: bold; font-size: 13pt; font-variant-numeric: tabular-nums; }
  .approval-amount__input { display: flex; gap: 6px; }
  @media screen { body { max-width: 186mm; padding: 20px; margin: auto; } }
  @media print { * { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
`;

export function createPrintableForm(sheet, doc) {
  const clone = sheet.cloneNode(true);
  clone.querySelectorAll("button, .publication-incentive__review-actions, .approval-amount-error, small").forEach(node => node.remove());
  const originals = sheet.querySelectorAll("input, textarea, select");
  clone.querySelectorAll("input, textarea, select").forEach((node, index) => {
    const source = originals[index];
    const text = doc.createElement("span");
    text.className = source.type === "checkbox" ? "printed-form-check" : "printed-form-value";
    text.textContent = source.type === "checkbox" ? (source.checked ? "☑" : "☐") : source.value;
    node.replaceWith(text);
  });
  // Native table rows paginate reliably and avoid the screen form's fixed heights.
  clone.querySelectorAll('[role="table"]').forEach(sourceTable => {
    const table = doc.createElement("table");
    table.className = "printed-form-table";
    const body = doc.createElement("tbody");
    Array.from(sourceTable.children).forEach(sourceRow => {
      const row = doc.createElement("tr");
      Array.from(sourceRow.children).forEach(sourceCell => {
        const cell = doc.createElement(sourceCell.getAttribute("role") === "columnheader" ? "th" : "td");
        if (cell.tagName === "TH") cell.scope = "col";
        while (sourceCell.firstChild) cell.appendChild(sourceCell.firstChild);
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
    table.appendChild(body);
    sourceTable.replaceWith(table);
  });
  const wrapper = doc.createElement("main");
  wrapper.appendChild(clone);
  return wrapper;
}

export async function printApprovedForm(sheet) {
  if (!sheet) throw new Error("The approved form is unavailable.");
  const frame = document.createElement("iframe");
  frame.title = "Approved form print preview";
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;bottom:0;right:0";
  document.body.appendChild(frame);
  try {
    const doc = frame.contentDocument;
    doc.documentElement.lang = "en";
    doc.title = "Approved request form";
    doc.body.appendChild(createPrintableForm(sheet, doc));
    const style = doc.createElement("style");
    style.textContent = PRINT_FORM_STYLES;
    doc.head.appendChild(style);
    await Promise.all(Array.from(doc.querySelectorAll("img")).map(img =>
      img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })
    ));
    frame.contentWindow.addEventListener("afterprint", () => frame.remove(), { once: true });
    frame.contentWindow.focus();
    frame.contentWindow.print();
    window.setTimeout(() => frame.remove(), 60000);
  } catch (error) {
    frame.remove();
    throw error;
  }
}
