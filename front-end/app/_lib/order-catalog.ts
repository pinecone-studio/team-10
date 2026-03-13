"use client";

import type {
  CatalogCategory,
  CatalogItemType,
  DepartmentOption,
  GoodsCatalogItem,
} from "./order-types";

export const departmentOptions: DepartmentOption[] = [
  "IT Office",
  "Finance Office",
  "Human Resources",
  "Operations",
  "Procurement",
];

export const catalogCategoriesSeed: CatalogCategory[] = [];

export const catalogItemTypesSeed: CatalogItemType[] = [];

export const catalogProductsSeed: GoodsCatalogItem[] = [];

export function normalizeCatalogName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatCatalogAttributeText(value: string) {
  const trimmed = value.trimStart();
  if (!trimmed) return "";
  return `${trimmed[0]!.toUpperCase()}${trimmed.slice(1)}`;
}

export function normalizeCatalogAttributeKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function findDuplicateCatalogAttributeName(
  attributeNames: string[],
): string | null {
  const seenNames = new Set<string>();

  for (const attributeName of attributeNames) {
    const formattedName = formatCatalogAttributeText(attributeName).trim();
    if (!formattedName) continue;

    const normalizedKey = normalizeCatalogAttributeKey(formattedName);
    if (seenNames.has(normalizedKey)) {
      return formattedName;
    }

    seenNames.add(normalizedKey);
  }

  return null;
}

function createCatalogPrefix(name: string) {
  const words = name
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "PRD";
  if (words.length === 1) return words[0]!.slice(0, 4) || "PRD";

  return words
    .map((word) => word[0])
    .join("")
    .slice(0, 4);
}

export function createCatalogCodeSuggestion(
  name: string,
  existingCodes: string[],
  currentCode?: string,
) {
  const prefix = createCatalogPrefix(name).padEnd(3, "X").slice(0, 4);
  const codeSet = new Set(existingCodes.filter((code) => code !== currentCode));
  let suffix = 1;

  while (true) {
    const candidate = `${prefix}${String(suffix).padStart(3, "0")}`;
    if (!codeSet.has(candidate)) return candidate;
    suffix += 1;
  }
}

export function createCatalogId(base: string, prefix: string, existingIds: string[]) {
  const normalizedBase = normalizeCatalogName(base) || prefix;
  const idPrefix = `${prefix}-${normalizedBase}`;
  const existingIdSet = new Set(existingIds);

  if (!existingIdSet.has(idPrefix)) return idPrefix;

  let counter = 2;
  while (existingIdSet.has(`${idPrefix}-${counter}`)) {
    counter += 1;
  }

  return `${idPrefix}-${counter}`;
}

export function getCatalogCategoryById(
  categories: CatalogCategory[],
  categoryId: string,
) {
  return categories.find((category) => category.id === categoryId) ?? null;
}

export function getCatalogItemTypeById(
  itemTypes: CatalogItemType[],
  itemTypeId: string,
) {
  return itemTypes.find((itemType) => itemType.id === itemTypeId) ?? null;
}

export function getCatalogCategoryName(
  categories: CatalogCategory[],
  categoryId: string,
) {
  return getCatalogCategoryById(categories, categoryId)?.name ?? "Category";
}

export function getCatalogItemTypeName(
  itemTypes: CatalogItemType[],
  itemTypeId: string,
) {
  return getCatalogItemTypeById(itemTypes, itemTypeId)?.name ?? "Type";
}
