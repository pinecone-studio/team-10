"use client";

import type { ApprovalTarget, DepartmentOption } from "../../_lib/order-types";

export type HigherUpPosition =
  | "ceo"
  | "generalManager"
  | "cfo"
  | "coo"
  | "cto"
  | "departmentHead"
  | "departmentManager"
  | "manager";

export type OrderApprover = {
  initials: string;
  id: string;
  fullName: string;
  position: HigherUpPosition | "financeManager";
  positionLabel: string;
  department: DepartmentOption | "Executive Office";
  departmentLabel: string;
  approvalTarget: ApprovalTarget;
};

const orderApprovers: OrderApprover[] = [
  ["AS", "approvee-ceo", "Ariunsanaa Sukhbaatar", "ceo", "CEO", "Executive Office", "Executive office", "any_higher_ups"],
  ["NE", "approvee-general-manager", "Narmandakh Erdene", "generalManager", "General Manager", "Executive Office", "Executive office", "any_higher_ups"],
  ["ER", "approvee-cfo", "Erdenechimeg Rentsen", "cfo", "CFO", "Finance Office", "Finance office", "any_higher_ups"],
  ["AP", "approvee-coo", "Anujin Purevdorj", "coo", "COO", "Operations", "Operations", "any_higher_ups"],
  ["MB", "approvee-cto", "Munkh-Erdene Battsengel", "cto", "CTO", "IT Office", "Information technology", "any_higher_ups"],
  ["GB", "approvee-it-head", "Ganbold Batjargal", "departmentHead", "Department Head", "IT Office", "Information technology", "any_higher_ups"],
  ["SG", "approvee-hr-manager", "Sarnai Gombo", "manager", "HR Manager", "Human Resources", "Human resources", "any_higher_ups"],
  ["BL", "approvee-operations-manager", "Bilegt Lkhagva", "manager", "Operations Manager", "Operations", "Operations", "any_higher_ups"],
  ["TM", "approvee-procurement-manager", "Temuulen Munkh", "departmentManager", "Procurement Manager", "Procurement", "Procurement", "any_higher_ups"],
  ["UN", "finance-controller", "Undrakh Naran", "financeManager", "Finance Controller", "Finance Office", "Finance office", "finance"],
  ["BK", "finance-manager", "Bolormaa Khash", "financeManager", "Finance Manager", "Finance Office", "Finance office", "finance"],
].map(
  ([initials, id, fullName, position, positionLabel, department, departmentLabel, approvalTarget]) => ({
    initials,
    id,
    fullName,
    position: position as OrderApprover["position"],
    positionLabel,
    department: department as OrderApprover["department"],
    departmentLabel,
    approvalTarget: approvalTarget as ApprovalTarget,
  }),
);

function getApproverRank(
  approver: OrderApprover,
  department: DepartmentOption,
) {
  if (approver.department === department) return 0;
  if (["ceo", "generalManager", "cfo", "coo", "cto"].includes(approver.position)) {
    return 1;
  }
  return 2;
}

export function getApproverOptions(
  department: DepartmentOption,
  approvalTarget: ApprovalTarget,
) {
  return orderApprovers
    .filter((approver) => approver.approvalTarget === approvalTarget)
    .sort((left, right) => {
    const rankDifference =
      getApproverRank(left, department) - getApproverRank(right, department);

    return rankDifference !== 0
      ? rankDifference
      : left.fullName.localeCompare(right.fullName);
  });
}

export function getApproverById(approverId: string) {
  return orderApprovers.find((approver) => approver.id === approverId) ?? null;
}

export function getDefaultApproverId(
  department: DepartmentOption,
  approvalTarget: ApprovalTarget,
) {
  return getApproverOptions(department, approvalTarget)[0]?.id ?? "";
}
