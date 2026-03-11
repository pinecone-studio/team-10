export const OrderTypeDefs = `
  type Order {
    id: ID!
    userId: ID!
    officeId: ID!
    orderProcessId: ID!
    whyOrdered: String!
    status: String!
    expectedArrivalAt: String
    totalCost: Float
  }

  type Query {
    orders: [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    createOrder(
      userId: ID
      officeId: ID
      orderProcessId: ID
      whyOrdered: String!
      status: String!
      expectedArrivalAt: String
      totalCost: Float
    ): Order!
    updateOrderStatus(id: ID!, status: String!): Order
  }
`;
