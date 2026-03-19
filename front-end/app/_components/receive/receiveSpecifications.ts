"use client";

import type { GoodsCatalogItem } from "../../_lib/order-types";

export type ReceiveSpecificationField = {
  id: string;
  name: string;
  value: string;
  source: "template" | "custom";
  removable?: boolean;
};

const COMMON_FIELDS = ["Brand", "Model", "Color"];

const TYPE_FIELD_MAP: Record<string, string[]> = {
  computer: ["CPU", "RAM"],
  laptop: ["CPU", "RAM"],
  desktop: ["CPU", "RAM"],
  chair: ["Material", "Seat Color"],
  hoodie: ["Size", "Fabric"],
  table: ["Material", "Size / Dimension"],
  desk: ["Material", "Size / Dimension"],
  monitor: ["Screen Size", "Resolution"],
  keyboard: ["Layout", "Connection"],
  mouse: ["Connection", "DPI"],
};

const FIELD_FALLBACK_VALUES: Record<string, string> = {
  brand: "Generic",
  model: "Standard model",
  color: "Black",
  material: "Fabric",
  "seat color": "Black",
  size: "M",
  fabric: "Cotton blend",
  "size / dimension": "120 x 60 cm",
  "screen size": "24 inch",
  resolution: "1920 x 1080",
  layout: "US",
  connection: "Wireless",
  dpi: "1600",
};

const TYPE_VALUE_MAP: Record<string, Record<string, string>> = {
  laptop: {
    brand: "Dell",
    model: "Latitude 5440",
    color: "Silver",
    cpu: "Intel Core i5",
    ram: "16 GB",
  },
  desktop: {
    brand: "Dell",
    model: "OptiPlex 7010",
    color: "Black",
    cpu: "Intel Core i7",
    ram: "16 GB",
  },
  computer: {
    brand: "Dell",
    model: "OptiPlex 7010",
    color: "Black",
    cpu: "Intel Core i7",
    ram: "16 GB",
  },
  chair: {
    brand: "ErgoSeat",
    model: "Comfort Pro",
    color: "Black",
    material: "Mesh",
    "seat color": "Black",
  },
  hoodie: {
    brand: "AMS Wear",
    model: "Team Hoodie",
    color: "Black",
    size: "L",
    fabric: "Fleece",
  },
  table: {
    brand: "OfficeLine",
    model: "Work Table",
    color: "Oak",
    material: "Engineered wood",
    "size / dimension": "140 x 70 cm",
  },
  desk: {
    brand: "OfficeLine",
    model: "Work Desk",
    color: "Oak",
    material: "Engineered wood",
    "size / dimension": "140 x 70 cm",
  },
  monitor: {
    brand: "Dell",
    model: "P2422H",
    color: "Black",
    "screen size": "24 inch",
    resolution: "1920 x 1080",
  },
  keyboard: {
    brand: "Logitech",
    model: "MX Keys",
    color: "Graphite",
    layout: "US",
    connection: "Wireless",
  },
  mouse: {
    brand: "Logitech",
    model: "MX Master 3S",
    color: "Graphite",
    connection: "Wireless",
    dpi: "8000",
  },
};

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildField(
  name: string,
  value = "",
  source: ReceiveSpecificationField["source"] = "template",
): ReceiveSpecificationField {
  return {
    id: `${normalizeKey(name)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    value,
    source,
    removable: source === "custom",
  };
}

function getTypeTemplate(category: string, type: string, assetName: string) {
  const lookup = `${category} ${type} ${assetName}`.toLowerCase();
  const matchedEntry = Object.entries(TYPE_FIELD_MAP).find(([key]) => lookup.includes(key));
  return matchedEntry?.[1] ?? [];
}

function getTypeValueMap(category: string, type: string, assetName: string) {
  const lookup = `${category} ${type} ${assetName}`.toLowerCase();
  const matchedEntry = Object.entries(TYPE_VALUE_MAP).find(([key]) => lookup.includes(key));
  return matchedEntry?.[1] ?? {};
}

function getSuggestedValue(input: {
  name: string;
  product: GoodsCatalogItem | null;
  category: string;
  itemType: string;
  assetName: string;
}) {
  const fieldKey = normalizeKey(input.name);
  const matchedAttribute = input.product?.attributes.find(
    (attribute) => normalizeKey(attribute.name) === fieldKey,
  );
  if (matchedAttribute?.value.trim()) return matchedAttribute.value;

  const typeValues = getTypeValueMap(input.category, input.itemType, input.assetName);
  if (typeValues[fieldKey]?.trim()) return typeValues[fieldKey];

  if (fieldKey === "brand") {
    const firstWord = input.assetName.trim().split(/\s+/)[0];
    if (firstWord) return firstWord;
  }

  return FIELD_FALLBACK_VALUES[fieldKey] ?? "";
}

export function buildReceiveSpecificationFields(input: {
  product: GoodsCatalogItem | null;
  category: string;
  itemType: string;
  assetName: string;
  current?: ReceiveSpecificationField[];
  preferSuggestedValues?: boolean;
}) {
  const names = [
    ...COMMON_FIELDS,
    ...(input.product?.attributes.map((attribute) => attribute.name) ?? []),
  ];
  const uniqueNames = Array.from(
    names.reduce((acc, name) => {
      const normalized = normalizeKey(name);
      if (normalized) acc.set(normalized, name.trim());
      return acc;
    }, new Map<string, string>()),
  ).map(([, name]) => name);
  const currentLookup = new Map(
    (input.current ?? []).map((field) => [normalizeKey(field.name), field]),
  );
  const templateFields = uniqueNames.map((name) => {
    const existing = currentLookup.get(normalizeKey(name));
    const suggestedValue = getSuggestedValue({
      name,
      product: input.product,
      category: input.category,
      itemType: input.itemType,
      assetName: input.assetName,
    });
    return buildField(
      name,
      input.preferSuggestedValues ? suggestedValue : existing?.value ?? "",
      "template",
    );
  });
  const customFields = (input.current ?? [])
    .filter((field) => field.source === "custom")
    .map((field) =>
      input.preferSuggestedValues
        ? {
            ...field,
            value:
              field.value ||
              getSuggestedValue({
                name: field.name,
                product: input.product,
                category: input.category,
                itemType: input.itemType,
                assetName: input.assetName,
              }),
          }
        : field,
    );
  return [...templateFields, ...customFields];
}

export function getSuggestedSpecificationNames(category: string, itemType: string, assetName: string) {
  return getTypeTemplate(category, itemType, assetName);
}
