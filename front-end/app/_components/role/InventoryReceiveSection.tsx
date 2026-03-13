"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  formatCurrency,
  receiveInventoryOrder,
  useOrdersStore,
} from "../../_lib/order-store";
import type { StoredOrder } from "../../_lib/order-types";
import { EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";

type ReceiveFilter = "outline" | "category" | "status" | "purchaseCost";

type ReceiveRow = {
  id: string;
  orderId: string;
  assetName: string;
  category: string;
  status: "pending" | "correct" | "partial" | "damaged";
  quantity: number;
  received: number;
  purchaseCost: number;
  selectable: boolean;
};

const ROWS_PER_PAGE_OPTIONS = [10, 20, 30] as const;

function inferCategory(itemName: string) {
  const normalized = itemName.toLowerCase();

  if (
    normalized.includes("macbook") ||
    normalized.includes("thinkpad") ||
    normalized.includes("dell") ||
    normalized.includes("asus") ||
    normalized.includes("lenovo")
  ) {
    return "IT Equipment";
  }

  if (
    normalized.includes("printer") ||
    normalized.includes("scanner") ||
    normalized.includes("projector") ||
    normalized.includes("monitor")
  ) {
    return "Office Equipment";
  }

  if (
    normalized.includes("switch") ||
    normalized.includes("router") ||
    normalized.includes("server")
  ) {
    return "Technical content";
  }

  return "Other Assets";
}

function getReceivedCount(order: StoredOrder, quantity: number) {
  if (order.status === "approved_finance") return 0;
  if (order.receivedCondition === "issue") return Math.max(0, quantity - 1);
  return quantity;
}

function getRowStatus(order: StoredOrder, quantity: number) {
  if (order.status === "approved_finance") return "pending" as const;

  const receivedCount = getReceivedCount(order, quantity);
  if (order.receivedCondition === "issue" && receivedCount === 0) return "damaged" as const;
  if (order.receivedCondition === "issue" && receivedCount < quantity) return "partial" as const;
  return "correct" as const;
}

function buildSerialNumbers(order: StoredOrder) {
  return order.items.flatMap((item, itemIndex) =>
    Array.from(
      { length: item.quantity },
      (_, serialIndex) => `${item.code}-${itemIndex + 1}${serialIndex + 1}`,
    ),
  );
}

function buildReceiveRows(orders: StoredOrder[]) {
  return orders.flatMap((order) =>
    order.items.map((item, itemIndex) => ({
      id: `${order.id}-${item.catalogId}-${itemIndex}`,
      orderId: order.id,
      assetName: item.name,
      category: inferCategory(item.name),
      status: getRowStatus(order, item.quantity),
      quantity: item.quantity,
      received: getReceivedCount(order, item.quantity),
      purchaseCost: item.totalPrice,
      selectable: order.status === "approved_finance",
    })),
  );
}

function StatusBadge({ status }: { status: ReceiveRow["status"] }) {
  const styles =
    status === "correct"
      ? "border-[#d5edb0] bg-[#f5fbeb] text-[#5e8a18]"
      : status === "partial"
        ? "border-[#ffd8bf] bg-[#fff7ef] text-[#d76a18]"
        : status === "damaged"
          ? "border-[#f1cccc] bg-[#fff3f3] text-[#cb4b4b]"
          : "border-[#d6d6d6] bg-white text-[#7a7a7a]";

  const icon =
    status === "correct" ? "✦" : status === "partial" ? "↗" : status === "damaged" ? "✕" : "•";

  const label =
    status === "correct"
      ? "Correct"
      : status === "partial"
        ? "Partial"
        : status === "damaged"
          ? "Damaged"
          : "Pending";

  return (
    <span
      className={`inline-flex h-[22px] items-center gap-[4px] rounded-[8px] border px-[6px] text-[12px] ${styles}`}
    >
      <span className="text-[10px]">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

function TableButton({
  children,
  active = false,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[28px] items-center justify-center rounded-[8px] px-[8px] text-[14px] font-medium ${
        active
          ? "border border-[#e5e5e5] bg-white text-[#0a0a0a] shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
          : "text-[#0a0a0a]"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[32px] items-center gap-[6px] rounded-[8px] border border-[#e5e5e5] bg-white px-[10px] text-[14px] font-medium text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
    >
      {children}
    </button>
  );
}

function PaginationButton({
  children,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-[32px] items-center justify-center rounded-[8px] border border-[#e5e5e5] bg-white text-[14px] text-[#0a0a0a] disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function InventoryReceiveSection() {
  const orders = useOrdersStore();
  const receiveOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "approved_finance" ||
          order.status === "received_inventory" ||
          order.status === "assigned_hr",
      ),
    [orders],
  );
  const rows = useMemo(() => buildReceiveRows(receiveOrders), [receiveOrders]);
  const [activeFilter, setActiveFilter] = useState<ReceiveFilter>("outline");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<(typeof ROWS_PER_PAGE_OPTIONS)[number]>(10);
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    if (activeFilter === "category") {
      return [...rows].sort((left, right) => left.category.localeCompare(right.category));
    }

    if (activeFilter === "status") {
      const order = { pending: 0, correct: 1, partial: 2, damaged: 3 };
      return [...rows].sort((left, right) => order[left.status] - order[right.status]);
    }

    if (activeFilter === "purchaseCost") {
      return [...rows].sort((left, right) => right.purchaseCost - left.purchaseCost);
    }

    return rows;
  }, [activeFilter, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);

  const pagedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, filteredRows, rowsPerPage]);

  const activeSelectedRowIds = selectedRowIds.filter((rowId) =>
    rows.some((row) => row.id === rowId && row.selectable),
  );
  const selectableRows = filteredRows.filter((row) => row.selectable);
  const allPageRowsSelected =
    pagedRows.filter((row) => row.selectable).length > 0 &&
    pagedRows
      .filter((row) => row.selectable)
      .every((row) => activeSelectedRowIds.includes(row.id));

  const pendingOrderIds = Array.from(
    new Set(
      rows
        .filter((row) => activeSelectedRowIds.includes(row.id) && row.selectable)
        .map((row) => row.orderId),
    ),
  );

  const counts = {
    category: new Set(rows.map((row) => row.category)).size,
    status: new Set(rows.map((row) => row.status)).size,
  };

  if (rows.length === 0) {
    return (
      <WorkspaceShell
        title="Receive and serialize"
        subtitle="QR / Barcode Generation"
        contentAlignment="left"
        contentWidthClassName="max-w-[1138px]"
        actions={
          <button
            type="button"
            className="inline-flex h-[40px] items-center justify-center rounded-[6px] bg-[#0f172a] px-[16px] text-[14px] font-medium text-white"
            disabled
          >
            Submit for approval
          </button>
        }
      >
        <div className="border-t border-[#e3e4e8] pt-[24px]">
          <EmptyState
            title="No inventory items ready to receive"
            description="Finance-approved orders and recently received assets will appear here."
          />
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      title="Receive and serialize"
      subtitle="QR / Barcode Generation"
      contentAlignment="left"
      contentWidthClassName="max-w-[1138px]"
      actions={
        <button
          type="button"
          disabled={pendingOrderIds.length === 0}
          onClick={() => {
            pendingOrderIds.forEach((orderId) => {
              const order = receiveOrders.find((entry) => entry.id === orderId);
              if (!order || order.status !== "approved_finance") return;

              receiveInventoryOrder({
                orderId: order.id,
                receivedAt: new Date().toISOString().slice(0, 10),
                receivedCondition: "complete",
                receivedNote: "Received from purchase queue and serialized.",
                storageLocation: "Main warehouse / Intake",
                serialNumbers: buildSerialNumbers(order),
              });
            });
            setSelectedRowIds([]);
          }}
          className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[#0f172a] px-[16px] text-[14px] font-medium text-white disabled:opacity-40"
        >
          <span>Submit for approval</span>
          <span aria-hidden="true">›</span>
        </button>
      }
    >
      <div className="border-t border-[#e3e4e8] pt-[24px]">
        <div className="flex items-center justify-between px-[24px]">
          <div className="inline-flex h-[34px] items-center rounded-[10px] bg-[#f5f5f5] p-[3px]">
            <TableButton active={activeFilter === "outline"} onClick={() => setActiveFilter("outline")}>
              Outline
            </TableButton>
            <TableButton onClick={() => setActiveFilter("category")}>
              Category
              <span className="ml-[6px] inline-flex size-[20px] items-center justify-center rounded-full bg-[#f5f5f5] text-[14px]">
                {counts.category}
              </span>
            </TableButton>
            <TableButton onClick={() => setActiveFilter("status")}>
              Status
              <span className="ml-[6px] inline-flex size-[20px] items-center justify-center rounded-full bg-[#f5f5f5] text-[14px]">
                {counts.status}
              </span>
            </TableButton>
            <TableButton onClick={() => setActiveFilter("purchaseCost")}>
              Purchase Cost
            </TableButton>
          </div>

          <div className="flex items-center gap-[8px]">
            <ToolbarButton>
              <span aria-hidden="true">║║</span>
              <span>Customize Columns</span>
              <span aria-hidden="true">⌄</span>
            </ToolbarButton>
            <ToolbarButton>
              <span aria-hidden="true">＋</span>
              <span>Add columns</span>
            </ToolbarButton>
          </div>
        </div>

        <div className="mt-[16px] rounded-[8px] border border-[#e5e5e5] bg-white">
          <div className="grid grid-cols-[44px_28px_1.6fr_1fr_0.95fr_0.55fr_0.65fr_1fr_44px] items-center border-b border-[#e5e5e5] bg-[#f5f5f5] text-[14px] font-medium text-[#0a0a0a]">
            <div className="h-[40px]" />
            <div className="flex h-[40px] items-center pl-[8px]">
              <input
                type="checkbox"
                checked={allPageRowsSelected}
                aria-label="Select page rows"
                onChange={(event) => {
                  const pageSelectableIds = pagedRows
                    .filter((row) => row.selectable)
                    .map((row) => row.id);

                  if (event.target.checked) {
                    setSelectedRowIds((current) => Array.from(new Set([...current, ...pageSelectableIds])));
                    return;
                  }

                  setSelectedRowIds((current) =>
                    current.filter((rowId) => !pageSelectableIds.includes(rowId)),
                  );
                }}
                className="size-[16px] rounded-[4px] border border-[#d7d7d7]"
              />
            </div>
            <div className="px-[8px]">Asset Name</div>
            <div className="px-[8px]">Category</div>
            <div className="px-[8px]">Status</div>
            <div className="px-[8px] text-center">QTY</div>
            <div className="px-[8px] text-center">Received</div>
            <div className="px-[8px] text-right">Purchase Cost</div>
            <div className="h-[40px]" />
          </div>

          {pagedRows.map((row) => {
            const isSelected = activeSelectedRowIds.includes(row.id);

            return (
              <div
                key={row.id}
                className="grid grid-cols-[44px_28px_1.6fr_1fr_0.95fr_0.55fr_0.65fr_1fr_44px] items-center border-b border-[#e5e5e5] text-[14px] text-[#0a0a0a] last:border-b-0"
              >
                <div className="flex h-[53px] items-center justify-center text-[#a3a3a3]">⋮</div>
                <div className="flex h-[53px] items-center pl-[8px]">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!row.selectable}
                    aria-label={`Select ${row.assetName}`}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedRowIds((current) =>
                          current.includes(row.id) ? current : [...current, row.id],
                        );
                        return;
                      }

                      setSelectedRowIds((current) => current.filter((rowId) => rowId !== row.id));
                    }}
                    className="size-[16px] rounded-[4px] border border-[#d7d7d7] disabled:opacity-40"
                  />
                </div>
                <div className="truncate px-[8px] font-medium">{row.assetName}</div>
                <div className="px-[8px]">
                  <span className="inline-flex h-[22px] items-center rounded-[8px] border border-[#e5e5e5] bg-white px-[6px] text-[12px] text-[#737373]">
                    {row.category}
                  </span>
                </div>
                <div className="px-[8px]">
                  <StatusBadge status={row.status} />
                </div>
                <div className="px-[8px] text-center">{row.quantity}</div>
                <div className="px-[8px] text-center">{row.received}</div>
                <div className="px-[8px] text-right">{formatCurrency(row.purchaseCost)}</div>
                <div className="flex h-[53px] items-center justify-center text-[#737373]">⋮</div>
              </div>
            );
          })}
        </div>

        <div className="mt-[12px] flex h-[36px] items-center">
          <p className="flex-1 text-[14px] text-[#737373]">
            {activeSelectedRowIds.length} of {selectableRows.length} row(s) selected.
          </p>

          <div className="flex items-center gap-[32px]">
            <div className="flex items-center gap-[8px]">
              <span className="pr-[8px] text-[14px] font-medium text-[#0a0a0a]">Rows per page</span>
              <label className="inline-flex h-[36px] w-[80px] items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white px-[12px] text-[14px] text-[#0a0a0a] shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                <select
                  value={rowsPerPage}
                  onChange={(event) => {
                    setRowsPerPage(Number(event.target.value) as (typeof ROWS_PER_PAGE_OPTIONS)[number]);
                    setPage(1);
                  }}
                  className="w-full appearance-none bg-transparent outline-none"
                >
                  {ROWS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span aria-hidden="true">⌄</span>
              </label>
            </div>

            <p className="text-[14px] font-medium text-[#0a0a0a]">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-[8px]">
              <PaginationButton disabled={currentPage === 1} onClick={() => setPage(1)}>
                «
              </PaginationButton>
              <PaginationButton disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                ‹
              </PaginationButton>
              <PaginationButton disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>
                ›
              </PaginationButton>
              <PaginationButton disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>
                »
              </PaginationButton>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
