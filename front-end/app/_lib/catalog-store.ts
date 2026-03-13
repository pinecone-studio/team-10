"use client";

import { useSyncExternalStore } from "react";
import {
  createCatalogCategoryRequest,
  createCatalogProductRequest,
  fetchCatalogSnapshot,
  updateCatalogProductRequest,
  type CatalogApiProductInput,
} from "@/lib/catalog-api";
import {
  catalogCategoriesSeed,
  catalogItemTypesSeed,
  catalogProductsSeed,
  createCatalogCodeSuggestion,
  findDuplicateCatalogAttributeName,
  formatCatalogAttributeText,
  normalizeCatalogAttributeKey,
  normalizeCatalogName,
} from "./order-catalog";
import type {
  CatalogCategory,
  CatalogItemType,
  CatalogProductAttribute,
  CatalogProductStatus,
  CatalogSnapshot,
  CurrencyCode,
  GoodsCatalogItem,
} from "./order-types";

const FALLBACK_SNAPSHOT: CatalogSnapshot = {
  categories: catalogCategoriesSeed,
  itemTypes: catalogItemTypesSeed,
  products: catalogProductsSeed,
};

let cachedSnapshot = normalizeCatalogSnapshot(FALLBACK_SNAPSHOT);
let activeLoadPromise: Promise<CatalogSnapshot> | null = null;
let hasLoadedCatalog = false;
const subscribers = new Set<() => void>();

export type SaveCatalogProductInput = {
  name: string;
  code: string;
  categoryId: string;
  itemTypeName: string;
  currencyCode: CurrencyCode;
  defaultPrice: number;
  description: string;
  imageUrl: string | null;
  status: CatalogProductStatus;
  attributes: Array<Pick<CatalogProductAttribute, "id" | "name" | "value">>;
};

function emitChange() {
  subscribers.forEach((subscriber) => subscriber());
}

function normalizeCategory(category: CatalogCategory): CatalogCategory {
  return {
    id: category.id,
    name: category.name.trim(),
    description: category.description.trim(),
  };
}

function normalizeItemType(itemType: CatalogItemType): CatalogItemType {
  return {
    id: itemType.id,
    categoryId: itemType.categoryId,
    name: itemType.name.trim(),
    description: itemType.description.trim(),
  };
}

function normalizeAttributes(
  attributes: Array<Pick<CatalogProductAttribute, "id" | "name" | "value">>,
): CatalogProductAttribute[] {
  const seenAttributeNames = new Set<string>();

  return attributes
    .map((attribute) => ({
      id: attribute.id,
      name: formatCatalogAttributeText(attribute.name).trim(),
      value: formatCatalogAttributeText(attribute.value).trim(),
    }))
    .filter((attribute) => {
      if (attribute.name.length === 0 || attribute.value.length === 0) return false;

      const normalizedKey = normalizeCatalogAttributeKey(attribute.name);
      if (seenAttributeNames.has(normalizedKey)) return false;

      seenAttributeNames.add(normalizedKey);
      return true;
    });
}

function validateUniqueAttributes(
  attributes: Array<Pick<CatalogProductAttribute, "name">>,
) {
  const duplicateName = findDuplicateCatalogAttributeName(
    attributes.map((attribute) => attribute.name),
  );

  if (duplicateName) {
    throw new Error(
      `Custom attributes must be unique. "${duplicateName}" is already added.`,
    );
  }
}

function normalizeProduct(product: GoodsCatalogItem): GoodsCatalogItem {
  const nowIso = new Date().toISOString();
  return {
    id: product.id,
    name: product.name.trim(),
    code: product.code.trim().toUpperCase(),
    unit: product.unit.trim() || "pcs",
    categoryId: product.categoryId,
    itemTypeId: product.itemTypeId,
    currencyCode: product.currencyCode ?? "MNT",
    defaultPrice: Number.isFinite(product.defaultPrice) ? product.defaultPrice : 0,
    description: product.description.trim(),
    imageUrl: product.imageUrl ?? null,
    status: product.status ?? "active",
    attributes: normalizeAttributes(product.attributes ?? []),
    createdAt: product.createdAt ?? nowIso,
    updatedAt: product.updatedAt ?? nowIso,
  };
}

function normalizeCatalogSnapshot(snapshot: Partial<CatalogSnapshot>): CatalogSnapshot {
  return {
    categories: Array.isArray(snapshot.categories)
      ? snapshot.categories.map(normalizeCategory)
      : FALLBACK_SNAPSHOT.categories.map(normalizeCategory),
    itemTypes: Array.isArray(snapshot.itemTypes)
      ? snapshot.itemTypes.map(normalizeItemType)
      : FALLBACK_SNAPSHOT.itemTypes.map(normalizeItemType),
    products: Array.isArray(snapshot.products)
      ? snapshot.products.map(normalizeProduct)
      : FALLBACK_SNAPSHOT.products.map(normalizeProduct),
  };
}

function readCatalogSnapshot() {
  return cachedSnapshot;
}

async function refreshCatalogStore() {
  if (activeLoadPromise) {
    return activeLoadPromise;
  }

  activeLoadPromise = fetchCatalogSnapshot()
    .then((snapshot) => {
      const normalizedSnapshot = normalizeCatalogSnapshot(snapshot);
      cachedSnapshot = normalizedSnapshot;
      hasLoadedCatalog = true;
      emitChange();
      return normalizedSnapshot;
    })
    .finally(() => {
      activeLoadPromise = null;
    });

  return activeLoadPromise;
}

function ensureCatalogStoreLoaded() {
  if (hasLoadedCatalog || activeLoadPromise) return;

  void refreshCatalogStore().catch((error) => {
    console.error("Failed to load catalog snapshot.", error);
  });
}

async function getLatestCatalogSnapshot() {
  if (hasLoadedCatalog) {
    return cachedSnapshot;
  }

  try {
    return await refreshCatalogStore();
  } catch {
    return cachedSnapshot;
  }
}

export async function loadCatalogSnapshot() {
  return getLatestCatalogSnapshot();
}

function subscribe(callback: () => void) {
  subscribers.add(callback);
  ensureCatalogStoreLoaded();

  return () => {
    subscribers.delete(callback);
  };
}

function toCatalogApiProductInput(input: SaveCatalogProductInput): CatalogApiProductInput {
  return {
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    categoryId: input.categoryId,
    itemTypeName: formatCatalogAttributeText(input.itemTypeName).trim(),
    currencyCode: input.currencyCode,
    defaultPrice: input.defaultPrice,
    description: input.description.trim(),
    imageUrl: input.imageUrl,
    status: input.status,
    attributes: normalizeAttributes(input.attributes),
  };
}

export function useCatalogStore() {
  return useSyncExternalStore(
    subscribe,
    readCatalogSnapshot,
    () => FALLBACK_SNAPSHOT,
  );
}

export async function createCatalogCategory(name: string) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Category name is required.");
  }

  const snapshot = await getLatestCatalogSnapshot();
  const existingCategory = snapshot.categories.find(
    (category) =>
      normalizeCatalogName(category.name) === normalizeCatalogName(trimmedName),
  );

  if (existingCategory) {
    return {
      category: existingCategory,
      itemType:
        snapshot.itemTypes.find(
          (itemType) => itemType.categoryId === existingCategory.id,
        ) ?? null,
    };
  }

  const category = await createCatalogCategoryRequest(trimmedName);
  if (!category) {
    throw new Error("Failed to create category.");
  }

  const nextSnapshot = await refreshCatalogStore();
  const savedCategory =
    nextSnapshot.categories.find((entry) => entry.id === category.id) ??
    nextSnapshot.categories.find(
      (entry) =>
        normalizeCatalogName(entry.name) === normalizeCatalogName(trimmedName),
    );

  if (!savedCategory) {
    throw new Error("Created category could not be loaded.");
  }

  return {
    category: savedCategory,
    itemType:
      nextSnapshot.itemTypes.find(
        (itemType) =>
          itemType.categoryId === savedCategory.id &&
          normalizeCatalogName(itemType.name) === "general",
      ) ?? null,
  };
}

export function suggestCatalogProductCode(
  name: string,
  currentProductId?: string,
) {
  const currentCode = currentProductId
    ? cachedSnapshot.products.find((product) => product.id === currentProductId)?.code
    : undefined;

  return createCatalogCodeSuggestion(
    name,
    cachedSnapshot.products.map((product) => product.code),
    currentCode,
  );
}

export async function createCatalogProduct(input: SaveCatalogProductInput) {
  const snapshot = await getLatestCatalogSnapshot();
  const payload = toCatalogApiProductInput(input);

  if (!payload.name) {
    throw new Error("Product name is required.");
  }

  if (!payload.code) {
    throw new Error("Product code is required.");
  }

  if (!payload.categoryId) {
    throw new Error("Select a valid category.");
  }

  if (!payload.itemTypeName) {
    throw new Error("Type is required.");
  }

  const existingProduct = snapshot.products.find(
    (product) => product.code.toUpperCase() === payload.code,
  );

  if (existingProduct) {
    throw new Error("Product code already exists.");
  }

  validateUniqueAttributes(input.attributes);

  const productId = await createCatalogProductRequest(payload);
  if (!productId) {
    throw new Error("Failed to create product.");
  }

  const nextSnapshot = await refreshCatalogStore();
  const createdProduct = nextSnapshot.products.find(
    (product) => product.id === productId,
  );

  if (!createdProduct) {
    throw new Error("Created product could not be loaded.");
  }

  return createdProduct;
}

export async function updateCatalogProduct(
  productId: string,
  input: SaveCatalogProductInput,
) {
  const snapshot = await getLatestCatalogSnapshot();
  const existingProduct = snapshot.products.find((product) => product.id === productId);

  if (!existingProduct) {
    throw new Error("Product not found.");
  }

  const payload = toCatalogApiProductInput(input);
  if (!payload.name) {
    throw new Error("Product name is required.");
  }

  if (!payload.code) {
    throw new Error("Product code is required.");
  }

  if (!payload.categoryId) {
    throw new Error("Select a valid category.");
  }

  if (!payload.itemTypeName) {
    throw new Error("Type is required.");
  }

  const duplicateProduct = snapshot.products.find(
    (product) =>
      product.id !== productId && product.code.toUpperCase() === payload.code,
  );

  if (duplicateProduct) {
    throw new Error("Product code already exists.");
  }

  validateUniqueAttributes(input.attributes);

  const updatedProductId = await updateCatalogProductRequest(productId, payload);
  if (!updatedProductId) {
    throw new Error("Failed to update product.");
  }

  const nextSnapshot = await refreshCatalogStore();
  const updatedProduct = nextSnapshot.products.find(
    (product) => product.id === updatedProductId,
  );

  if (!updatedProduct) {
    throw new Error("Updated product could not be loaded.");
  }

  return updatedProduct;
}
