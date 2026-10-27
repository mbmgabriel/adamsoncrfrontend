import React, { useLayoutEffect, useRef } from "react";

const formatAmount = (value) => {
  const text = String(value ?? "");
  if (!/^\d*(\.\d*)?$/.test(text)) return text;
  const [whole, fraction] = text.split(".");
  return whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    (fraction === undefined ? "" : `.${fraction}`);
};

export const isValidApprovalAmount = (value) =>
  /^\d+(\.\d{1,2})?$/.test(String(value)) &&
  Number(value) > 0 && Number(value) <= 9999999999.99;

function ApprovalAmount({ value, onChange, editable, disabled, approved }) {
  const inputRef = useRef(null);
  const caretRef = useRef(null);
  const displayValue = formatAmount(value);

  useLayoutEffect(() => {
    if (caretRef.current === null || !inputRef.current) return;
    const position = caretRef.current;
    inputRef.current.setSelectionRange(position, position);
    caretRef.current = null;
  });

  const handleAmountChange = (event) => {
    const input = event.target;
    const rawValue = input.value.replace(/,/g, "");
    const beforeCaret = input.value.slice(0, input.selectionStart).replace(/,/g, "").length;
    const formatted = formatAmount(rawValue);
    let position = 0;
    let characters = 0;
    while (position < formatted.length && characters < beforeCaret) {
      if (formatted[position] !== ",") characters++;
      position++;
    }
    caretRef.current = position;
    onChange({ target: { name: input.name, value: rawValue } });
  };

  return (
    <section className="approval-amount" aria-label="CRD Director decision">
      <div className="approval-amount__heading">
        <strong>{approved ? "Approved by the CRD Director" : "CRD Director"}</strong>
        <span>Approval details</span>
      </div>
      <div className="approval-amount__field">
      <label htmlFor="approved-amount">Approved amount (PHP)</label>
      {editable ? (
        <>
          <div className="approval-amount__input">
            <span aria-hidden="true">PHP</span>
          <input ref={inputRef} id="approved-amount" name="approved_amount" type="text" inputMode="decimal"
            pattern="[0-9]{1,3}(,[0-9]{3})*([.][0-9]{1,2})?" value={displayValue}
            placeholder="0.00" onChange={handleAmountChange} disabled={disabled} required aria-describedby="approval-amount-help" />
          </div>
          <small id="approval-amount-help">Enter an amount greater than zero before approving.</small>
        </>
      ) : (
        <span id="approved-amount">{value == null || value === "" ? "Not recorded" :
          new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(value))}</span>
      )}
      </div>
    </section>
  );
}

export default ApprovalAmount;
