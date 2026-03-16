"use client";

import { useMemo, useState } from "react";
import type { StoredOrder } from "../../_lib/order-store";
import { getOrderSummaryName } from "./orderPresentation";
import { OrderHistoryTable } from "./OrderHistoryTable";
import { OrderHistoryToolbar } from "./OrderHistoryToolbar";

export function OrderHistoryView(props: {
  allOrders: StoredOrder[];
  orders: StoredOrder[];
  selectedFilter: "all" | "pending" | "completed" | "cancelled";
  onFilterChange: (value: "all" | "pending" | "completed" | "cancelled") => void;
  onOpenCreate: () => void;
  onOpenDetail: (orderId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const visibleOrders = useMemo(() => filterOrdersByQuery(props.orders, searchQuery), [props.orders, searchQuery]);
  const counts = useMemo(() => buildCounts(props.allOrders), [props.allOrders]);

  return (
    <div className="space-y-5 px-0 pb-0">
      <OrderHistoryToolbar
        counts={counts}
        selectedFilter={props.selectedFilter}
        searchQuery={searchQuery}
        isNotificationOpen={isNotificationOpen}
        onFilterChange={props.onFilterChange}
        onSearchChange={setSearchQuery}
        onOpenCreate={props.onOpenCreate}
        onOpenDetail={props.onOpenDetail}
        onToggleNotifications={() => setNotificationOpen((current) => !current)}
        onCloseNotifications={() => setNotificationOpen(false)}
      />
      <div className="px-9 pb-9">
        <OrderHistoryTable orders={visibleOrders} onOpenDetail={props.onOpenDetail} />
      </div>
    </div>
  );
}

function filterOrdersByQuery(orders: StoredOrder[], searchQuery: string) {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return orders;
  return orders.filter((order) =>
    [order.requestNumber, getOrderSummaryName(order), order.requester, order.requestedApproverName ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(query),
  );
}

function buildCounts(orders: StoredOrder[]) {
  return {
    all: orders.length,
    pending: orders.filter((order) => ["pending_higher_up", "pending_finance"].includes(order.status)).length,
    completed: orders.filter((order) => ["approved_finance", "received_inventory", "assigned_hr"].includes(order.status)).length,
    cancelled: orders.filter((order) => ["rejected_higher_up", "rejected_finance"].includes(order.status)).length,
  };
}
