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
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[radial-gradient(ellipse_at_52%_22%,rgba(191,219,254,0.72)_0%,rgba(191,219,254,0.34)_18%,rgba(191,219,254,0.12)_34%,rgba(191,219,254,0)_56%),radial-gradient(ellipse_at_85%_78%,rgba(186,230,253,0.34)_0%,rgba(186,230,253,0.18)_20%,rgba(186,230,253,0.08)_34%,rgba(186,230,253,0)_54%),radial-gradient(ellipse_at_72%_58%,rgba(191,219,254,0.18)_0%,rgba(191,219,254,0.09)_18%,rgba(191,219,254,0.03)_32%,rgba(191,219,254,0)_48%),linear-gradient(180deg,#ffffff_0%,#ffffff_14%,#f8fbff_30%,#f5faff_54%,#ffffff_100%)]">
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
      <div className="min-h-0 flex-1 overflow-hidden px-0 pt-7">
        <div className="mx-auto flex h-full w-full max-w-[1237px] min-h-0 flex-col px-[44px] pb-[80px]">
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
