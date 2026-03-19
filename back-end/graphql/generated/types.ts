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
  deleteCatalogCategory: Scalars['Boolean']['output'];
  deleteOrder: Scalars['Boolean']['output'];
  deleteReceive: Scalars['Boolean']['output'];
  markAllNotificationsAsRead: Scalars['Boolean']['output'];
  markNotificationAsRead?: Maybe<Notification>;
  receiveOrderItem: ReceiveOrderItemPayload;
  updateCatalogProduct?: Maybe<CatalogProduct>;
  updateOrder?: Maybe<Order>;
  updateReceive?: Maybe<Receive>;
  updateStorageAsset: StorageAsset;
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
  approvalMessage?: InputMaybe<Scalars['String']['input']>;
  approvalTarget?: InputMaybe<Scalars['String']['input']>;
  deliveryDate?: InputMaybe<Scalars['String']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  items?: InputMaybe<Array<OrderItemInput>>;
  officeId?: InputMaybe<Scalars['ID']['input']>;
  orderName: Scalars['String']['input'];
  requestDate?: InputMaybe<Scalars['String']['input']>;
  requestNumber?: InputMaybe<Scalars['String']['input']>;
  requestedApproverId?: InputMaybe<Scalars['String']['input']>;
  requestedApproverName?: InputMaybe<Scalars['String']['input']>;
  requestedApproverRole?: InputMaybe<Scalars['String']['input']>;
  requester?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  totalAmount?: InputMaybe<Scalars['Float']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
  whyOrdered?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateReceiveArgs = {
  conditionStatus: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['ID']['input'];
  orderItemId: Scalars['ID']['input'];
  quantityReceived: Scalars['Int']['input'];
  receivedAt?: InputMaybe<Scalars['String']['input']>;
  receivedCondition?: InputMaybe<Scalars['String']['input']>;
  serialNumbers?: InputMaybe<Array<Scalars['String']['input']>>;
  storageLocation?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteCatalogCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOrderArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteReceiveArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkAllNotificationsAsReadArgs = {
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationMarkNotificationAsReadArgs = {
  id: Scalars['ID']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationReceiveOrderItemArgs = {
  catalogId?: InputMaybe<Scalars['ID']['input']>;
  itemCode: Scalars['String']['input'];
  officeId?: InputMaybe<Scalars['ID']['input']>;
  orderId: Scalars['ID']['input'];
  quantityReceived: Scalars['Int']['input'];
  receivedAt?: InputMaybe<Scalars['String']['input']>;
  receivedByUserId?: InputMaybe<Scalars['ID']['input']>;
  receivedCondition: Scalars['String']['input'];
  receivedNote?: InputMaybe<Scalars['String']['input']>;
  serialNumbers?: InputMaybe<Array<Scalars['String']['input']>>;
  storageLocation?: InputMaybe<Scalars['String']['input']>;
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
  approvalMessage?: InputMaybe<Scalars['String']['input']>;
  approvalTarget?: InputMaybe<Scalars['String']['input']>;
  assignedAt?: InputMaybe<Scalars['String']['input']>;
  assignedRole?: InputMaybe<Scalars['String']['input']>;
  assignedTo?: InputMaybe<Scalars['String']['input']>;
  deliveryDate?: InputMaybe<Scalars['String']['input']>;
  department?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  financeNote?: InputMaybe<Scalars['String']['input']>;
  financeReviewedAt?: InputMaybe<Scalars['String']['input']>;
  financeReviewer?: InputMaybe<Scalars['String']['input']>;
  higherUpNote?: InputMaybe<Scalars['String']['input']>;
  higherUpReviewedAt?: InputMaybe<Scalars['String']['input']>;
  higherUpReviewer?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  items?: InputMaybe<Array<OrderItemInput>>;
  officeId?: InputMaybe<Scalars['ID']['input']>;
  orderName?: InputMaybe<Scalars['String']['input']>;
  receivedAt?: InputMaybe<Scalars['String']['input']>;
  receivedCondition?: InputMaybe<Scalars['String']['input']>;
  receivedNote?: InputMaybe<Scalars['String']['input']>;
  requestDate?: InputMaybe<Scalars['String']['input']>;
  requestNumber?: InputMaybe<Scalars['String']['input']>;
  requestedApproverId?: InputMaybe<Scalars['String']['input']>;
  requestedApproverName?: InputMaybe<Scalars['String']['input']>;
  requestedApproverRole?: InputMaybe<Scalars['String']['input']>;
  requester?: InputMaybe<Scalars['String']['input']>;
  serialNumbers?: InputMaybe<Array<Scalars['String']['input']>>;
  status?: InputMaybe<Scalars['String']['input']>;
  storageLocation?: InputMaybe<Scalars['String']['input']>;
  totalAmount?: InputMaybe<Scalars['Float']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
  whyOrdered?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateReceiveArgs = {
  conditionStatus?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  orderId?: InputMaybe<Scalars['ID']['input']>;
  orderItemId?: InputMaybe<Scalars['ID']['input']>;
  quantityReceived?: InputMaybe<Scalars['Int']['input']>;
  receivedAt?: InputMaybe<Scalars['String']['input']>;
  receivedCondition?: InputMaybe<Scalars['String']['input']>;
  serialNumbers?: InputMaybe<Array<Scalars['String']['input']>>;
  storageLocation?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateStorageAssetArgs = {
  assetStatus?: InputMaybe<Scalars['String']['input']>;
  conditionStatus?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};

export type Notification = {
  __typename?: 'Notification';
  createdAt: Scalars['String']['output'];
  entityId?: Maybe<Scalars['String']['output']>;
  entityType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  orderId: Scalars['ID']['output'];
  readAt?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type Order = {
  __typename?: 'Order';
  approvalMessage: Scalars['String']['output'];
  approvalTarget: Scalars['String']['output'];
  assignedAt?: Maybe<Scalars['String']['output']>;
  assignedRole?: Maybe<Scalars['String']['output']>;
  assignedTo?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  currencyCode: Scalars['String']['output'];
  deliveryDate: Scalars['String']['output'];
  department: Scalars['String']['output'];
  departmentId?: Maybe<Scalars['ID']['output']>;
  expectedArrivalAt?: Maybe<Scalars['String']['output']>;
  financeNote: Scalars['String']['output'];
  financeReviewedAt?: Maybe<Scalars['String']['output']>;
  financeReviewer?: Maybe<Scalars['String']['output']>;
  higherUpNote: Scalars['String']['output'];
  higherUpReviewedAt?: Maybe<Scalars['String']['output']>;
  higherUpReviewer?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  items: Array<OrderItem>;
  officeId: Scalars['ID']['output'];
  orderName: Scalars['String']['output'];
  receivedAt?: Maybe<Scalars['String']['output']>;
  receivedCondition?: Maybe<Scalars['String']['output']>;
  receivedNote: Scalars['String']['output'];
  requestDate: Scalars['String']['output'];
  requestNumber: Scalars['String']['output'];
  requestedApproverId?: Maybe<Scalars['String']['output']>;
  requestedApproverName?: Maybe<Scalars['String']['output']>;
  requestedApproverRole?: Maybe<Scalars['String']['output']>;
  requester: Scalars['String']['output'];
  serialNumbers: Array<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  storageLocation: Scalars['String']['output'];
  totalAmount: Scalars['Float']['output'];
  totalCost?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
  whyOrdered: Scalars['String']['output'];
};

export type OrderItem = {
  __typename?: 'OrderItem';
  catalogId: Scalars['ID']['output'];
  code: Scalars['String']['output'];
  currencyCode: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  totalPrice: Scalars['Float']['output'];
  unit: Scalars['String']['output'];
  unitPrice: Scalars['Float']['output'];
};

export type OrderItemInput = {
  additionalNotes?: InputMaybe<Scalars['String']['input']>;
  catalogId?: InputMaybe<Scalars['ID']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  code: Scalars['String']['input'];
  eta?: InputMaybe<Scalars['String']['input']>;
  fromWhere?: InputMaybe<Scalars['String']['input']>;
  itemType?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  quantity: Scalars['Int']['input'];
  unit?: InputMaybe<Scalars['String']['input']>;
  unitPrice: Scalars['Float']['input'];
};

export type Query = {
  __typename?: 'Query';
  asset?: Maybe<StorageAsset>;
  catalogCategories: Array<CatalogCategory>;
  catalogItemTypes: Array<CatalogItemType>;
  catalogProduct?: Maybe<CatalogProduct>;
  catalogProducts: Array<CatalogProduct>;
  notifications: Array<Notification>;
  order?: Maybe<Order>;
  orders: Array<Order>;
  receive?: Maybe<Receive>;
  receives: Array<Receive>;
  storageAssets: Array<StorageAsset>;
};


export type QueryAssetArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  qrCode?: InputMaybe<Scalars['String']['input']>;
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


export type QueryNotificationsArgs = {
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryReceiveArgs = {
  id: Scalars['ID']['input'];
};

export type Receive = {
  __typename?: 'Receive';
  conditionStatus: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  note?: Maybe<Scalars['String']['output']>;
  officeId: Scalars['ID']['output'];
  orderId: Scalars['ID']['output'];
  orderItemId: Scalars['ID']['output'];
  quantityReceived: Scalars['Int']['output'];
  receivedAt: Scalars['String']['output'];
  receivedByUserId: Scalars['ID']['output'];
  receivedCondition?: Maybe<Scalars['String']['output']>;
  serialNumbers: Array<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  storageLocation?: Maybe<Scalars['String']['output']>;
};

export type ReceiveOrderItemPayload = {
  __typename?: 'ReceiveOrderItemPayload';
  assets: Array<ReceivedAsset>;
  order: Order;
  receive: Receive;
};

export type ReceivedAsset = {
  __typename?: 'ReceivedAsset';
  assetCode: Scalars['String']['output'];
  assetName: Scalars['String']['output'];
  assetStatus: Scalars['String']['output'];
  conditionStatus: Scalars['String']['output'];
  currentStorageId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  qrCode: Scalars['String']['output'];
  serialNumber?: Maybe<Scalars['String']['output']>;
};

export type StorageAsset = {
  __typename?: 'StorageAsset';
  assetCode: Scalars['String']['output'];
  assetName: Scalars['String']['output'];
  assetStatus: Scalars['String']['output'];
  category: Scalars['String']['output'];
  conditionStatus: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  currencyCode: Scalars['String']['output'];
  department: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  itemType: Scalars['String']['output'];
  orderId: Scalars['ID']['output'];
  qrCode: Scalars['String']['output'];
  receiveNote?: Maybe<Scalars['String']['output']>;
  receivedAt: Scalars['String']['output'];
  requestDate: Scalars['String']['output'];
  requestNumber: Scalars['String']['output'];
  requester: Scalars['String']['output'];
  serialNumber?: Maybe<Scalars['String']['output']>;
  storageId?: Maybe<Scalars['ID']['output']>;
  storageName: Scalars['String']['output'];
  storageType?: Maybe<Scalars['String']['output']>;
  unitCost?: Maybe<Scalars['Float']['output']>;
  updatedAt: Scalars['String']['output'];
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
  Notification: ResolverTypeWrapper<Notification>;
  Order: ResolverTypeWrapper<Order>;
  OrderItem: ResolverTypeWrapper<OrderItem>;
  OrderItemInput: OrderItemInput;
  Query: ResolverTypeWrapper<{}>;
  Receive: ResolverTypeWrapper<Receive>;
  ReceiveOrderItemPayload: ResolverTypeWrapper<ReceiveOrderItemPayload>;
  ReceivedAsset: ResolverTypeWrapper<ReceivedAsset>;
  StorageAsset: ResolverTypeWrapper<StorageAsset>;
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
  Notification: Notification;
  Order: Order;
  OrderItem: OrderItem;
  OrderItemInput: OrderItemInput;
  Query: {};
  Receive: Receive;
  ReceiveOrderItemPayload: ReceiveOrderItemPayload;
  ReceivedAsset: ReceivedAsset;
  StorageAsset: StorageAsset;
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
  createOrder?: Resolver<ResolversTypes['Order'], ParentType, ContextType, RequireFields<MutationCreateOrderArgs, 'orderName'>>;
  createReceive?: Resolver<ResolversTypes['Receive'], ParentType, ContextType, RequireFields<MutationCreateReceiveArgs, 'conditionStatus' | 'orderId' | 'orderItemId' | 'quantityReceived'>>;
  deleteCatalogCategory?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteCatalogCategoryArgs, 'id'>>;
  deleteOrder?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteOrderArgs, 'id'>>;
  deleteReceive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteReceiveArgs, 'id'>>;
  markAllNotificationsAsRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, Partial<MutationMarkAllNotificationsAsReadArgs>>;
  markNotificationAsRead?: Resolver<Maybe<ResolversTypes['Notification']>, ParentType, ContextType, RequireFields<MutationMarkNotificationAsReadArgs, 'id'>>;
  receiveOrderItem?: Resolver<ResolversTypes['ReceiveOrderItemPayload'], ParentType, ContextType, RequireFields<MutationReceiveOrderItemArgs, 'itemCode' | 'orderId' | 'quantityReceived' | 'receivedCondition'>>;
  updateCatalogProduct?: Resolver<Maybe<ResolversTypes['CatalogProduct']>, ParentType, ContextType, RequireFields<MutationUpdateCatalogProductArgs, 'id'>>;
  updateOrder?: Resolver<Maybe<ResolversTypes['Order']>, ParentType, ContextType, RequireFields<MutationUpdateOrderArgs, 'id'>>;
  updateReceive?: Resolver<Maybe<ResolversTypes['Receive']>, ParentType, ContextType, RequireFields<MutationUpdateReceiveArgs, 'id'>>;
  updateStorageAsset?: Resolver<ResolversTypes['StorageAsset'], ParentType, ContextType, RequireFields<MutationUpdateStorageAssetArgs, 'id'>>;
};

export type NotificationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Notification'] = ResolversParentTypes['Notification']> = {
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  entityId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  entityType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isRead?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orderId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  readAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrderResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Order'] = ResolversParentTypes['Order']> = {
  approvalMessage?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  approvalTarget?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assignedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  assignedRole?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  assignedTo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currencyCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  deliveryDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  department?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  departmentId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  expectedArrivalAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  financeNote?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  financeReviewedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  financeReviewer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  higherUpNote?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  higherUpReviewedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  higherUpReviewer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['OrderItem']>, ParentType, ContextType>;
  officeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  orderName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  receivedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receivedCondition?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receivedNote?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requestDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requestNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requestedApproverId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requestedApproverName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requestedApproverRole?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requester?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  serialNumbers?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  storageLocation?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  totalCost?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  whyOrdered?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OrderItemResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['OrderItem'] = ResolversParentTypes['OrderItem']> = {
  catalogId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currencyCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPrice?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  unit?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unitPrice?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  asset?: Resolver<Maybe<ResolversTypes['StorageAsset']>, ParentType, ContextType, Partial<QueryAssetArgs>>;
  catalogCategories?: Resolver<Array<ResolversTypes['CatalogCategory']>, ParentType, ContextType>;
  catalogItemTypes?: Resolver<Array<ResolversTypes['CatalogItemType']>, ParentType, ContextType, Partial<QueryCatalogItemTypesArgs>>;
  catalogProduct?: Resolver<Maybe<ResolversTypes['CatalogProduct']>, ParentType, ContextType, RequireFields<QueryCatalogProductArgs, 'id'>>;
  catalogProducts?: Resolver<Array<ResolversTypes['CatalogProduct']>, ParentType, ContextType, Partial<QueryCatalogProductsArgs>>;
  notifications?: Resolver<Array<ResolversTypes['Notification']>, ParentType, ContextType, Partial<QueryNotificationsArgs>>;
  order?: Resolver<Maybe<ResolversTypes['Order']>, ParentType, ContextType, RequireFields<QueryOrderArgs, 'id'>>;
  orders?: Resolver<Array<ResolversTypes['Order']>, ParentType, ContextType>;
  receive?: Resolver<Maybe<ResolversTypes['Receive']>, ParentType, ContextType, RequireFields<QueryReceiveArgs, 'id'>>;
  receives?: Resolver<Array<ResolversTypes['Receive']>, ParentType, ContextType>;
  storageAssets?: Resolver<Array<ResolversTypes['StorageAsset']>, ParentType, ContextType>;
};

export type ReceiveResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Receive'] = ResolversParentTypes['Receive']> = {
  conditionStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  officeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  orderId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  orderItemId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  quantityReceived?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  receivedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  receivedByUserId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  receivedCondition?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  serialNumbers?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  storageLocation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReceiveOrderItemPayloadResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ReceiveOrderItemPayload'] = ResolversParentTypes['ReceiveOrderItemPayload']> = {
  assets?: Resolver<Array<ResolversTypes['ReceivedAsset']>, ParentType, ContextType>;
  order?: Resolver<ResolversTypes['Order'], ParentType, ContextType>;
  receive?: Resolver<ResolversTypes['Receive'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReceivedAssetResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ReceivedAsset'] = ResolversParentTypes['ReceivedAsset']> = {
  assetCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assetName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assetStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  conditionStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currentStorageId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  qrCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  serialNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StorageAssetResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['StorageAsset'] = ResolversParentTypes['StorageAsset']> = {
  assetCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assetName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assetStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  conditionStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currencyCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  department?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  itemType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  orderId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  qrCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  receiveNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  receivedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requestDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requestNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  requester?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  serialNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  storageId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  storageName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  storageType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unitCost?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  CatalogCategory?: CatalogCategoryResolvers<ContextType>;
  CatalogItemType?: CatalogItemTypeResolvers<ContextType>;
  CatalogProduct?: CatalogProductResolvers<ContextType>;
  CatalogProductAttribute?: CatalogProductAttributeResolvers<ContextType>;
  CatalogProductImage?: CatalogProductImageResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  Order?: OrderResolvers<ContextType>;
  OrderItem?: OrderItemResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Receive?: ReceiveResolvers<ContextType>;
  ReceiveOrderItemPayload?: ReceiveOrderItemPayloadResolvers<ContextType>;
  ReceivedAsset?: ReceivedAssetResolvers<ContextType>;
  StorageAsset?: StorageAssetResolvers<ContextType>;
};

