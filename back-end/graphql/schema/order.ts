export const OrderTypeDefs = `
  type Order {
    id: ID!
    orderName: String!
    userId: ID!
    officeId: ID!
    departmentId: ID
    whyOrdered: String!
    status: String!
    approvalTarget: String!
    expectedArrivalAt: String
    totalCost: Float
  }

  type Query {
    orders: [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    createOrder(
      orderName: String!
      userId: ID
      officeId: ID
      departmentId: ID
      whyOrdered: String!
      status: String!
      approvalTarget: String
      expectedArrivalAt: String
      totalCost: Float
    ): Order!
    updateOrder(
      id: ID!
      orderName: String
      userId: ID
      officeId: ID
      departmentId: ID
      whyOrdered: String
      status: String
      approvalTarget: String
      expectedArrivalAt: String
      totalCost: Float
    ): Order
    deleteOrder(id: ID!): Boolean!
  }
`;
