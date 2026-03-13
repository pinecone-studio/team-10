import { and, asc, eq, inArray } from "drizzle-orm";
import {
  catalogAttributeDefinitions,
  catalogCategories,
  catalogItemTypes,
  catalogProductAttributes,
  catalogProductImages,
  catalogProducts,
  currencyCodeValues,
  catalogSourceValues,
  catalogStatusValues,
} from "../database/schema.ts";
import type { AppDb } from "./db.ts";
import { parseIntegerId, resolveUserId } from "./reference-resolvers.ts";

type CatalogStatus = (typeof catalogStatusValues)[number];
type CatalogSource = (typeof catalogSourceValues)[number];
type CurrencyCode = (typeof currencyCodeValues)[number];

type CatalogCategoryRow = {
  id: number;
  displayName: string;
  normalizedName: string;
  status: CatalogStatus;
  source: CatalogSource;
  createdAt: string;
  updatedAt: string;
};

type CatalogItemTypeRow = {
  id: number;
  categoryId: number;
  displayName: string;
  normalizedName: string;
  status: CatalogStatus;
  source: CatalogSource;
  createdAt: string;
  updatedAt: string;
};

type CatalogProductRow = {
  id: number;
  itemTypeId: number;
  displayName: string;
  normalizedName: string;
  productCode: string;
  unit: string;
  defaultCurrencyCode: CurrencyCode;
  defaultUnitCost: number | null;
  description: string | null;
  status: CatalogStatus;
  source: CatalogSource;
  createdAt: string;
  updatedAt: string;
};

type CatalogProductImageRow = {
  id: number;
  productId: number;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type CatalogProductAttributeRow = {
  id: number;
  productId: number;
  catalogAttributeDefinitionId: number | null;
  attributeName: string;
  attributeValue: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CatalogCategoryRecord = {
  id: string;
  displayName: string;
  normalizedName: string;
  status: CatalogStatus;
  source: CatalogSource;
  createdAt: string;
  updatedAt: string;
};

export type CatalogItemTypeRecord = {
  id: string;
  categoryId: string;
  displayName: string;
  normalizedName: string;
  status: CatalogStatus;
  source: CatalogSource;
  createdAt: string;
  updatedAt: string;
};

export type CatalogProductImageRecord = {
  id: string;
  productId: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CatalogProductAttributeRecord = {
  id: string;
  productId: string;
  catalogAttributeDefinitionId: string | null;
  attributeName: string;
  attributeValue: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CatalogProductRecord = {
  id: string;
  itemTypeId: string;
  displayName: string;
  normalizedName: string;
  productCode: string;
  unit: string;
  defaultCurrencyCode: CurrencyCode;
  defaultUnitCost: number | null;
  description: string | null;
  status: CatalogStatus;
  source: CatalogSource;
  createdAt: string;
  updatedAt: string;
  images: CatalogProductImageRecord[];
  attributes: CatalogProductAttributeRecord[];
};

export type CatalogAttributeInput = {
  attributeName: string;
  attributeValue: string;
  sortOrder?: number | null;
};

export type CatalogImageInput = {
  imageUrl: string;
  sortOrder?: number | null;
};

export type CreateCatalogCategoryInput = {
  displayName: string;
};

export type ListCatalogItemTypesInput = {
  categoryId?: string | null;
};

export type ListCatalogProductsInput = {
  categoryId?: string | null;
  itemTypeId?: string | null;
  status?: string | null;
};

export type CreateCatalogProductInput = {
  itemTypeId?: string | null;
  categoryId?: string | null;
  itemTypeName?: string | null;
  displayName: string;
  productCode: string;
  unit?: string | null;
  defaultCurrencyCode?: string | null;
  defaultUnitCost?: number | null;
  description?: string | null;
  status?: string | null;
  attributes?: CatalogAttributeInput[] | null;
  images?: CatalogImageInput[] | null;
};

export type UpdateCatalogProductInput = {
  itemTypeId?: string | null;
  categoryId?: string | null;
  itemTypeName?: string | null;
  displayName?: string | null;
  productCode?: string | null;
  unit?: string | null;
  defaultCurrencyCode?: string | null;
  defaultUnitCost?: number | null;
  description?: string | null;
  status?: string | null;
  attributes?: CatalogAttributeInput[] | null;
  images?: CatalogImageInput[] | null;
};

const categorySelection = {
  id: catalogCategories.id,
  displayName: catalogCategories.displayName,
  normalizedName: catalogCategories.normalizedName,
  status: catalogCategories.status,
  source: catalogCategories.source,
  createdAt: catalogCategories.createdAt,
  updatedAt: catalogCategories.updatedAt,
};

const itemTypeSelection = {
  id: catalogItemTypes.id,
  categoryId: catalogItemTypes.categoryId,
  displayName: catalogItemTypes.displayName,
  normalizedName: catalogItemTypes.normalizedName,
  status: catalogItemTypes.status,
  source: catalogItemTypes.source,
  createdAt: catalogItemTypes.createdAt,
  updatedAt: catalogItemTypes.updatedAt,
};

const productSelection = {
  id: catalogProducts.id,
  itemTypeId: catalogProducts.itemTypeId,
  displayName: catalogProducts.displayName,
  normalizedName: catalogProducts.normalizedName,
  productCode: catalogProducts.productCode,
  unit: catalogProducts.unit,
  defaultCurrencyCode: catalogProducts.defaultCurrencyCode,
  defaultUnitCost: catalogProducts.defaultUnitCost,
  description: catalogProducts.description,
  status: catalogProducts.status,
  source: catalogProducts.source,
  createdAt: catalogProducts.createdAt,
  updatedAt: catalogProducts.updatedAt,
};

const productImageSelection = {
  id: catalogProductImages.id,
  productId: catalogProductImages.productId,
  imageUrl: catalogProductImages.imageUrl,
  sortOrder: catalogProductImages.sortOrder,
  createdAt: catalogProductImages.createdAt,
  updatedAt: catalogProductImages.updatedAt,
};

const productAttributeSelection = {
  id: catalogProductAttributes.id,
  productId: catalogProductAttributes.productId,
  catalogAttributeDefinitionId: catalogProductAttributes.catalogAttributeDefinitionId,
  attributeName: catalogProductAttributes.attributeName,
  attributeValue: catalogProductAttributes.attributeValue,
  sortOrder: catalogProductAttributes.sortOrder,
  createdAt: catalogProductAttributes.createdAt,
  updatedAt: catalogProductAttributes.updatedAt,
};

function normalizeCatalogName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCatalogAttributeText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return `${trimmed[0]!.toUpperCase()}${trimmed.slice(1)}`;
}

function normalizeCatalogAttributeKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function parseCatalogStatus(status?: string | null, fallback: CatalogStatus = "draft") {
  if (!status) return fallback;
  if (!catalogStatusValues.includes(status as CatalogStatus)) {
    throw new Error(
      `Catalog status must be one of: ${catalogStatusValues.join(", ")}.`,
    );
  }

  return status as CatalogStatus;
}

function parseCurrencyCode(
  currencyCode?: string | null,
  fallback: CurrencyCode = "MNT",
) {
  if (!currencyCode) return fallback;
  if (!currencyCodeValues.includes(currencyCode as CurrencyCode)) {
    throw new Error(
      `Currency code must be one of: ${currencyCodeValues.join(", ")}.`,
    );
  }

  return currencyCode as CurrencyCode;
}

function mapCategory(row: CatalogCategoryRow): CatalogCategoryRecord {
  return {
    id: String(row.id),
    displayName: row.displayName,
    normalizedName: row.normalizedName,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapItemType(row: CatalogItemTypeRow): CatalogItemTypeRecord {
  return {
    id: String(row.id),
    categoryId: String(row.categoryId),
    displayName: row.displayName,
    normalizedName: row.normalizedName,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapProductImage(row: CatalogProductImageRow): CatalogProductImageRecord {
  return {
    id: String(row.id),
    productId: String(row.productId),
    imageUrl: row.imageUrl,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapProductAttribute(
  row: CatalogProductAttributeRow,
): CatalogProductAttributeRecord {
  return {
    id: String(row.id),
    productId: String(row.productId),
    catalogAttributeDefinitionId:
      row.catalogAttributeDefinitionId === null
        ? null
        : String(row.catalogAttributeDefinitionId),
    attributeName: row.attributeName,
    attributeValue: row.attributeValue,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function assembleProducts(
  rows: CatalogProductRow[],
  imageRows: CatalogProductImageRow[],
  attributeRows: CatalogProductAttributeRow[],
): CatalogProductRecord[] {
  return rows.map((row) => ({
    id: String(row.id),
    itemTypeId: String(row.itemTypeId),
    displayName: row.displayName,
    normalizedName: row.normalizedName,
    productCode: row.productCode,
    unit: row.unit,
    defaultCurrencyCode: row.defaultCurrencyCode,
    defaultUnitCost: row.defaultUnitCost,
    description: row.description,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    images: imageRows
      .filter((image) => image.productId === row.id)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(mapProductImage),
    attributes: attributeRows
      .filter((attribute) => attribute.productId === row.id)
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map(mapProductAttribute),
  }));
}

async function listProductRelations(db: AppDb, productIds: number[]) {
  if (productIds.length === 0) {
    return {
      images: [] as CatalogProductImageRow[],
      attributes: [] as CatalogProductAttributeRow[],
    };
  }

  const [images, attributes] = await Promise.all([
    db
      .select(productImageSelection)
      .from(catalogProductImages)
      .where(inArray(catalogProductImages.productId, productIds))
      .orderBy(
        asc(catalogProductImages.productId),
        asc(catalogProductImages.sortOrder),
        asc(catalogProductImages.id),
      ),
    db
      .select(productAttributeSelection)
      .from(catalogProductAttributes)
      .where(inArray(catalogProductAttributes.productId, productIds))
      .orderBy(
        asc(catalogProductAttributes.productId),
        asc(catalogProductAttributes.sortOrder),
        asc(catalogProductAttributes.id),
      ),
  ]);

  return { images, attributes };
}

async function resolveOptionalCurrentUserId(
  db: AppDb,
  currentUserId?: string | null,
) {
  if (!currentUserId) return null;
  return resolveUserId(db, undefined, currentUserId);
}

async function resolveCatalogItemTypeId(
  db: AppDb,
  input: {
    itemTypeId?: string | null;
    categoryId?: string | null;
    itemTypeName?: string | null;
  },
  currentUserId?: string | null,
) {
  if (input.itemTypeId) {
    const numericItemTypeId = parseIntegerId("itemTypeId", input.itemTypeId);
    const [itemTypeRow] = await db
      .select({ id: catalogItemTypes.id })
      .from(catalogItemTypes)
      .where(eq(catalogItemTypes.id, numericItemTypeId))
      .limit(1);

    if (!itemTypeRow) {
      throw new Error(`Item type ${input.itemTypeId} does not exist.`);
    }

    return numericItemTypeId;
  }

  if (!input.categoryId?.trim()) {
    throw new Error("Category is required.");
  }

  const itemTypeDisplayName = formatCatalogAttributeText(input.itemTypeName ?? "");
  if (!itemTypeDisplayName) {
    throw new Error("Type is required.");
  }

  const categoryId = parseIntegerId("categoryId", input.categoryId);
  const [categoryRow] = await db
    .select({ id: catalogCategories.id })
    .from(catalogCategories)
    .where(eq(catalogCategories.id, categoryId))
    .limit(1);

  if (!categoryRow) {
    throw new Error(`Category ${input.categoryId} does not exist.`);
  }

  const normalizedItemTypeName = normalizeCatalogName(itemTypeDisplayName);
  const [existingItemType] = await db
    .select({ id: catalogItemTypes.id })
    .from(catalogItemTypes)
    .where(
      and(
        eq(catalogItemTypes.categoryId, categoryId),
        eq(catalogItemTypes.normalizedName, normalizedItemTypeName),
      ),
    )
    .limit(1);

  if (existingItemType) {
    return existingItemType.id;
  }

  const createdByUserId = await resolveOptionalCurrentUserId(db, currentUserId);
  const [itemTypeRow] = await db
    .insert(catalogItemTypes)
    .values({
      categoryId,
      displayName: itemTypeDisplayName,
      normalizedName: normalizedItemTypeName,
      status: "active",
      source: "manual",
      createdByUserId,
      approvedByUserId: null,
    })
    .returning({ id: catalogItemTypes.id });

  return itemTypeRow.id;
}

async function resolveAttributeDefinitions(
  db: AppDb,
  itemTypeId: number,
  inputs: CatalogAttributeInput[],
) {
  const normalizedAttributeNames = inputs.map((input) => normalizeCatalogName(input.attributeName));
  if (normalizedAttributeNames.length === 0) return new Map<string, number>();

  const rows = await db
    .select({
      id: catalogAttributeDefinitions.id,
      normalizedName: catalogAttributeDefinitions.normalizedName,
    })
    .from(catalogAttributeDefinitions)
    .where(eq(catalogAttributeDefinitions.itemTypeId, itemTypeId));

  const attributeDefinitionMap = new Map<string, number>();
  rows.forEach((row) => {
    attributeDefinitionMap.set(row.normalizedName, row.id);
  });

  return attributeDefinitionMap;
}

function normalizeAttributeInputs(inputs?: CatalogAttributeInput[] | null) {
  const normalizedInputs = (inputs ?? [])
    .map((input, index) => ({
      attributeName: formatCatalogAttributeText(input.attributeName),
      attributeValue: formatCatalogAttributeText(input.attributeValue),
      sortOrder: input.sortOrder ?? index,
    }))
    .filter(
      (input) =>
        input.attributeName.length > 0 && input.attributeValue.length > 0,
    );

  const seenAttributeNames = new Set<string>();
  for (const input of normalizedInputs) {
    const normalizedKey = normalizeCatalogAttributeKey(input.attributeName);
    if (seenAttributeNames.has(normalizedKey)) {
      throw new Error(
        `Custom attributes must be unique. "${input.attributeName}" is already added.`,
      );
    }

    seenAttributeNames.add(normalizedKey);
  }

  return normalizedInputs;
}

function normalizeImageInputs(inputs?: CatalogImageInput[] | null) {
  return (inputs ?? [])
    .map((input, index) => ({
      imageUrl: input.imageUrl.trim(),
      sortOrder: input.sortOrder ?? index,
    }))
    .filter((input) => input.imageUrl.length > 0);
}

export async function listCatalogCategories(
  db: AppDb,
): Promise<CatalogCategoryRecord[]> {
  const rows = await db
    .select(categorySelection)
    .from(catalogCategories)
    .orderBy(asc(catalogCategories.displayName));

  return rows.map(mapCategory);
}

export async function listCatalogItemTypes(
  db: AppDb,
  input: ListCatalogItemTypesInput = {},
): Promise<CatalogItemTypeRecord[]> {
  const query = db
    .select(itemTypeSelection)
    .from(catalogItemTypes)
    .orderBy(asc(catalogItemTypes.displayName));

  const rows = input.categoryId
    ? await query.where(
        eq(
          catalogItemTypes.categoryId,
          parseIntegerId("categoryId", input.categoryId),
        ),
      )
    : await query;

  return rows.map(mapItemType);
}

export async function listCatalogProducts(
  db: AppDb,
  input: ListCatalogProductsInput = {},
): Promise<CatalogProductRecord[]> {
  const categoryId = input.categoryId
    ? parseIntegerId("categoryId", input.categoryId)
    : null;
  const itemTypeId = input.itemTypeId
    ? parseIntegerId("itemTypeId", input.itemTypeId)
    : null;
  const status = input.status ? parseCatalogStatus(input.status) : null;

  const filters: ReturnType<typeof eq>[] = [];
  if (categoryId !== null) {
    filters.push(eq(catalogItemTypes.categoryId, categoryId));
  }
  if (itemTypeId !== null) {
    filters.push(eq(catalogProducts.itemTypeId, itemTypeId));
  }
  if (status !== null) {
    filters.push(eq(catalogProducts.status, status));
  }

  const joinedQuery = db
    .select(productSelection)
    .from(catalogProducts)
    .innerJoin(
      catalogItemTypes,
      eq(catalogProducts.itemTypeId, catalogItemTypes.id),
    );

  const rows =
    filters.length > 0
      ? await joinedQuery
          .where(filters.length === 1 ? filters[0] : and(...filters))
          .orderBy(asc(catalogProducts.displayName))
      : await db
          .select(productSelection)
          .from(catalogProducts)
          .orderBy(asc(catalogProducts.displayName));

  const productIds = rows.map((row) => row.id);
  const relations = await listProductRelations(db, productIds);

  return assembleProducts(rows, relations.images, relations.attributes);
}

export async function getCatalogProductById(
  db: AppDb,
  id: string,
): Promise<CatalogProductRecord | null> {
  const numericId = parseIntegerId("Catalog product id", id);
  const [row] = await db
    .select(productSelection)
    .from(catalogProducts)
    .where(eq(catalogProducts.id, numericId))
    .limit(1);

  if (!row) return null;

  const relations = await listProductRelations(db, [row.id]);
  return assembleProducts([row], relations.images, relations.attributes)[0] ?? null;
}

export async function createCatalogCategory(
  db: AppDb,
  input: CreateCatalogCategoryInput,
  currentUserId?: string | null,
): Promise<CatalogCategoryRecord> {
  const displayName = input.displayName.trim();
  if (!displayName) {
    throw new Error("Category name is required.");
  }

  const normalizedName = normalizeCatalogName(displayName);
  const createdByUserId = await resolveOptionalCurrentUserId(db, currentUserId);

  const [existingCategory] = await db
    .select(categorySelection)
    .from(catalogCategories)
    .where(eq(catalogCategories.normalizedName, normalizedName))
    .limit(1);

  if (existingCategory) {
    return mapCategory(existingCategory);
  }

  const [categoryRow] = await db
    .insert(catalogCategories)
    .values({
      displayName,
      normalizedName,
      status: "active",
      source: "manual",
      createdByUserId,
      approvedByUserId: null,
    })
    .returning(categorySelection);

  await db
    .insert(catalogItemTypes)
    .values({
      categoryId: categoryRow.id,
      displayName: "General",
      normalizedName: "general",
      status: "active",
      source: "manual",
      createdByUserId,
      approvedByUserId: null,
    })
    .run();

  return mapCategory(categoryRow);
}

export async function deleteCatalogCategory(
  db: AppDb,
  id: string,
): Promise<boolean> {
  const numericId = parseIntegerId("Catalog category id", id);
  const [existingCategory] = await db
    .select({ id: catalogCategories.id })
    .from(catalogCategories)
    .where(eq(catalogCategories.id, numericId))
    .limit(1);

  if (!existingCategory) {
    return false;
  }

  await db
    .delete(catalogCategories)
    .where(eq(catalogCategories.id, numericId))
    .run();

  return true;
}

export async function createCatalogProduct(
  db: AppDb,
  input: CreateCatalogProductInput,
  currentUserId?: string | null,
): Promise<CatalogProductRecord> {
  const displayName = input.displayName.trim();
  const productCode = input.productCode.trim().toUpperCase();
  const unit = input.unit?.trim() || "pcs";
  const defaultCurrencyCode = parseCurrencyCode(input.defaultCurrencyCode, "MNT");
  const normalizedName = normalizeCatalogName(displayName);
  const createdByUserId = await resolveOptionalCurrentUserId(db, currentUserId);
  const itemTypeId = await resolveCatalogItemTypeId(
    db,
    {
      itemTypeId: input.itemTypeId,
      categoryId: input.categoryId,
      itemTypeName: input.itemTypeName,
    },
    currentUserId,
  );

  if (!displayName) {
    throw new Error("Product name is required.");
  }

  if (!productCode) {
    throw new Error("Product code is required.");
  }

  const [duplicateProduct] = await db
    .select({ id: catalogProducts.id })
    .from(catalogProducts)
    .where(eq(catalogProducts.productCode, productCode))
    .limit(1);

  if (duplicateProduct) {
    throw new Error("Product code already exists.");
  }

  const [productRow] = await db
    .insert(catalogProducts)
    .values({
      itemTypeId,
      displayName,
      normalizedName,
      productCode,
      unit,
      defaultCurrencyCode,
      defaultUnitCost: input.defaultUnitCost ?? null,
      description: input.description?.trim() || null,
      status: parseCatalogStatus(input.status, "draft"),
      source: "manual",
      createdByUserId,
      approvedByUserId: null,
    })
    .returning(productSelection);

  const attributes = normalizeAttributeInputs(input.attributes);
  const images = normalizeImageInputs(input.images);
  const attributeDefinitionMap = await resolveAttributeDefinitions(
    db,
    itemTypeId,
    attributes,
  );

  if (images.length > 0) {
    await db
      .insert(catalogProductImages)
      .values(
        images.map((image) => ({
          productId: productRow.id,
          imageUrl: image.imageUrl,
          sortOrder: image.sortOrder,
        })),
      )
      .run();
  }

  if (attributes.length > 0) {
    await db
      .insert(catalogProductAttributes)
      .values(
        attributes.map((attribute) => ({
          productId: productRow.id,
          catalogAttributeDefinitionId:
            attributeDefinitionMap.get(
              normalizeCatalogName(attribute.attributeName),
            ) ?? null,
          attributeName: attribute.attributeName,
          attributeValue: attribute.attributeValue,
          sortOrder: attribute.sortOrder,
        })),
      )
      .run();
  }

  return getCatalogProductById(db, String(productRow.id)).then((product) => {
    if (!product) throw new Error("Failed to load created catalog product.");
    return product;
  });
}

export async function updateCatalogProduct(
  db: AppDb,
  id: string,
  input: UpdateCatalogProductInput,
  currentUserId?: string | null,
): Promise<CatalogProductRecord | null> {
  const numericId = parseIntegerId("Catalog product id", id);
  const existingProduct = await getCatalogProductById(db, id);
  if (!existingProduct) return null;

  const shouldResolveItemType =
    input.itemTypeId !== undefined ||
    input.categoryId !== undefined ||
    input.itemTypeName !== undefined;
  const nextItemTypeId = shouldResolveItemType
    ? await resolveCatalogItemTypeId(
        db,
        {
          itemTypeId: input.itemTypeId,
          categoryId: input.categoryId,
          itemTypeName: input.itemTypeName,
        },
        currentUserId,
      )
    : Number(existingProduct.itemTypeId);
  const nextDisplayName =
    input.displayName === undefined || input.displayName === null
      ? existingProduct.displayName
      : input.displayName.trim();
  const nextProductCode =
    input.productCode === undefined || input.productCode === null
      ? existingProduct.productCode
      : input.productCode.trim().toUpperCase();
  const nextUnit =
    input.unit === undefined || input.unit === null
      ? existingProduct.unit
      : input.unit.trim() || "pcs";
  const nextDefaultCurrencyCode =
    input.defaultCurrencyCode === undefined || input.defaultCurrencyCode === null
      ? existingProduct.defaultCurrencyCode
      : parseCurrencyCode(
          input.defaultCurrencyCode,
          existingProduct.defaultCurrencyCode,
        );

  if (!nextDisplayName) {
    throw new Error("Product name is required.");
  }

  if (!nextProductCode) {
    throw new Error("Product code is required.");
  }

  const [duplicateProduct] = await db
    .select({ id: catalogProducts.id })
    .from(catalogProducts)
    .where(eq(catalogProducts.productCode, nextProductCode))
    .limit(1);

  if (duplicateProduct && duplicateProduct.id !== numericId) {
    throw new Error("Product code already exists.");
  }

  const updates: Partial<typeof catalogProducts.$inferInsert> = {
    itemTypeId: nextItemTypeId,
    displayName: nextDisplayName,
    normalizedName: normalizeCatalogName(nextDisplayName),
    productCode: nextProductCode,
    unit: nextUnit,
    defaultCurrencyCode: nextDefaultCurrencyCode,
  };

  if (input.defaultUnitCost !== undefined) {
    updates.defaultUnitCost = input.defaultUnitCost;
  }

  if (input.description !== undefined) {
    updates.description = input.description?.trim() || null;
  }

  if (input.status !== undefined) {
    updates.status = parseCatalogStatus(input.status, existingProduct.status);
  }

  await db
    .update(catalogProducts)
    .set(updates)
    .where(eq(catalogProducts.id, numericId))
    .run();

  if (input.images !== undefined) {
    await db
      .delete(catalogProductImages)
      .where(eq(catalogProductImages.productId, numericId))
      .run();

    const images = normalizeImageInputs(input.images);
    if (images.length > 0) {
      await db
        .insert(catalogProductImages)
        .values(
          images.map((image) => ({
            productId: numericId,
            imageUrl: image.imageUrl,
            sortOrder: image.sortOrder,
          })),
        )
        .run();
    }
  }

  if (input.attributes !== undefined) {
    await db
      .delete(catalogProductAttributes)
      .where(eq(catalogProductAttributes.productId, numericId))
      .run();

    const attributes = normalizeAttributeInputs(input.attributes);
    const attributeDefinitionMap = await resolveAttributeDefinitions(
      db,
      nextItemTypeId,
      attributes,
    );

    if (attributes.length > 0) {
      await db
        .insert(catalogProductAttributes)
        .values(
          attributes.map((attribute) => ({
            productId: numericId,
            catalogAttributeDefinitionId:
              attributeDefinitionMap.get(
                normalizeCatalogName(attribute.attributeName),
              ) ?? null,
            attributeName: attribute.attributeName,
            attributeValue: attribute.attributeValue,
            sortOrder: attribute.sortOrder,
          })),
        )
        .run();
    }
  }

  return getCatalogProductById(db, id);
}
