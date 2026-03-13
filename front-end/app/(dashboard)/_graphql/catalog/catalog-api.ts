"use client";

import { gql } from "@apollo/client/core";
import { apolloClient } from "@/app/providers/apolloClient";
import type {
  CatalogProductAttribute,
  CatalogProductStatus,
  CatalogSnapshot,
  CurrencyCode,
  GoodsCatalogItem,
} from "@/app/_lib/order-types";

type CatalogCategoryDto = {
  id: string;
  displayName: string;
};

type CatalogItemTypeDto = {
  id: string;
  categoryId: string;
  displayName: string;
};

type CatalogProductImageDto = {
  imageUrl: string;
  sortOrder: number;
};

type CatalogProductAttributeDto = {
  id: string;
  attributeName: string;
  attributeValue: string;
};

type CatalogProductDto = {
  id: string;
  itemTypeId: string;
  displayName: string;
  productCode: string;
  unit: string;
  defaultCurrencyCode: string;
  defaultUnitCost: number | null;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  images: CatalogProductImageDto[];
  attributes: CatalogProductAttributeDto[];
};

export type CatalogApiProductInput = {
  name: string;
  code: string;
  categoryId: string;
  itemTypeName: string;
  currencyCode: CurrencyCode;
  defaultPrice: number;
  description: string;
  imageUrl: string | null;
  status: CatalogProductStatus;
  attributes: Array<Pick<CatalogProductAttribute, "name" | "value">>;
};

const catalogSnapshotQuery = gql`
  query CatalogSnapshot {
    catalogCategories {
      id
      displayName
    }
    catalogItemTypes {
      id
      categoryId
      displayName
    }
    catalogProducts {
      id
      itemTypeId
      displayName
      productCode
      unit
      defaultCurrencyCode
      defaultUnitCost
      description
      status
      createdAt
      updatedAt
      images {
        imageUrl
        sortOrder
      }
      attributes {
        id
        attributeName
        attributeValue
      }
    }
  }
`;

const createCatalogCategoryMutation = gql`
  mutation CreateCatalogCategory($displayName: String!) {
    createCatalogCategory(displayName: $displayName) {
      id
      displayName
    }
  }
`;

const deleteCatalogCategoryMutation = gql`
  mutation DeleteCatalogCategory($id: ID!) {
    deleteCatalogCategory(id: $id)
  }
`;

const createCatalogProductMutation = gql`
  mutation CreateCatalogProduct(
    $categoryId: ID!
    $itemTypeName: String!
    $displayName: String!
    $productCode: String!
    $defaultCurrencyCode: String!
    $defaultUnitCost: Float!
    $description: String
    $status: String!
    $attributes: [CatalogAttributeInput!]
    $images: [CatalogImageInput!]
  ) {
    createCatalogProduct(
      categoryId: $categoryId
      itemTypeName: $itemTypeName
      displayName: $displayName
      productCode: $productCode
      unit: "pcs"
      defaultCurrencyCode: $defaultCurrencyCode
      defaultUnitCost: $defaultUnitCost
      description: $description
      status: $status
      attributes: $attributes
      images: $images
    ) {
      id
    }
  }
`;

const updateCatalogProductMutation = gql`
  mutation UpdateCatalogProduct(
    $id: ID!
    $categoryId: ID!
    $itemTypeName: String!
    $displayName: String!
    $productCode: String!
    $defaultCurrencyCode: String!
    $defaultUnitCost: Float!
    $description: String
    $status: String!
    $attributes: [CatalogAttributeInput!]
    $images: [CatalogImageInput!]
  ) {
    updateCatalogProduct(
      id: $id
      categoryId: $categoryId
      itemTypeName: $itemTypeName
      displayName: $displayName
      productCode: $productCode
      unit: "pcs"
      defaultCurrencyCode: $defaultCurrencyCode
      defaultUnitCost: $defaultUnitCost
      description: $description
      status: $status
      attributes: $attributes
      images: $images
    ) {
      id
    }
  }
`;

function parseCurrencyCode(value: string): CurrencyCode {
  if (value === "USD" || value === "EUR" || value === "MNT") {
    return value;
  }

  return "MNT";
}

function parseCatalogProductStatus(value: string): CatalogProductStatus {
  if (value === "active" || value === "draft" || value === "archived") {
    return value;
  }

  return "draft";
}

function mapCatalogSnapshot(data: {
  catalogCategories: CatalogCategoryDto[];
  catalogItemTypes: CatalogItemTypeDto[];
  catalogProducts: CatalogProductDto[];
}): CatalogSnapshot {
  const itemTypeToCategoryId = new Map(
    data.catalogItemTypes.map((itemType) => [itemType.id, itemType.categoryId]),
  );

  const categories = [...data.catalogCategories]
    .sort((left, right) => left.displayName.localeCompare(right.displayName))
    .map((category) => ({
      id: category.id,
      name: category.displayName,
      description: "",
    }));

  const itemTypes = [...data.catalogItemTypes]
    .sort((left, right) => left.displayName.localeCompare(right.displayName))
    .map((itemType) => ({
      id: itemType.id,
      categoryId: itemType.categoryId,
      name: itemType.displayName,
      description: "",
    }));

  const products: GoodsCatalogItem[] = [...data.catalogProducts]
    .sort((left, right) => left.displayName.localeCompare(right.displayName))
    .map((product) => {
      const primaryImage =
        [...product.images].sort((left, right) => left.sortOrder - right.sortOrder)[0] ??
        null;

      return {
        id: product.id,
        name: product.displayName,
        code: product.productCode,
        unit: product.unit,
        categoryId: itemTypeToCategoryId.get(product.itemTypeId) ?? "",
        itemTypeId: product.itemTypeId,
        defaultPrice: product.defaultUnitCost ?? 0,
        currencyCode: parseCurrencyCode(product.defaultCurrencyCode),
        description: product.description ?? "",
        imageUrl: primaryImage?.imageUrl ?? null,
        status: parseCatalogProductStatus(product.status),
        attributes: product.attributes.map((attribute) => ({
          id: attribute.id,
          name: attribute.attributeName,
          value: attribute.attributeValue,
        })),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    });

  return { categories, itemTypes, products };
}

function mapProductInput(input: CatalogApiProductInput) {
  return {
    categoryId: input.categoryId,
    itemTypeName: input.itemTypeName.trim(),
    displayName: input.name.trim(),
    productCode: input.code.trim().toUpperCase(),
    defaultCurrencyCode: input.currencyCode,
    defaultUnitCost: input.defaultPrice,
    description: input.description.trim() || null,
    status: input.status,
    attributes: input.attributes
      .map((attribute, index) => ({
        attributeName: attribute.name.trim(),
        attributeValue: attribute.value.trim(),
        sortOrder: index,
      }))
      .filter(
        (attribute) =>
          attribute.attributeName.length > 0 &&
          attribute.attributeValue.length > 0,
      ),
    images: input.imageUrl
      ? [
          {
            imageUrl: input.imageUrl,
            sortOrder: 0,
          },
        ]
      : [],
  };
}

export async function fetchCatalogSnapshot() {
  const { data } = await apolloClient.query<{
    catalogCategories: CatalogCategoryDto[];
    catalogItemTypes: CatalogItemTypeDto[];
    catalogProducts: CatalogProductDto[];
  }>({
    query: catalogSnapshotQuery,
    fetchPolicy: "no-cache",
  });

  if (!data) {
    throw new Error("Failed to load catalog snapshot.");
  }

  return mapCatalogSnapshot(data);
}

export async function createCatalogCategoryRequest(displayName: string) {
  const { data } = await apolloClient.mutate<{
    createCatalogCategory: CatalogCategoryDto;
  }>({
    mutation: createCatalogCategoryMutation,
    variables: { displayName },
    fetchPolicy: "no-cache",
  });

  return data?.createCatalogCategory ?? null;
}

export async function deleteCatalogCategoryRequest(id: string) {
  const { data } = await apolloClient.mutate<{
    deleteCatalogCategory: boolean;
  }>({
    mutation: deleteCatalogCategoryMutation,
    variables: { id },
    fetchPolicy: "no-cache",
  });

  return data?.deleteCatalogCategory ?? false;
}

export async function createCatalogProductRequest(input: CatalogApiProductInput) {
  const { data } = await apolloClient.mutate<{
    createCatalogProduct: { id: string };
  }>({
    mutation: createCatalogProductMutation,
    variables: mapProductInput(input),
    fetchPolicy: "no-cache",
  });

  return data?.createCatalogProduct?.id ?? null;
}

export async function updateCatalogProductRequest(
  id: string,
  input: CatalogApiProductInput,
) {
  const { data } = await apolloClient.mutate<{
    updateCatalogProduct: { id: string } | null;
  }>({
    mutation: updateCatalogProductMutation,
    variables: {
      id,
      ...mapProductInput(input),
    },
    fetchPolicy: "no-cache",
  });

  return data?.updateCatalogProduct?.id ?? null;
}
