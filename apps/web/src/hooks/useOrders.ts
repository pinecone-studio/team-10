import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphqlRequest, type RequestOptions } from '../lib/graphqlClient';
import type { AssignOrderItemInput, CreateOrderInput, Order, ReceiveOrderItemInput, User } from '../types/order';

type OrdersData = { orders: Order[]; users: User[] };

export function useOrders(auth: RequestOptions, canSeeUsers: boolean, includeOrders: boolean) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthorized = Boolean(auth.token || auth.devAuth);

  const loadOrders = useCallback(async () => {
    if (!isAuthorized) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await graphqlRequest<OrdersData, { includeUsers: boolean; includeOrders: boolean }>(
        `query($includeUsers: Boolean!, $includeOrders: Boolean!) {
          orders @include(if: $includeOrders) {
            id requester { id email fullName role createdAt } whyOrdered orderProcess whichOffice
            status financeComment financeActionAt whenToArrive totalCost createdAt updatedAt
            financeApprover { id email fullName role createdAt }
            items {
              id orderId itemName category quantity unitCost fromWhere additionalNotes eta
              qrCode manufacturedAt serialNumber powerSpec conditionNote receiveStatus receivedAt assignedAt assignmentNote
              receivedBy { id email fullName role createdAt }
              assignedTo { id email fullName role createdAt }
            }
          }
          users @include(if: $includeUsers) { id email fullName role createdAt }
        }`,
        { includeUsers: canSeeUsers, includeOrders },
        auth,
      );
      setOrders(includeOrders ? data.orders : []);
      setUsers(canSeeUsers ? data.users : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed loading orders');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, canSeeUsers, includeOrders, auth]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const createOrder = useCallback(
    async (input: CreateOrderInput) => {
      if (!isAuthorized) throw new Error('Unauthorized');
      setIsSaving(true);
      try {
        await graphqlRequest<{ createOrder: { id: string } }, { input: CreateOrderInput }>(
          `mutation($input: CreateOrderInput!) { createOrder(input: $input) { id } }`,
          { input },
          auth,
        );
        await loadOrders();
      } finally {
        setIsSaving(false);
      }
    },
    [isAuthorized, loadOrders, auth],
  );

  const reviewOrder = useCallback(
    async (orderId: string, decision: 'APPROVE' | 'REJECT', comment?: string) => {
      if (!isAuthorized) throw new Error('Unauthorized');
      setIsSaving(true);
      try {
        await graphqlRequest<{ reviewOrder: { id: string } }, { orderId: string; decision: string; comment?: string }>(
          `mutation($orderId: ID!, $decision: ReviewDecision!, $comment: String) {
            reviewOrder(orderId: $orderId, decision: $decision, comment: $comment) { id }
          }`,
          { orderId, decision, comment: comment || undefined },
          auth,
        );
        await loadOrders();
      } finally {
        setIsSaving(false);
      }
    },
    [isAuthorized, loadOrders, auth],
  );

  const receiveOrderItems = useCallback(
    async (orderId: string, items: ReceiveOrderItemInput[]) => {
      if (!isAuthorized) throw new Error('Unauthorized');
      setIsSaving(true);
      try {
        await graphqlRequest<{ receiveOrderItems: { id: string } }, { orderId: string; items: ReceiveOrderItemInput[] }>(
          `mutation($orderId: ID!, $items: [ReceiveOrderItemInput!]!) {
            receiveOrderItems(orderId: $orderId, items: $items) { id }
          }`,
          { orderId, items },
          auth,
        );
        await loadOrders();
      } finally {
        setIsSaving(false);
      }
    },
    [isAuthorized, loadOrders, auth],
  );

  const assignOrderItems = useCallback(
    async (orderId: string, items: AssignOrderItemInput[]) => {
      if (!isAuthorized) throw new Error('Unauthorized');
      setIsSaving(true);
      try {
        await graphqlRequest<{ assignOrderItems: { id: string } }, { orderId: string; items: AssignOrderItemInput[] }>(
          `mutation($orderId: ID!, $items: [AssignOrderItemInput!]!) {
            assignOrderItems(orderId: $orderId, items: $items) { id }
          }`,
          { orderId, items },
          auth,
        );
        await loadOrders();
      } finally {
        setIsSaving(false);
      }
    },
    [isAuthorized, loadOrders, auth],
  );

  const totalSpend = useMemo(() => orders.reduce((s, o) => s + o.totalCost, 0), [orders]);
  return { orders, users, isLoading, isSaving, error, totalSpend, createOrder, reviewOrder, receiveOrderItems, assignOrderItems, reload: loadOrders };
}
