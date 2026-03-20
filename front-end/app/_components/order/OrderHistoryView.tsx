"use client";

import { useMemo, useState } from "react";
import type { StoredOrder } from "../../_lib/order-store";
import { getOrderSummaryName } from "./orderPresentation";
import { OrderHistoryTable } from "./OrderHistoryTable";
import { OrderHistoryToolbar } from "./OrderHistoryToolbar";

type OrderSortKey =
  | "requestNumber"
  | "orderName"
  | "requester"
  | "requestDate"
  | "status"
  | "totalAmount";

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
  const [sortKey, setSortKey] = useState<OrderSortKey>("requestDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const visibleOrders = useMemo(
    () =>
      sortOrders(
        filterOrdersByDateRange(
          filterOrdersByQuery(props.orders, searchQuery),
          startDate,
          endDate,
        ),
        sortKey,
        sortDirection,
      ),
    [endDate, props.orders, searchQuery, sortDirection, sortKey, startDate],
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
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={(nextKey) => {
              if (nextKey === sortKey) {
                setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
                return;
              }

              setSortKey(nextKey);
              setSortDirection(nextKey === "requestDate" ? "desc" : "asc");
            }}
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

function sortOrders(
  orders: StoredOrder[],
  sortKey: OrderSortKey,
  sortDirection: "asc" | "desc",
) {
  function parseRequestNumber(order: StoredOrder) {
    const match = /^REQ-(\d{8})-(\d+)$/.exec(order.requestNumber.trim());
    if (!match) {
      return null;
    }

    return {
      dateNumber: Number(match[1]),
      sequenceNumber: Number(match[2]),
    };
  }

  function parseSortableId(id: string) {
    return /^\d+$/.test(id.trim()) ? Number(id) : null;
  }

  function getStatusLabel(status: StoredOrder["status"]) {
    if (status === "pending_finance") return "Pending Finance";
    if (status === "rejected_finance") return "Rejected";
    if (status === "approved_finance") return "Approved";
    if (status === "received_inventory") return "Received";
    return "Assigned";
  }

  return [...orders].sort((left, right) => {
    let comparison = 0;

    if (sortKey === "requestNumber") {
      const leftRequestNumber = parseRequestNumber(left);
      const rightRequestNumber = parseRequestNumber(right);
      if (leftRequestNumber && rightRequestNumber) {
        comparison = leftRequestNumber.dateNumber - rightRequestNumber.dateNumber;
        if (comparison === 0) {
          comparison =
            leftRequestNumber.sequenceNumber - rightRequestNumber.sequenceNumber;
        }
      } else {
        comparison = left.requestNumber.localeCompare(right.requestNumber);
      }
    } else if (sortKey === "orderName") {
      comparison = getOrderSummaryName(left).localeCompare(getOrderSummaryName(right));
    } else if (sortKey === "requester") {
      comparison = (left.requester || "").localeCompare(right.requester || "");
    } else if (sortKey === "requestDate") {
      comparison = left.requestDate.localeCompare(right.requestDate);
    } else if (sortKey === "status") {
      comparison = getStatusLabel(left.status).localeCompare(getStatusLabel(right.status));
    } else if (sortKey === "totalAmount") {
      comparison = left.totalAmount - right.totalAmount;
    }

    if (comparison !== 0) {
      return sortDirection === "asc" ? comparison : -comparison;
    }

    const updatedAtCompare = right.updatedAt.localeCompare(left.updatedAt);
    if (updatedAtCompare !== 0) return updatedAtCompare;

    const createdAtCompare = right.createdAt.localeCompare(left.createdAt);
    if (createdAtCompare !== 0) return createdAtCompare;

    const leftNumericId = parseSortableId(left.id);
    const rightNumericId = parseSortableId(right.id);
    if (leftNumericId !== null && rightNumericId !== null) {
      return rightNumericId - leftNumericId;
    }

    return right.id.localeCompare(left.id);
  });
}
