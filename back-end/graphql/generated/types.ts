import type { GraphQLResolveInfo } from 'graphql';
import type { GraphQLContext } from '@/lib/context';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CatalogAttributeInput = {
  attributeName: Scalars['String']['input'];
  attributeValue: Scalars['String']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type CatalogCategory = {
  __typename?: 'CatalogCategory';
  createdAt: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  normalizedName: Scalars['String']['output'];
  source: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CatalogImageInput = {
  imageUrl: Scalars['String']['input'];
  sortOrder?: InputMaybe<Scalars['Int']['input']>;
};

export type CatalogItemType = {
  __typename?: 'CatalogItemType';
  categoryId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  normalizedName: Scalars['String']['output'];
  source: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CatalogProduct = {
  __typename?: 'CatalogProduct';
  attributes: Array<CatalogProductAttribute>;
  createdAt: Scalars['String']['output'];
  defaultCurrencyCode: Scalars['String']['output'];
  defaultUnitCost?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  displayName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  images: Array<CatalogProductImage>;
  itemTypeId: Scalars['ID']['output'];
  normalizedName: Scalars['String']['output'];
  productCode: Scalars['String']['output'];
  source: Scalars['String']['output'];
  status: Scalars['String']['output'];
  unit: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CatalogProductAttribute = {
  __typename?: 'CatalogProductAttribute';
  attributeName: Scalars['String']['output'];
  attributeValue: Scalars['String']['output'];
  catalogAttributeDefinitionId?: Maybe<Scalars['ID']['output']>;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  productId: Scalars['ID']['output'];
  sortOrder: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CatalogProductImage = {
  __typename?: 'CatalogProductImage';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl: Scalars['String']['output'];
  productId: Scalars['ID']['output'];
  sortOrder: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createCatalogCategory: CatalogCategory;
  createCatalogProduct: CatalogProduct;
  createOrder: Order;
  createReceive: Receive;
  deleteOrder: Scalars['Boolean']['output'];
  deleteReceive: Scalars['Boolean']['output'];
  updateCatalogProduct?: Maybe<CatalogProduct>;
  updateOrder?: Maybe<Order>;
  updateReceive?: Maybe<Receive>;
};


export type MutationCreateCatalogCategoryArgs = {
  displayName: Scalars['String']['input'];
};


export type MutationCreateCatalogProductArgs = {
  attributes?: InputMaybe<Array<CatalogAttributeInput>>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  defaultCurrencyCode?: InputMaybe<Scalars['String']['input']>;
  defaultUnitCost?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  displayName: Scalars['String']['input'];
  images?: InputMaybe<Array<CatalogImageInput>>;
  itemTypeId?: InputMaybe<Scalars['ID']['input']>;
  itemTypeName?: InputMaybe<Scalars['String']['input']>;
  productCode: Scalars['String']['input'];
  status?: InputMaybe<Scalars['String']['input']>;
  unit?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateOrderArgs = {
  approvalTarget?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  expectedArrivalAt?: InputMaybe<Scalars['String']['input']>;
  officeId?: InputMaybe<Scalars['ID']['input']>;
  orderName: Scalars['String']['input'];
  status: Scalars['String']['input'];
  totalCost?: InputMaybe<Scalars['Float']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
  whyOrdered: Scalars['String']['input'];
};


export type MutationCreateReceiveArgs = {
  note?: InputMaybe<Scalars['String']['input']>;
  officeId?: InputMaybe<Scalars['ID']['input']>;
  orderId?: InputMaybe<Scalars['ID']['input']>;
  receivedAt?: InputMaybe<Scalars['String']['input']>;
  receivedByUserId?: InputMaybe<Scalars['ID']['input']>;
  status: Scalars['String']['input'];
};


export type MutationDeleteOrderArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteReceiveArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateCatalogProductArgs = {
  attributes?: InputMaybe<Array<CatalogAttributeInput>>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  defaultCurrencyCode?: InputMaybe<Scalars['String']['input']>;
  defaultUnitCost?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  images?: InputMaybe<Array<CatalogImageInput>>;
  itemTypeId?: InputMaybe<Scalars['ID']['input']>;
  itemTypeName?: InputMaybe<Scalars['String']['input']>;
  productCode?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  unit?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateOrderArgs = {
  approvalTarget?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  expectedArrivalAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  officeId?: InputMaybe<Scalars['ID']['input']>;
  orderName?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  totalCost?: InputMaybe<Scalars['Float']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
  whyOrdered?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateReceiveArgs = {
  id: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  officeId?: InputMaybe<Scalars['ID']['input']>;
  orderId?: InputMaybe<Scalars['ID']['input']>;
  receivedAt?: InputMaybe<Scalars['String']['input']>;
  receivedByUserId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type Order = {
  __typename?: 'Order';
  approvalTarget: Scalars['String']['output'];
  departmentId?: Maybe<Scalars['ID']['output']>;
  expectedArrivalAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  officeId: Scalars['ID']['output'];
  orderName: Scalars['String']['output'];
  status: Scalars['String']['output'];
  totalCost?: Maybe<Scalars['Float']['output']>;
  userId: Scalars['ID']['output'];
  whyOrdered: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  catalogCategories: Array<CatalogCategory>;
  catalogItemTypes: Array<CatalogItemType>;
  catalogProduct?: Maybe<CatalogProduct>;
  catalogProducts: Array<CatalogProduct>;
  order?: Maybe<Order>;
  orders: Array<Order>;
  receive?: Maybe<Receive>;
  receives: Array<Receive>;
};


export type QueryCatalogItemTypesArgs = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryCatalogProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCatalogProductsArgs = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  itemTypeId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryReceiveArgs = {
  id: Scalars['ID']['input'];
};

export type Receive = {
  __typename?: 'Receive';
  id: Scalars['ID']['output'];
  note?: Maybe<Scalars['String']['output']>;
  officeId: Scalars['ID']['output'];
  orderId: Scalars['ID']['output'];
  receivedAt: Scalars['String']['output'];
  receivedByUserId: Scalars['ID']['output'];
  status: Scalars['String']['output'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CatalogAttributeInput: CatalogAttributeInput;
  CatalogCategory: ResolverTypeWrapper<CatalogCategory>;
  CatalogImageInput: CatalogImageInput;
  CatalogItemType: ResolverTypeWrapper<CatalogItemType>;
  CatalogProduct: ResolverTypeWrapper<CatalogProduct>;
  CatalogProductAttribute: ResolverTypeWrapper<CatalogProductAttribute>;
  CatalogProductImage: ResolverTypeWrapper<CatalogProductImage>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Order: ResolverTypeWrapper<Order>;
  Query: ResolverTypeWrapper<{}>;
  Receive: ResolverTypeWrapper<Receive>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  CatalogAttributeInput: CatalogAttributeInput;
  CatalogCategory: CatalogCategory;
  CatalogImageInput: CatalogImageInput;
  CatalogItemType: CatalogItemType;
  CatalogProduct: CatalogProduct;
  CatalogProductAttribute: CatalogProductAttribute;
  CatalogProductImage: CatalogProductImage;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Mutation: {};
  Order: Order;
  Query: {};
  Receive: Receive;
  String: Scalars['String']['output'];
};

export type CatalogCategoryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CatalogCategory'] = ResolversParentTypes['CatalogCategory']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  normalizedName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  source?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CatalogItemTypeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CatalogItemType'] = ResolversParentTypes['CatalogItemType']> = {
  categoryId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  normalizedName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  source?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CatalogProductResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CatalogProduct'] = ResolversParentTypes['CatalogProduct']> = {
  attributes?: Resolver<Array<ResolversTypes['CatalogProductAttribute']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  defaultCurrencyCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  defaultUnitCost?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Array<ResolversTypes['CatalogProductImage']>, ParentType, ContextType>;
  itemTypeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  normalizedName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  productCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  source?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unit?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CatalogProductAttributeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CatalogProductAttribute'] = ResolversParentTypes['CatalogProductAttribute']> = {
  attributeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  attributeValue?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  catalogAttributeDefinitionId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  productId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CatalogProductImageResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['CatalogProductImage'] = ResolversParentTypes['CatalogProductImage']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  productId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sortOrder?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createCatalogCategory?: Resolver<ResolversTypes['CatalogCategory'], ParentType, ContextType, RequireFields<MutationCreateCatalogCategoryArgs, 'displayName'>>;
  createCatalogProduct?: Resolver<ResolversTypes['CatalogProduct'], ParentType, ContextType, RequireFields<MutationCreateCatalogProductArgs, 'displayName' | 'productCode'>>;
  createOrder?: Resolver<ResolversTypes['Order'], ParentType, ContextType, RequireFields<MutationCreateOrderArgs, 'orderName' | 'status' | 'whyOrdered'>>;
  createReceive?: Resolver<ResolversTypes['Receive'], ParentType, ContextType, RequireFields<MutationCreateReceiveArgs, 'status'>>;
  deleteOrder?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteOrderArgs, 'id'>>;
  deleteReceive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteReceiveArgs, 'id'>>;
  updateCatalogProduct?: Resolver<Maybe<ResolversTypes['CatalogProduct']>, ParentType, ContextType, RequireFields<MutationUpdateCatalogProductArgs, 'id'>>;
  updateOrder?: Resolver<Maybe<ResolversTypes['Order']>, ParentType, ContextType, RequireFields<MutationUpdateOrderArgs, 'id'>>;
  updateReceive?: Resolver<Maybe<ResolversTypes['Receive']>, ParentType, ContextType, RequireFields<MutationUpdateReceiveArgs, 'id'>>;
};

export type OrderResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Order'] = ResolversParentTypes['Order']> = {
  approvalTarget?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  departmentId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  expectedArrivalAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  officeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  orderName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalCost?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  whyOrdered?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  catalogCategories?: Resolver<Array<ResolversTypes['CatalogCategory']>, ParentType, ContextType>;
  catalogItemTypes?: Resolver<Array<ResolversTypes['CatalogItemType']>, ParentType, ContextType, Partial<QueryCatalogItemTypesArgs>>;
  catalogProduct?: Resolver<Maybe<ResolversTypes['CatalogProduct']>, ParentType, ContextType, RequireFields<QueryCatalogProductArgs, 'id'>>;
  catalogProducts?: Resolver<Array<ResolversTypes['CatalogProduct']>, ParentType, ContextType, Partial<QueryCatalogProductsArgs>>;
  order?: Resolver<Maybe<ResolversTypes['Order']>, ParentType, ContextType, RequireFields<QueryOrderArgs, 'id'>>;
  orders?: Resolver<Array<ResolversTypes['Order']>, ParentType, ContextType>;
  receive?: Resolver<Maybe<ResolversTypes['Receive']>, ParentType, ContextType, RequireFields<QueryReceiveArgs, 'id'>>;
  receives?: Resolver<Array<ResolversTypes['Receive']>, ParentType, ContextType>;
};

export type ReceiveResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Receive'] = ResolversParentTypes['Receive']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  officeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  orderId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  receivedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  receivedByUserId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  CatalogCategory?: CatalogCategoryResolvers<ContextType>;
  CatalogItemType?: CatalogItemTypeResolvers<ContextType>;
  CatalogProduct?: CatalogProductResolvers<ContextType>;
  CatalogProductAttribute?: CatalogProductAttributeResolvers<ContextType>;
  CatalogProductImage?: CatalogProductImageResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Order?: OrderResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Receive?: ReceiveResolvers<ContextType>;
};

