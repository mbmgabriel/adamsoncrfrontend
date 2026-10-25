/* eslint-disable testing-library/no-unnecessary-act -- Native React roots require act. */
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ResearchIncentiveRequest from "./ResearchIncentive/ResearchIncentiveRequest";
import ResearchPresentationAssistance from "./ResearchPresentationAssistance/ResearchPresentationAssistance";

const mockSendRequest = jest.fn();
jest.mock("../api/Base", () => class {
  sendRequest(options) { return mockSendRequest(options); }
});
jest.mock("../components/Layout/MainContainer", () => ({ children }) => <div>{children}</div>);
jest.mock("react-router-dom", () => ({ useHistory: () => ({ push: jest.fn() }) }));

let root;
let container;
let mockApplication;

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  window.scrollTo = jest.fn();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  mockSendRequest.mockReset();
  mockSendRequest.mockImplementation(async ({ path }) => {
    if (path === "/api/v1/status_tables/all") {
      return { ok: true, data: { StatusTables: [
        { id: 3, status: "Not yet Reviewed" },
        { id: 10, status: "Approved" },
        { id: 11, status: "Rejected" },
      ] } };
    }
    if (/\/(incentive-forms|request-assistance-forms)\/(all|user)$/.test(path)) {
      return { ok: true, data: [mockApplication] };
    }
    return { ok: true, data: [] };
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe.each([
  ["incentives", ResearchIncentiveRequest, 3],
  ["assistance", ResearchPresentationAssistance, 2],
])("%s review decisions", (label, Component, formTypeId) => {
  test.each([10, 11, "10", "11"])("locks both actions for final status %s", async (statusId) => {
    mockApplication = {
      id: 1,
      status_id: 3,
      Endorsements: [{ form_type_id: formTypeId, status_id: statusId }],
    };
    await act(async () => root.render(<Component reviewMode />));
    act(() => container.querySelector("tbody tr").click());
    const actions = container.querySelectorAll(".publication-incentive__review-actions button");
    expect(actions).toHaveLength(2);
    actions.forEach((button) => {
      expect(button.disabled).toBe(true);
      act(() => button.click());
    });
    expect(mockSendRequest.mock.calls.some(([request]) => request.method === "PUT")).toBe(false);
  });

  test("keeps pending actions enabled and sends approval status 10", async () => {
    mockApplication = { id: 1, status_id: 3 };
    await act(async () => root.render(<Component reviewMode />));
    act(() => container.querySelector("tbody tr").click());
    const actions = container.querySelectorAll(".publication-incentive__review-actions button");
    expect(actions[0].disabled).toBe(false);
    expect(actions[1].disabled).toBe(false);
    await act(async () => actions[1].click());
    expect(mockSendRequest).toHaveBeenCalledWith({
      path: `/api/v1/endorsements/status/1/${formTypeId}`,
      method: "PUT",
      data: { status_id: 10 },
    });
  });
});
