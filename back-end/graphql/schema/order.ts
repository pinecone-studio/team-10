export const OrderTypeDefs = `
  type OrderItem {
    id: ID!
    catalogId: ID!
    name: String!
    code: String!
    unit: String!
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!
    currencyCode: String!
  }

  type Order {
    id: ID!
    orderName: String!
    requestNumber: String!
    requestDate: String!
    department: String!
    requester: String!
    deliveryDate: String!
    items: [OrderItem!]!
    totalAmount: Float!
    currencyCode: String!
    requestedApproverId: String
    requestedApproverName: String
    requestedApproverRole: String
    approvalMessage: String!
    higherUpReviewer: String
    higherUpReviewedAt: String
    higherUpNote: String!
    financeReviewer: String
    financeReviewedAt: String
    financeNote: String!
    receivedAt: String
    receivedCondition: String
    receivedNote: String!
    storageLocation: String!
    serialNumbers: [String!]!
    assignedTo: String
    assignedRole: String
    assignedAt: String
    userId: ID!
    officeId: ID!
    departmentId: ID
    createdAt: String!
    updatedAt: String!
    whyOrdered: String!
    status: String!
    approvalTarget: String!
    expectedArrivalAt: String
    totalCost: Float
  }

  input OrderItemInput {
    catalogId: ID
    name: String!
    code: String!
    unit: String
    quantity: Int!
    unitPrice: Float!
    currencyCode: String
    category: String
    itemType: String
    fromWhere: String
    additionalNotes: String
    eta: String
  }

  type Query {
    orders: [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    createOrder(
      orderName: String!
      requestNumber: String
      requestDate: String
      requester: String
      userId: ID
      officeId: ID
      departmentId: ID
      department: String
      whyOrdered: String
      status: String
      approvalTarget: String
      deliveryDate: String
      totalAmount: Float
      currencyCode: String
      requestedApproverId: String
      requestedApproverName: String
      requestedApproverRole: String
      approvalMessage: String
      items: [OrderItemInput!]
    ): Order!
    updateOrder(
      id: ID!
      orderName: String
      requestNumber: String
      requestDate: String
      requester: String
      userId: ID
      officeId: ID
      departmentId: ID
      department: String
      whyOrdered: String
      status: String
      approvalTarget: String
      deliveryDate: String
      totalAmount: Float
      currencyCode: String
      requestedApproverId: String
      requestedApproverName: String
      requestedApproverRole: String
      approvalMessage: String
      higherUpReviewer: String
      higherUpReviewedAt: String
      higherUpNote: String
      financeReviewer: String
      financeReviewedAt: String
      financeNote: String
      receivedAt: String
      receivedCondition: String
      receivedNote: String
      storageLocation: String
      serialNumbers: [String!]
      assignedTo: String
      assignedRole: String
      assignedAt: String
      items: [OrderItemInput!]
    ): Order
    deleteOrder(id: ID!): Boolean!
  }
`;
