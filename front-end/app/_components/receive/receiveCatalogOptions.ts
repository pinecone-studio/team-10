"use client";

import type { CatalogSnapshot } from "../../_lib/order-types";

const FALLBACK_OPTIONS: Record<string, string[]> = {
  "IT Equipment": ["Keyboard", "Mouse", "Cable", "Monitor", "Laptop"],
  "Office Equipment": ["Printer", "Scanner", "Projector", "Shredder"],
  Furniture: ["Desk", "Chair", "Cabinet", "Table"],
  "Mobile Devices": ["Phone", "Tablet", "Charger", "Accessory"],
  "Network Equipment": ["Router", "Switch", "Access Point", "Firewall"],
  "Other Assets": ["General", "Accessory"],
};

export function buildReceiveCatalogOptions(catalog: CatalogSnapshot) {
  const categoryNames = [
    ...Object.keys(FALLBACK_OPTIONS),
    ...catalog.categories.map((category) => category.name.trim()).filter(Boolean),
  ];
  const categories = [...new Set(categoryNames)].sort((left, right) =>
    left.localeCompare(right),
  );

  const categoryNameById = new Map(
    catalog.categories.map((category) => [category.id, category.name.trim()]),
  );
  const typesByCategory = categories.reduce<Record<string, string[]>>((accumulator, category) => {
    const catalogTypes = catalog.itemTypes
      .filter((itemType) => categoryNameById.get(itemType.categoryId) === category)
      .map((itemType) => itemType.name.trim())
      .filter(Boolean);

    accumulator[category] = [
      ...new Set([...(FALLBACK_OPTIONS[category] ?? []), ...catalogTypes]),
    ].sort((left, right) => left.localeCompare(right));

    return accumulator;
  }, {});

  return { categories, typesByCategory };
}
