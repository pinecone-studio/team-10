import { buildSchema } from 'graphql';

export const appSchema = buildSchema(`
  enum Role {
    EMPLOYEE
    INVENTORY_HEAD
    FINANCE
    IT_ADMIN
    HR_MANAGER
    SYSTEM_ADMIN
  }

  enum OrderStatus {
    SUBMITTED
    FINANCE_APPROVED
    FINANCE_REJECTED
    IT_RECEIVED
  }

  enum ReviewDecision {
    APPROVE
    REJECT
  }

  type User {
    id: ID!
    email: String!
    fullName: String!
    role: Role!
    createdAt: String!
  }

  type Notification {
    id: ID!
    type: String!
    title: String!
    message: String!
    entityType: String!
    entityId: String
    isRead: Boolean!
    createdAt: String!
    readAt: String
  }

  type OrderItem {
    id: ID!
    orderId: ID!
    itemName: String!
    category: String
    quantity: Int!
    unitCost: Float!
    fromWhere: String!
    additionalNotes: String
    eta: String
    qrCode: String
    manufacturedAt: String
    serialNumber: String
    powerSpec: String
    conditionNote: String
    receiveStatus: String!
    receivedAt: String
    receivedBy: User
    assignedTo: User
    assignedAt: String
    assignmentNote: String
  }

  type Order {
    id: ID!
    requester: User!
    whyOrdered: String!
    orderProcess: String!
    whichOffice: String!
    status: OrderStatus!
    financeApprover: User
    financeComment: String
    financeActionAt: String
    whenToArrive: String
    totalCost: Float!
    items: [OrderItem!]!
    createdAt: String!
    updatedAt: String!
  }

  input CreateOrderItemInput {
    itemName: String!
    category: String
    quantity: Int
    unitCost: Float!
    fromWhere: String!
    additionalNotes: String
    eta: String
  }

  input CreateOrderInput {
    whyOrdered: String!
    orderProcess: String!
    whichOffice: String!
    whenToArrive: String
    items: [CreateOrderItemInput!]!
  }

  input CreateUserInput {
    email: String!
    fullName: String!
    role: Role!
  }

  input ReceiveOrderItemInput {
    itemId: ID!
    serialNumber: String!
    manufacturedAt: String!
    powerSpec: String!
    conditionNote: String
  }

  input AssignOrderItemInput {
    itemId: ID!
    assignedToUserId: ID!
    assignmentNote: String
  }

  type Query {
    me: User
    orders: [Order!]!
    users: [User!]!
    lookupItemByQr(qrCode: String!): OrderItem
    notifications: [Notification!]!
  }

  type Mutation {
    syncMe: User!
    createUser(input: CreateUserInput!): User!
    updateUserRole(userId: ID!, role: Role!): User!
    deleteUser(userId: ID!): Boolean!
    createOrder(input: CreateOrderInput!): Order!
    reviewOrder(orderId: ID!, decision: ReviewDecision!, comment: String): Order!
    receiveOrderItems(orderId: ID!, items: [ReceiveOrderItemInput!]!): Order!
    assignOrderItems(orderId: ID!, items: [AssignOrderItemInput!]!): Order!
    markNotificationRead(notificationId: ID!): Notification!
  }
`);
