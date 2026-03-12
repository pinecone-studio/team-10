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

export type Mutation = {
  __typename?: 'Mutation';
  createOrder: Order;
  createReceive: Receive;
  deleteOrder: Scalars['Boolean']['output'];
  deleteReceive: Scalars['Boolean']['output'];
  updateOrder?: Maybe<Order>;
  updateReceive?: Maybe<Receive>;
};


export type MutationCreateOrderArgs = {
  approvalTarget?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  expectedArrivalAt?: InputMaybe<Scalars['String']['input']>;
  officeId?: InputMaybe<Scalars['ID']['input']>;
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


export type MutationUpdateOrderArgs = {
  approvalTarget?: InputMaybe<Scalars['String']['input']>;
  departmentId?: InputMaybe<Scalars['ID']['input']>;
  expectedArrivalAt?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  officeId?: InputMaybe<Scalars['ID']['input']>;
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
  status: Scalars['String']['output'];
  totalCost?: Maybe<Scalars['Float']['output']>;
  userId: Scalars['ID']['output'];
  whyOrdered: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  order?: Maybe<Order>;
  orders: Array<Order>;
  receive?: Maybe<Receive>;
  receives: Array<Receive>;
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
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  Order: ResolverTypeWrapper<Order>;
  Query: ResolverTypeWrapper<{}>;
  Receive: ResolverTypeWrapper<Receive>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean']['output'];
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Mutation: {};
  Order: Order;
  Query: {};
  Receive: Receive;
  String: Scalars['String']['output'];
};

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createOrder?: Resolver<ResolversTypes['Order'], ParentType, ContextType, RequireFields<MutationCreateOrderArgs, 'status' | 'whyOrdered'>>;
  createReceive?: Resolver<ResolversTypes['Receive'], ParentType, ContextType, RequireFields<MutationCreateReceiveArgs, 'status'>>;
  deleteOrder?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteOrderArgs, 'id'>>;
  deleteReceive?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteReceiveArgs, 'id'>>;
  updateOrder?: Resolver<Maybe<ResolversTypes['Order']>, ParentType, ContextType, RequireFields<MutationUpdateOrderArgs, 'id'>>;
  updateReceive?: Resolver<Maybe<ResolversTypes['Receive']>, ParentType, ContextType, RequireFields<MutationUpdateReceiveArgs, 'id'>>;
};

export type OrderResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Order'] = ResolversParentTypes['Order']> = {
  approvalTarget?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  departmentId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  expectedArrivalAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  officeId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  totalCost?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  whyOrdered?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
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
  Mutation?: MutationResolvers<ContextType>;
  Order?: OrderResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Receive?: ReceiveResolvers<ContextType>;
};

