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
  onDeleteOrder: (orderId: string) => void | Promise<void>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const visibleOrders = useMemo(
    () => filterOrdersByDateRange(filterOrdersByQuery(props.orders, searchQuery), startDate, endDate),
    [endDate, props.orders, searchQuery, startDate],
  );
  const counts = useMemo(() => buildCounts(props.allOrders), [props.allOrders]);

  return (
    <div className="min-h-[calc(100vh-60px)] space-y-0 bg-[#f8fafc]">
      <OrderHistoryToolbar
        counts={counts}
        selectedFilter={props.selectedFilter}
        searchQuery={searchQuery}
        startDate={startDate}
        endDate={endDate}
        onFilterChange={props.onFilterChange}
        onSearchChange={setSearchQuery}
        onDateRangeChange={(nextStartDate, nextEndDate) => {
          setStartDate(nextStartDate);
          setEndDate(nextEndDate);
        }}
        onOpenCreate={props.onOpenCreate}
        onOpenDetail={props.onOpenDetail}
      />
      <div className="px-0 pb-[40px] pt-6">
        <div className="mx-auto w-full max-w-[1237px] px-[24px] lg:px-[44px]">
          <OrderHistoryTable
            orders={visibleOrders}
            onOpenDetail={props.onOpenDetail}
            onDeleteOrder={props.onDeleteOrder}
          />
        </div>
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

function filterOrdersByDateRange(
  orders: StoredOrder[],
  startDate: string,
  endDate: string,
) {
  if (!startDate && !endDate) return orders;
  return orders.filter((order) => {
    if (startDate && order.requestDate < startDate) return false;
    if (endDate && order.requestDate > endDate) return false;
    return true;
  });
}

function buildCounts(orders: StoredOrder[]) {
  return {
    all: orders.length,
    pending: orders.filter((order) => ["pending_finance"].includes(order.status)).length,
    completed: orders.filter((order) => ["approved_finance", "received_inventory", "assigned_hr"].includes(order.status)).length,
    cancelled: orders.filter((order) => ["rejected_finance"].includes(order.status)).length,
  };
}
