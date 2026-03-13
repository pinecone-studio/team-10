"use client";

import { gql } from "@apollo/client/core";
import { apolloClient } from "@/app/providers/apolloClient";

export type NotificationDto = {
  id: string;
  userId: string;
  type: string;
  orderId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  entityType: string;
  entityId: string | null;
};

const notificationFieldsFragment = gql`
  fragment NotificationFields on Notification {
    id
    userId
    type
    orderId
    title
    message
    isRead
    createdAt
    readAt
    entityType
    entityId
  }
`;

const notificationsQuery = gql`
  ${notificationFieldsFragment}

  query Notifications($userId: ID) {
    notifications(userId: $userId) {
      ...NotificationFields
    }
  }
`;

const markNotificationAsReadMutation = gql`
  ${notificationFieldsFragment}

  mutation MarkNotificationAsRead($id: ID!, $userId: ID) {
    markNotificationAsRead(id: $id, userId: $userId) {
      ...NotificationFields
    }
  }
`;

const markAllNotificationsAsReadMutation = gql`
  mutation MarkAllNotificationsAsRead($userId: ID) {
    markAllNotificationsAsRead(userId: $userId)
  }
`;

export async function fetchNotificationsRequest(userId?: string | null) {
  const { data } = await apolloClient.query<{
    notifications: NotificationDto[];
  }>({
    query: notificationsQuery,
    variables: { userId: userId ?? null },
    fetchPolicy: "no-cache",
  });

  return data?.notifications ?? [];
}

export async function markNotificationAsReadRequest(
  id: string,
  userId?: string | null,
) {
  const { data } = await apolloClient.mutate<{
    markNotificationAsRead: NotificationDto | null;
  }>({
    mutation: markNotificationAsReadMutation,
    variables: {
      id,
      userId: userId ?? null,
    },
    fetchPolicy: "no-cache",
  });

  return data?.markNotificationAsRead ?? null;
}

export async function markAllNotificationsAsReadRequest(userId?: string | null) {
  const { data } = await apolloClient.mutate<{
    markAllNotificationsAsRead: boolean;
  }>({
    mutation: markAllNotificationsAsReadMutation,
    variables: {
      userId: userId ?? null,
    },
    fetchPolicy: "no-cache",
  });

  return data?.markAllNotificationsAsRead ?? false;
}
