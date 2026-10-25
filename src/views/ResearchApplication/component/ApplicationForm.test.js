/* eslint-disable testing-library/no-unnecessary-act -- Native React roots require act; Testing Library is not used. */
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useForm } from "react-hook-form";
import { ResearcherSection } from "./ApplicationForm";

let container;
let root;

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

const change = (element, value) => act(() => {
  element.value = value;
  element.dispatchEvent(new Event("change", { bubbles: true }));
});

const departments = [
  { dept_desc: "COLLEGE OF SCIENCE", dept_name: "BIOLOGY DEPARTMENT" },
  { dept_desc: "COLLEGE OF SCIENCE", dept_name: "CHEMISTRY DEPARTMENT" },
  { dept_desc: "COLLEGE OF ENGINEERING", dept_name: "CIVIL ENGINEERING DEPARTMENT" },
];

function Researchers() {
  const { control, register, setValue } = useForm({
    defaultValues: {
      researchers: [{ college: "", dept: "" }, { enabled: true, college: "", dept: "" }],
    },
  });
  return [0, 1].map((index) => (
    <ResearcherSection
      key={index}
      index={index}
      isMain={index === 0}
      control={control}
      register={register}
      setValue={setValue}
      departments={departments}
    />
  ));
}

test("filters departments by college and clears the department when college changes", () => {
  act(() => root.render(<Researchers />));
  const [college, department] = container.querySelectorAll("select");
  expect(department.disabled).toBe(true);
  expect(college.options).toHaveLength(3);

  change(college, "COLLEGE OF SCIENCE");
  expect(department.disabled).toBe(false);
  expect(department.textContent).toContain("BIOLOGY DEPARTMENT");
  expect(department.textContent).not.toContain("CIVIL ENGINEERING DEPARTMENT");
  change(department, "BIOLOGY DEPARTMENT");
  change(college, "COLLEGE OF ENGINEERING");
  expect(department.value).toBe("");
  expect(department.textContent).toContain("CIVIL ENGINEERING DEPARTMENT");
});

test("copying a department keeps co-author college and department consistent", () => {
  act(() => root.render(<Researchers />));
  const [college, department, coauthorCollege, coauthorDepartment] = container.querySelectorAll("select");
  change(college, "COLLEGE OF SCIENCE");
  change(department, "BIOLOGY DEPARTMENT");
  act(() => container.querySelector('input[name="sameDept"]').click());
  expect(coauthorCollege.value).toBe("COLLEGE OF SCIENCE");
  expect(coauthorDepartment.value).toBe("BIOLOGY DEPARTMENT");

  change(college, "COLLEGE OF ENGINEERING");
  expect(coauthorCollege.value).toBe("COLLEGE OF ENGINEERING");
  expect(coauthorDepartment.value).toBe("");
  change(department, "CIVIL ENGINEERING DEPARTMENT");
  expect(coauthorDepartment.value).toBe("CIVIL ENGINEERING DEPARTMENT");
});
