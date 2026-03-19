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

export type AssetAuditEntry = {
  __typename?: 'AssetAuditEntry';
  assetId: Scalars['ID']['output'];
  date: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  location: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  owner: Scalars['String']['output'];
  status: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type AssetLabelPdf = {
  __typename?: 'AssetLabelPdf';
  assetCount: Scalars['Int']['output'];
  base64: Scalars['String']['output'];
  contentType: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
};

export type AssignmentAcknowledgmentPdf = {
  __typename?: 'AssignmentAcknowledgmentPdf';
  base64: Scalars['String']['output'];
  contentType: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
};

export type AssignmentAcknowledgmentPreview = {
  __typename?: 'AssignmentAcknowledgmentPreview';
  acknowledgmentId: Scalars['ID']['output'];
  assetCode: Scalars['String']['output'];
  assetId: Scalars['ID']['output'];
  assetName: Scalars['String']['output'];
  assignmentRequestId: Scalars['ID']['output'];
  category: Scalars['String']['output'];
  employeeEmail: Scalars['String']['output'];
  employeeId: Scalars['ID']['output'];
  employeeName: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  recipientRole: Scalars['String']['output'];
  signedAt?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  tokenConsumedAt?: Maybe<Scalars['String']['output']>;
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

export type DistributionRecord = {
  __typename?: 'DistributionRecord';
  assetCode: Scalars['String']['output'];
  assetId: Scalars['ID']['output'];
  assetName: Scalars['String']['output'];
  assetStatus: Scalars['String']['output'];
  assignmentRequestId?: Maybe<Scalars['ID']['output']>;
  category: Scalars['String']['output'];
  conditionStatus: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  currentStorageId?: Maybe<Scalars['ID']['output']>;
  currentStorageName?: Maybe<Scalars['String']['output']>;
  distributedAt: Scalars['String']['output'];
  distributedByUserId: Scalars['ID']['output'];
  employeeId: Scalars['ID']['output'];
  employeeName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  itemType: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  recipientRole: Scalars['String']['output'];
  returnCondition?: Maybe<Scalars['String']['output']>;
  returnPower?: Maybe<Scalars['String']['output']>;
  returnedAt?: Maybe<Scalars['String']['output']>;
  serialNumber?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  usageYears?: Maybe<Scalars['String']['output']>;
};

export type EmployeeDirectoryEntry = {
  __typename?: 'EmployeeDirectoryEntry';
  email: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  position: Scalars['String']['output'];
  role: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  assignAssetDistribution: DistributionRecord;
  createAssetAudit: Array<AssetAuditEntry>;
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
  returnAssetDistribution: DistributionRecord;
  sendDistributionNotification: Scalars['Boolean']['output'];
  signAssignmentAcknowledgment: SignAssignmentAcknowledgmentResult;
  terminateEmployeeAssets: TerminationResult;
  updateCatalogProduct?: Maybe<CatalogProduct>;
  updateOrder?: Maybe<Order>;
  updateReceive?: Maybe<Receive>;
  updateStorageAsset: StorageAsset;
};


export type MutationAssignAssetDistributionArgs = {
  assetId: Scalars['ID']['input'];
  employeeName: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  recipientRole?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateAssetAuditArgs = {
  assetIds: Array<Scalars['ID']['input']>;
  assetStatus?: InputMaybe<Scalars['String']['input']>;
  conditionStatus?: InputMaybe<Scalars['String']['input']>;
  confirmedLocation?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
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
  assetImageDataUrl?: InputMaybe<Scalars['String']['input']>;
  assetImageFileName?: InputMaybe<Scalars['String']['input']>;
  catalogId?: InputMaybe<Scalars['ID']['input']>;
  itemCode: Scalars['String']['input'];
  officeId?: InputMaybe<Scalars['ID']['input']>;
  orderId: Scalars['ID']['input'];
  orderItemId?: InputMaybe<Scalars['ID']['input']>;
  quantityReceived: Scalars['Int']['input'];
  receivedAt?: InputMaybe<Scalars['String']['input']>;
  receivedByUserId?: InputMaybe<Scalars['ID']['input']>;
  receivedCondition: Scalars['String']['input'];
  receivedNote?: InputMaybe<Scalars['String']['input']>;
  serialNumbers?: InputMaybe<Array<Scalars['String']['input']>>;
  storageLocation?: InputMaybe<Scalars['String']['input']>;
};


export type MutationReturnAssetDistributionArgs = {
  distributionId: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  returnCondition?: InputMaybe<Scalars['String']['input']>;
  returnPower?: InputMaybe<Scalars['String']['input']>;
  storageLocation?: InputMaybe<Scalars['String']['input']>;
  usageYears?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSendDistributionNotificationArgs = {
  distributionId: Scalars['ID']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSignAssignmentAcknowledgmentArgs = {
  signatureText: Scalars['String']['input'];
  signerName: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationTerminateEmployeeAssetsArgs = {
  employeeId: Scalars['ID']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
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
  assetAuditHistory: Array<AssetAuditEntry>;
  assetDistributions: Array<DistributionRecord>;
  assetLabelPdf: AssetLabelPdf;
  assignmentAcknowledgment: AssignmentAcknowledgmentPreview;
  assignmentAcknowledgmentPdf: AssignmentAcknowledgmentPdf;
  catalogCategories: Array<CatalogCategory>;
  catalogItemTypes: Array<CatalogItemType>;
  catalogProduct?: Maybe<CatalogProduct>;
  catalogProducts: Array<CatalogProduct>;
  employeeDirectory: Array<EmployeeDirectoryEntry>;
  notifications: Array<Notification>;
  order?: Maybe<Order>;
  orders: Array<Order>;
  receive?: Maybe<Receive>;
  receives: Array<Receive>;
  storageAssets: Array<StorageAsset>;
  storageLocations: Array<Scalars['String']['output']>;
};


export type QueryAssetArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  qrCode?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAssetAuditHistoryArgs = {
  assetId: Scalars['ID']['input'];
};


export type QueryAssetDistributionsArgs = {
  includeReturned?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryAssetLabelPdfArgs = {
  assetCodes: Array<Scalars['String']['input']>;
};


export type QueryAssignmentAcknowledgmentArgs = {
  token: Scalars['String']['input'];
};


export type QueryAssignmentAcknowledgmentPdfArgs = {
  token: Scalars['String']['input'];
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


export type QueryEmployeeDirectoryArgs = {
  activeOnly?: InputMaybe<Scalars['Boolean']['input']>;
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

export type SignAssignmentAcknowledgmentResult = {
  __typename?: 'SignAssignmentAcknowledgmentResult';
  acknowledgmentId: Scalars['ID']['output'];
  distribution: DistributionRecord;
  pdfBase64: Scalars['String']['output'];
  pdfContentType: Scalars['String']['output'];
  pdfFileName?: Maybe<Scalars['String']['output']>;
  pdfObjectKey?: Maybe<Scalars['String']['output']>;
  signedAt?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
};

export type StorageAsset = {
  __typename?: 'StorageAsset';
  assetCode: Scalars['String']['output'];
  assetImageDataUrl?: Maybe<Scalars['String']['output']>;
  assetName: Scalars['String']['output'];
  assetStatus: Scalars['String']['output'];
  assignedEmployeeName?: Maybe<Scalars['String']['output']>;
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

export type TerminationResult = {
  __typename?: 'TerminationResult';
  emailError?: Maybe<Scalars['String']['output']>;
  emailStatus: Scalars['String']['output'];
  employeeId: Scalars['ID']['output'];
  employeeName: Scalars['String']['output'];
  employeeNotified: Scalars['Boolean']['output'];
  hrNotifiedCount: Scalars['Int']['output'];
  pendingAssetCount: Scalars['Int']['output'];
  pendingAssets: Array<DistributionRecord>;
  terminatedAt: Scalars['String']['output'];
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
  AssetAuditEntry: ResolverTypeWrapper<AssetAuditEntry>;
  AssetLabelPdf: ResolverTypeWrapper<AssetLabelPdf>;
  AssignmentAcknowledgmentPdf: ResolverTypeWrapper<AssignmentAcknowledgmentPdf>;
  AssignmentAcknowledgmentPreview: ResolverTypeWrapper<AssignmentAcknowledgmentPreview>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CatalogAttributeInput: CatalogAttributeInput;
  CatalogCategory: ResolverTypeWrapper<CatalogCategory>;
  CatalogImageInput: CatalogImageInput;
  CatalogItemType: ResolverTypeWrapper<CatalogItemType>;
  CatalogProduct: ResolverTypeWrapper<CatalogProduct>;
  CatalogProductAttribute: ResolverTypeWrapper<CatalogProductAttribute>;
  CatalogProductImage: ResolverTypeWrapper<CatalogProductImage>;
  DistributionRecord: ResolverTypeWrapper<DistributionRecord>;
  EmployeeDirectoryEntry: ResolverTypeWrapper<EmployeeDirectoryEntry>;
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
  SignAssignmentAcknowledgmentResult: ResolverTypeWrapper<SignAssignmentAcknowledgmentResult>;
  StorageAsset: ResolverTypeWrapper<StorageAsset>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  TerminationResult: ResolverTypeWrapper<TerminationResult>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AssetAuditEntry: AssetAuditEntry;
  AssetLabelPdf: AssetLabelPdf;
  AssignmentAcknowledgmentPdf: AssignmentAcknowledgmentPdf;
  AssignmentAcknowledgmentPreview: AssignmentAcknowledgmentPreview;
  Boolean: Scalars['Boolean']['output'];
  CatalogAttributeInput: CatalogAttributeInput;
  CatalogCategory: CatalogCategory;
  CatalogImageInput: CatalogImageInput;
  CatalogItemType: CatalogItemType;
  CatalogProduct: CatalogProduct;
  CatalogProductAttribute: CatalogProductAttribute;
  CatalogProductImage: CatalogProductImage;
  DistributionRecord: DistributionRecord;
  EmployeeDirectoryEntry: EmployeeDirectoryEntry;
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
  SignAssignmentAcknowledgmentResult: SignAssignmentAcknowledgmentResult;
  StorageAsset: StorageAsset;
  String: Scalars['String']['output'];
  TerminationResult: TerminationResult;
};

export type AssetAuditEntryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssetAuditEntry'] = ResolversParentTypes['AssetAuditEntry']> = {
  assetId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  date?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AssetLabelPdfResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssetLabelPdf'] = ResolversParentTypes['AssetLabelPdf']> = {
  assetCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  base64?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contentType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fileName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AssignmentAcknowledgmentPdfResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssignmentAcknowledgmentPdf'] = ResolversParentTypes['AssignmentAcknowledgmentPdf']> = {
  base64?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contentType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fileName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AssignmentAcknowledgmentPreviewResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AssignmentAcknowledgmentPreview'] = ResolversParentTypes['AssignmentAcknowledgmentPreview']> = {
  acknowledgmentId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  assetCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assetId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  assetName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assignmentRequestId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  employeeEmail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  employeeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  employeeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  recipientRole?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  signedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tokenConsumedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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

export type DistributionRecordResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['DistributionRecord'] = ResolversParentTypes['DistributionRecord']> = {
  assetCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assetId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  assetName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assetStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assignmentRequestId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  category?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  conditionStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currentStorageId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  currentStorageName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  distributedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  distributedByUserId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  employeeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  employeeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  itemType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recipientRole?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  returnCondition?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  returnPower?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  returnedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  serialNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  usageYears?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmployeeDirectoryEntryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['EmployeeDirectoryEntry'] = ResolversParentTypes['EmployeeDirectoryEntry']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fullName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  position?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  assignAssetDistribution?: Resolver<ResolversTypes['DistributionRecord'], ParentType, ContextType, RequireFields<MutationAssignAssetDistributionArgs, 'assetId' | 'employeeName'>>;
  createAssetAudit?: Resolver<Array<ResolversTypes['AssetAuditEntry']>, ParentType, ContextType, RequireFields<MutationCreateAssetAuditArgs, 'assetIds'>>;
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
  returnAssetDistribution?: Resolver<ResolversTypes['DistributionRecord'], ParentType, ContextType, RequireFields<MutationReturnAssetDistributionArgs, 'distributionId'>>;
  sendDistributionNotification?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSendDistributionNotificationArgs, 'distributionId'>>;
  signAssignmentAcknowledgment?: Resolver<ResolversTypes['SignAssignmentAcknowledgmentResult'], ParentType, ContextType, RequireFields<MutationSignAssignmentAcknowledgmentArgs, 'signatureText' | 'signerName' | 'token'>>;
  terminateEmployeeAssets?: Resolver<ResolversTypes['TerminationResult'], ParentType, ContextType, RequireFields<MutationTerminateEmployeeAssetsArgs, 'employeeId'>>;
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
  assetAuditHistory?: Resolver<Array<ResolversTypes['AssetAuditEntry']>, ParentType, ContextType, RequireFields<QueryAssetAuditHistoryArgs, 'assetId'>>;
  assetDistributions?: Resolver<Array<ResolversTypes['DistributionRecord']>, ParentType, ContextType, Partial<QueryAssetDistributionsArgs>>;
  assetLabelPdf?: Resolver<ResolversTypes['AssetLabelPdf'], ParentType, ContextType, RequireFields<QueryAssetLabelPdfArgs, 'assetCodes'>>;
  assignmentAcknowledgment?: Resolver<ResolversTypes['AssignmentAcknowledgmentPreview'], ParentType, ContextType, RequireFields<QueryAssignmentAcknowledgmentArgs, 'token'>>;
  assignmentAcknowledgmentPdf?: Resolver<ResolversTypes['AssignmentAcknowledgmentPdf'], ParentType, ContextType, RequireFields<QueryAssignmentAcknowledgmentPdfArgs, 'token'>>;
  catalogCategories?: Resolver<Array<ResolversTypes['CatalogCategory']>, ParentType, ContextType>;
  catalogItemTypes?: Resolver<Array<ResolversTypes['CatalogItemType']>, ParentType, ContextType, Partial<QueryCatalogItemTypesArgs>>;
  catalogProduct?: Resolver<Maybe<ResolversTypes['CatalogProduct']>, ParentType, ContextType, RequireFields<QueryCatalogProductArgs, 'id'>>;
  catalogProducts?: Resolver<Array<ResolversTypes['CatalogProduct']>, ParentType, ContextType, Partial<QueryCatalogProductsArgs>>;
  employeeDirectory?: Resolver<Array<ResolversTypes['EmployeeDirectoryEntry']>, ParentType, ContextType, Partial<QueryEmployeeDirectoryArgs>>;
  notifications?: Resolver<Array<ResolversTypes['Notification']>, ParentType, ContextType, Partial<QueryNotificationsArgs>>;
  order?: Resolver<Maybe<ResolversTypes['Order']>, ParentType, ContextType, RequireFields<QueryOrderArgs, 'id'>>;
  orders?: Resolver<Array<ResolversTypes['Order']>, ParentType, ContextType>;
  receive?: Resolver<Maybe<ResolversTypes['Receive']>, ParentType, ContextType, RequireFields<QueryReceiveArgs, 'id'>>;
  receives?: Resolver<Array<ResolversTypes['Receive']>, ParentType, ContextType>;
  storageAssets?: Resolver<Array<ResolversTypes['StorageAsset']>, ParentType, ContextType>;
  storageLocations?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
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

export type SignAssignmentAcknowledgmentResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SignAssignmentAcknowledgmentResult'] = ResolversParentTypes['SignAssignmentAcknowledgmentResult']> = {
  acknowledgmentId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  distribution?: Resolver<ResolversTypes['DistributionRecord'], ParentType, ContextType>;
  pdfBase64?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pdfContentType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pdfFileName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pdfObjectKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  signedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StorageAssetResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['StorageAsset'] = ResolversParentTypes['StorageAsset']> = {
  assetCode?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assetImageDataUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  assetName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assetStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  assignedEmployeeName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
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

export type TerminationResultResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TerminationResult'] = ResolversParentTypes['TerminationResult']> = {
  emailError?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailStatus?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  employeeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  employeeName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  employeeNotified?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hrNotifiedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pendingAssetCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  pendingAssets?: Resolver<Array<ResolversTypes['DistributionRecord']>, ParentType, ContextType>;
  terminatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  AssetAuditEntry?: AssetAuditEntryResolvers<ContextType>;
  AssetLabelPdf?: AssetLabelPdfResolvers<ContextType>;
  AssignmentAcknowledgmentPdf?: AssignmentAcknowledgmentPdfResolvers<ContextType>;
  AssignmentAcknowledgmentPreview?: AssignmentAcknowledgmentPreviewResolvers<ContextType>;
  CatalogCategory?: CatalogCategoryResolvers<ContextType>;
  CatalogItemType?: CatalogItemTypeResolvers<ContextType>;
  CatalogProduct?: CatalogProductResolvers<ContextType>;
  CatalogProductAttribute?: CatalogProductAttributeResolvers<ContextType>;
  CatalogProductImage?: CatalogProductImageResolvers<ContextType>;
  DistributionRecord?: DistributionRecordResolvers<ContextType>;
  EmployeeDirectoryEntry?: EmployeeDirectoryEntryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Notification?: NotificationResolvers<ContextType>;
  Order?: OrderResolvers<ContextType>;
  OrderItem?: OrderItemResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Receive?: ReceiveResolvers<ContextType>;
  ReceiveOrderItemPayload?: ReceiveOrderItemPayloadResolvers<ContextType>;
  ReceivedAsset?: ReceivedAssetResolvers<ContextType>;
  SignAssignmentAcknowledgmentResult?: SignAssignmentAcknowledgmentResultResolvers<ContextType>;
  StorageAsset?: StorageAssetResolvers<ContextType>;
  TerminationResult?: TerminationResultResolvers<ContextType>;
};

