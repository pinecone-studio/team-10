export const CatalogTypeDefs = `
  type CatalogCategory {
    id: ID!
    displayName: String!
    normalizedName: String!
    status: String!
    source: String!
    createdAt: String!
    updatedAt: String!
  }

  type CatalogItemType {
    id: ID!
    categoryId: ID!
    displayName: String!
    normalizedName: String!
    status: String!
    source: String!
    createdAt: String!
    updatedAt: String!
  }

  type CatalogProductImage {
    id: ID!
    productId: ID!
    imageUrl: String!
    sortOrder: Int!
    createdAt: String!
    updatedAt: String!
  }

  type CatalogProductAttribute {
    id: ID!
    productId: ID!
    catalogAttributeDefinitionId: ID
    attributeName: String!
    attributeValue: String!
    sortOrder: Int!
    createdAt: String!
    updatedAt: String!
  }

  type CatalogProduct {
    id: ID!
    itemTypeId: ID!
    displayName: String!
    normalizedName: String!
    productCode: String!
    unit: String!
    defaultCurrencyCode: String!
    defaultUnitCost: Float
    description: String
    status: String!
    source: String!
    createdAt: String!
    updatedAt: String!
    images: [CatalogProductImage!]!
    attributes: [CatalogProductAttribute!]!
  }

  input CatalogAttributeInput {
    attributeName: String!
    attributeValue: String!
    sortOrder: Int
  }

  input CatalogImageInput {
    imageUrl: String!
    sortOrder: Int
  }

  type Query {
    catalogCategories: [CatalogCategory!]!
    catalogItemTypes(categoryId: ID): [CatalogItemType!]!
    catalogProducts(categoryId: ID, itemTypeId: ID, status: String): [CatalogProduct!]!
    catalogProduct(id: ID!): CatalogProduct
  }

  type Mutation {
    createCatalogCategory(displayName: String!): CatalogCategory!
    createCatalogProduct(
      itemTypeId: ID
      categoryId: ID
      itemTypeName: String
      displayName: String!
      productCode: String!
      unit: String
      defaultCurrencyCode: String
      defaultUnitCost: Float
      description: String
      status: String
      attributes: [CatalogAttributeInput!]
      images: [CatalogImageInput!]
    ): CatalogProduct!
    updateCatalogProduct(
      id: ID!
      itemTypeId: ID
      categoryId: ID
      itemTypeName: String
      displayName: String
      productCode: String
      unit: String
      defaultCurrencyCode: String
      defaultUnitCost: Float
      description: String
      status: String
      attributes: [CatalogAttributeInput!]
      images: [CatalogImageInput!]
    ): CatalogProduct
  }
`;
