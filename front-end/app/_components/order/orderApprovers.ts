"use client";

import type { DepartmentOption } from "../../_lib/order-types";

export type HigherUpPosition =
  | "ceo"
  | "generalManager"
  | "cfo"
  | "coo"
  | "cto"
  | "departmentHead"
  | "departmentManager"
  | "manager";

export type HigherUpApprover = {
  initials: string;
  id: string;
  fullName: string;
  position: HigherUpPosition;
  positionLabel: string;
  department: DepartmentOption | "Executive Office";
  departmentLabel: string;
};

const higherUpApprovers: HigherUpApprover[] = [
  ["AS", "approvee-ceo", "Ariunsanaa Sukhbaatar", "ceo", "CEO", "Executive Office", "Executive office"],
  ["NE", "approvee-general-manager", "Narmandakh Erdene", "generalManager", "General Manager", "Executive Office", "Executive office"],
  ["ER", "approvee-cfo", "Erdenechimeg Rentsen", "cfo", "CFO", "Finance Office", "Finance office"],
  ["AP", "approvee-coo", "Anujin Purevdorj", "coo", "COO", "Operations", "Operations"],
  ["MB", "approvee-cto", "Munkh-Erdene Battsengel", "cto", "CTO", "IT Office", "Information technology"],
  ["GB", "approvee-it-head", "Ganbold Batjargal", "departmentHead", "Department Head", "IT Office", "Information technology"],
  ["SG", "approvee-hr-manager", "Sarnai Gombo", "manager", "HR Manager", "Human Resources", "Human resources"],
  ["BL", "approvee-operations-manager", "Bilegt Lkhagva", "manager", "Operations Manager", "Operations", "Operations"],
  ["TM", "approvee-procurement-manager", "Temuulen Munkh", "departmentManager", "Procurement Manager", "Procurement", "Procurement"],
].map(
  ([initials, id, fullName, position, positionLabel, department, departmentLabel]) => ({
    initials,
    id,
    fullName,
    position: position as HigherUpPosition,
    positionLabel,
    department: department as HigherUpApprover["department"],
    departmentLabel,
  }),
);

function getApproverRank(
  approver: HigherUpApprover,
  department: DepartmentOption,
) {
  if (approver.department === department) return 0;
  if (["ceo", "generalManager", "cfo", "coo", "cto"].includes(approver.position)) {
    return 1;
  }
  return 2;
}

export function getHigherUpApproverOptions(department: DepartmentOption) {
  return [...higherUpApprovers].sort((left, right) => {
    const rankDifference =
      getApproverRank(left, department) - getApproverRank(right, department);

    return rankDifference !== 0
      ? rankDifference
      : left.fullName.localeCompare(right.fullName);
  });
}

export function getHigherUpApproverById(approverId: string) {
  return higherUpApprovers.find((approver) => approver.id === approverId) ?? null;
}

export function getDefaultHigherUpApproverId(department: DepartmentOption) {
  return getHigherUpApproverOptions(department)[0]?.id ?? "";
}
