export const NotificationTypeDefs = `
  type Notification {
    id: ID!
    userId: ID!
    type: String!
    orderId: ID!
    title: String!
    message: String!
    isRead: Boolean!
    createdAt: String!
    readAt: String
    entityType: String!
    entityId: String
  }

  type Query {
    notifications(userId: ID): [Notification!]!
  }

  type Mutation {
    markNotificationAsRead(id: ID!, userId: ID): Notification
    markAllNotificationsAsRead(userId: ID): Boolean!
  }
`;
