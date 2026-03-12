"use client";

import type { DepartmentOption, GoodsCatalogItem } from "./order-types";

export const departmentOptions: DepartmentOption[] = [
  "IT Office",
  "Finance Office",
  "Human Resources",
  "Operations",
  "Procurement",
];

export const goodsCatalog: GoodsCatalogItem[] = [
  { id: "goods-1", name: "Shelf", code: "FN003", unit: "pcs", defaultPrice: 120000 },
  { id: "goods-2", name: "Office Chair", code: "OF112", unit: "pcs", defaultPrice: 185000 },
  { id: "goods-3", name: "Dock Station", code: "IT218", unit: "pcs", defaultPrice: 350000 },
  { id: "goods-4", name: "Monitor 24 inch", code: "MN024", unit: "pcs", defaultPrice: 420000 },
  { id: "goods-5", name: "Laptop Stand", code: "LS019", unit: "pcs", defaultPrice: 45000 },
];
