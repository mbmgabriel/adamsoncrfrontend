/* eslint-disable testing-library/no-unnecessary-act -- Native React roots require act. */
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ResearchIncentiveRequest from "./ResearchIncentive/ResearchIncentiveRequest";
import ResearchPresentationAssistance from "./ResearchPresentationAssistance/ResearchPresentationAssistance";

const mockSendRequest = jest.fn();
const mockPrintForm = jest.fn().mockResolvedValue();
jest.mock("../utils/printApprovedForm", () => ({ printApprovedForm: (...args) => mockPrintForm(...args) }));
jest.mock("../api/Base", () => class {
  sendRequest(options) { return mockSendRequest(options); }
});
jest.mock("../components/Layout/MainContainer", () => ({ children }) => <div>{children}</div>);
let mockSearch = '';
jest.mock("react-router-dom", () => ({
  useHistory: () => ({ push: jest.fn(), replace: jest.fn() }),
  useLocation: () => ({ pathname: '/review', search: mockSearch }),
}));

let root;
let container;
let mockApplication;
let mockSupportsAmount;

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  window.scrollTo = jest.fn();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  mockSearch = '';
  mockSupportsAmount = true;
  mockPrintForm.mockClear();
  mockPrintForm.mockResolvedValue();
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
      return { ok: true, data: [mockSupportsAmount ? { approved_amount: null, ...mockApplication } : mockApplication] };
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

  test("opens the application linked from a notification", async () => {
    mockSearch = '?application_id=42';
    mockApplication = { id: 42, status_id: 3 };
    await act(async () => root.render(<Component reviewMode />));
    expect(container.querySelectorAll('.publication-incentive__review-actions button')).toHaveLength(2);
  });

  test("rejects an unavailable notification target", async () => {
    mockSearch = '?application_id=999';
    mockApplication = { id: 42, status_id: 3 };
    await act(async () => root.render(<Component reviewMode />));
    expect(container.textContent).toContain('This application is unavailable');
    expect(container.querySelectorAll('.publication-incentive__review-actions button')).toHaveLength(0);
  });

  test("requires an amount and sends it with approval status 10", async () => {
    mockApplication = { id: 1, status_id: 3 };
    await act(async () => root.render(<Component reviewMode />));
    act(() => container.querySelector("tbody tr").click());
    const actions = container.querySelectorAll(".publication-incentive__review-actions button");
    expect(actions[0].disabled).toBe(false);
    expect(actions[1].disabled).toBe(false);
    await act(async () => actions[1].click());
    expect(mockSendRequest.mock.calls.some(([request]) => request.method === "PUT")).toBe(false);
    const input = container.querySelector('#approved-amount');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '2,500.50');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(input.value).toBe('2,500.50');
    await act(async () => actions[1].click());
    expect(mockSendRequest).toHaveBeenCalledWith({
      path: `/api/v1/endorsements/status/1/${formTypeId}`,
      method: "PUT",
      data: { status_id: 10, approved_amount: 2500.5 },
    });
  });
  test("rejects without requiring an amount", async () => {
    mockApplication = { id: 1, status_id: 3 };
    await act(async () => root.render(<Component reviewMode />));
    act(() => container.querySelector("tbody tr").click());
    await act(async () => container.querySelector(".publication-incentive__review-button--reject").click());
    expect(mockSendRequest).toHaveBeenCalledWith({
      path: `/api/v1/endorsements/status/1/${formTypeId}`, method: "PUT", data: { status_id: 11 },
    });
  });

  test.each([1, 10, 11])("enables print only for an approved researcher request (status %s)", async (statusId) => {
    mockApplication = { id: 1, status_id: statusId, approved_amount: '2500.50' };
    await act(async () => root.render(<Component />));
    const button = container.querySelector('.application-history__print-button');
    expect(button).not.toBeNull();
    expect(button.disabled).toBe(statusId !== 10);
    await act(async () => button.click());
    if (statusId === 10) {
      expect(mockPrintForm).toHaveBeenCalledTimes(1);
      expect(mockPrintForm.mock.calls[0][0].textContent).toContain('2,500.50');
      expect(container.querySelector('#approved-amount').tagName).toBe('SPAN');
    } else {
      expect(mockPrintForm).not.toHaveBeenCalled();
      expect(container.querySelector('tbody')).not.toBeNull();
    }
  });

  test("allows approval testing when the server omits the amount field", async () => {
    mockSupportsAmount = false;
    mockApplication = { id: 1, status_id: 3 };
    await act(async () => root.render(<Component reviewMode />));
    act(() => container.querySelector("tbody tr").click());
    expect(container.querySelector('.approval-amount-error')).toBeNull();
    const input = container.querySelector('#approved-amount');
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '10,000');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const approve = container.querySelector('.publication-incentive__review-button--approve');
    expect(approve.disabled).toBe(false);
    await act(async () => approve.click());
    expect(mockSendRequest).toHaveBeenCalledWith({
      path: `/api/v1/endorsements/status/1/${formTypeId}`,
      method: 'PUT', data: { status_id: 10, approved_amount: 10000 },
    });
  });

});
