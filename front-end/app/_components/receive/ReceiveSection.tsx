"use client";

import { useMemo, useState } from "react";
import { receiveInventoryOrder, useOrdersStore } from "../../_lib/order-store";
import { EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";
import { ReceivePagination } from "./ReceivePagination";
import { ReceiveStepper } from "./ReceiveStepper";
import { ReceiveTable } from "./ReceiveTable";
import { ReceiveToolbar } from "./ReceiveToolbar";
import {
  buildReceiveRows,
  buildSerialNumbers,
  ROWS_PER_PAGE_OPTIONS,
} from "./receiveData";

export function ReceiveSection() {
  const orders = useOrdersStore();
  const receiveOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "approved_finance" ||
          order.status === "received_inventory",
      ),
    [orders],
  );
  const rows = useMemo(() => buildReceiveRows(receiveOrders), [receiveOrders]);
  const [search, setSearch] = useState("");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<(typeof ROWS_PER_PAGE_OPTIONS)[number]>(10);
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return rows;

    return rows.filter(
      (row) =>
        row.assetName.toLowerCase().includes(normalizedSearch) ||
        row.category.toLowerCase().includes(normalizedSearch),
    );
  }, [rows, search]);

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

  if (rows.length === 0) {
    return (
      <WorkspaceShell
        title="Receive and serialize"
        subtitle="QR / Barcode Generation"
        contentAlignment="left"
        contentWidthClassName="max-w-[1138px]"
        outerClassName="px-[34px] py-[28px]"
      >
        <div className="border-t border-[#e3e4e8] pt-[24px]">
          <EmptyState
            title="No approved orders ready for receive"
            description="Orders created in Order must be approved by Higher-ups and Finance before they appear here."
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
      outerClassName="px-[34px] py-[28px]"
    >
      <div className="flex min-h-[calc(100vh-180px)] flex-col">
        <ReceiveStepper />
        <ReceiveToolbar search={search} onSearchChange={setSearch} />

        <ReceiveTable
          rows={pagedRows}
          selectedRowIds={activeSelectedRowIds}
          allPageRowsSelected={allPageRowsSelected}
          onToggleAllPageRows={(checked) => {
            const pageSelectableIds = pagedRows
              .filter((row) => row.selectable)
              .map((row) => row.id);

            if (checked) {
              setSelectedRowIds((current) => Array.from(new Set([...current, ...pageSelectableIds])));
              return;
            }

            setSelectedRowIds((current) => current.filter((rowId) => !pageSelectableIds.includes(rowId)));
          }}
          onToggleRow={(rowId, checked) => {
            if (checked) {
              setSelectedRowIds((current) => (current.includes(rowId) ? current : [...current, rowId]));
              return;
            }

            setSelectedRowIds((current) => current.filter((currentRowId) => currentRowId !== rowId));
          }}
        />

        <ReceivePagination
          selectedCount={activeSelectedRowIds.length}
          totalSelectableCount={selectableRows.length}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          currentPage={currentPage}
          totalPages={totalPages}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value as (typeof ROWS_PER_PAGE_OPTIONS)[number]);
            setPage(1);
          }}
          onFirstPage={() => setPage(1)}
          onPreviousPage={() => setPage((current) => Math.max(1, current - 1))}
          onNextPage={() => setPage((current) => Math.min(totalPages, current + 1))}
          onLastPage={() => setPage(totalPages)}
        />

        <div className="mt-auto flex justify-end pt-[42px]">
          <button
            type="button"
            disabled={pendingOrderIds.length === 0}
            onClick={() => {
              pendingOrderIds.forEach((orderId) => {
                const order = receiveOrders.find((entry) => entry.id === orderId);
                if (!order || order.status !== "approved_finance") return;

              void receiveInventoryOrder({
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
            className="inline-flex h-[36px] items-center gap-[10px] rounded-[8px] bg-[#101828] px-[18px] text-[14px] font-medium text-white disabled:opacity-40"
          >
            <span>Submit for approval</span>
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </WorkspaceShell>
  );
}
