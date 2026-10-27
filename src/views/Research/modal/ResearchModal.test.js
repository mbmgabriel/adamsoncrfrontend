/* eslint-disable testing-library/no-unnecessary-act -- Uses native React roots. */
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ResearchModal from "./ResearchModal";

let root, container;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const openEndorsements = (endorsements) => {
  act(() => root.render(
    <ResearchModal showModal handleClose={() => {}}
      research={{ id: 1, title: "Research proposal", endorsements }} />
  ));
  const tab = Array.from(document.querySelectorAll('[role="tab"]'))
    .find((element) => element.textContent === "Endorsements");
  act(() => tab.click());
  return document.getElementById(tab.getAttribute("aria-controls"));
};
const progress = (panel, name = "Endorsement completion") =>
  panel.querySelector(`[role="progressbar"][aria-label="${name}"]`).getAttribute("aria-valuenow");

test("counts the director's completed step alongside six endorsements", () => {
  const panel = openEndorsements([
    ...Array.from({ length: 6 }, (_, index) => ({
      representative_name: `Reviewer ${index + 1}`, status_id: 6, status: "Endorsed",
    })),
    { representative_name: "Director", status_id: 2, status: "Completed" },
  ]);
  expect(panel.textContent).toContain("7 of 7 complete");
  const director = panel.querySelector('[aria-label="Director endorsement progress"]')
    .closest('.research-endorsement-progress__item');
  expect(director.querySelector('.badge').className).toContain("bg-success");
  panel.querySelectorAll('[role="progressbar"]').forEach((bar) => {
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
  });
});

test("recognizes normalized status labels and numeric string IDs", () => {
  const panel = openEndorsements([
    { representative_name: "Reviewer", StatusTable: { status: " Approved " } },
    { representative_name: "Director", status: "COMPLETED" },
    { representative_name: "Coordinator", status_id: "6", status: "Endorsed" },
    { representative_name: "Final reviewer", status_id: "2", status: "Completed" },
  ]);
  expect(panel.textContent).toContain("4 of 4 complete");
  expect(progress(panel)).toBe("100");
});

test("keeps pending and revision steps incomplete", () => {
  const panel = openEndorsements([
    { representative_name: "Coordinator", status_id: 6, status: "Endorsed" },
    { representative_name: "Chair", status_id: 5, status: "Reevaluate" },
    { representative_name: "Dean" },
  ]);
  expect(panel.textContent).toContain("1 of 3 complete");
  expect(progress(panel)).toBe("33");
  for (const name of ["Chair", "Dean"]) {
    expect(progress(panel, `${name} endorsement progress`)).toBe("0");
  }
});

test("shows an empty state without a progress bar when no endorsements exist", () => {
  const panel = openEndorsements([]);
  expect(panel.textContent).toContain("No endorsements are available.");
  expect(panel.querySelector('[role="progressbar"]')).toBeNull();
});
