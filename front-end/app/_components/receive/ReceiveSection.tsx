"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  formatCurrency,
  receiveInventoryOrder,
  useOrdersStore,
} from "../../_lib/order-store";
import { useCatalogStore } from "../../_lib/catalog-store";
import { EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";
import { ReceivePagination } from "./ReceivePagination";
import { ReceiveTable } from "./ReceiveTable";
import { ReceiveToolbar } from "./ReceiveToolbar";
import {
  buildReceiveRows,
  buildSerialNumbers,
  ROWS_PER_PAGE_OPTIONS,
} from "./receiveData";
import type { ReceiveCondition } from "./receiveTypes";

export function ReceiveSection() {
  const router = useRouter();
  const pathname = usePathname();
  const orders = useOrdersStore();
  const catalog = useCatalogStore();
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
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [completedRowIds, setCompletedRowIds] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] =
    useState<(typeof ROWS_PER_PAGE_OPTIONS)[number]>(10);
  const [page, setPage] = useState(1);
  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [receivedCondition, setReceivedCondition] =
    useState<ReceiveCondition>("good");
  const [quantityReceived, setQuantityReceived] = useState("1");
  const [receivedNote, setReceivedNote] = useState("");

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return rows;
    return rows.filter(
      (row) =>
        row.assetName.toLowerCase().includes(normalizedSearch) ||
        row.category.toLowerCase().includes(normalizedSearch) ||
        row.requestNumber.toLowerCase().includes(normalizedSearch),
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, filteredRows, rowsPerPage]);

  const activeRow =
    rows.find((row) => row.id === selectedRowId) ?? null;
  const activeProduct = useMemo(
    () =>
      activeRow
        ? catalog.products.find(
            (product) =>
              product.code === activeRow.itemCode ||
              product.name.toLowerCase() === activeRow.assetName.toLowerCase(),
          ) ?? null
        : null,
    [activeRow, catalog.products],
  );

  if (rows.length === 0) {
    return (
      <WorkspaceShell
        title="Receive and serialize"
        subtitle="Each item is recorded, verified, and serialized."
        contentAlignment="center"
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

  if (activeRow) {
    return (
      <WorkspaceShell
        title="Receive and serialize"
        subtitle="Complete intake details for the selected item."
        contentAlignment="center"
        contentWidthClassName="max-w-[1138px]"
        outerClassName="px-[34px] py-[28px]"
      >
        <div className="flex min-h-[calc(100vh-180px)] flex-col gap-[18px]">
          <button
            type="button"
            onClick={() => setSelectedRowId(null)}
            className="inline-flex w-fit items-center gap-2 text-[14px] font-medium text-[#344054]"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Receive</span>
          </button>

          <div className="grid gap-[18px] xl:grid-cols-[minmax(0,1.1fr)_420px]">
            <div className="rounded-[12px] border border-[#dcdfe4] bg-white p-[18px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">
                Ordered list
              </p>
              <h2 className="mt-[10px] text-[22px] font-semibold text-[#101828]">
                {activeRow.assetName}
              </h2>
              <div className="mt-[14px] grid gap-[12px] sm:grid-cols-2">
                <Info label="Order ID" value={activeRow.requestNumber} />
                <Info label="Item code" value={activeRow.itemCode} />
                <Info label="Expected date" value={activeRow.expectedDate} />
                <Info
                  label="Purchase cost"
                  value={formatCurrency(activeRow.purchaseCost, activeRow.currencyCode)}
                />
                <Info label="Ordered quantity" value={`${activeRow.quantity}`} />
                <Info
                  label="Order progress"
                  value={`${completedRowIds.filter((rowId) => rows.some((row) => row.id === rowId && row.orderId === activeRow.orderId)).length}/${rows.filter((row) => row.orderId === activeRow.orderId).length} items`}
                />
              </div>
              <div className="mt-[16px] overflow-hidden rounded-[12px] border border-[#dce6f3] bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_100%)]">
                {activeProduct?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeProduct.imageUrl}
                    alt={activeRow.assetName}
                    className="h-[220px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[220px] items-center justify-center">
                    <div className="rounded-[18px] border border-white/60 bg-white/70 px-6 py-5 text-center shadow-[0_16px_40px_rgba(59,130,246,0.18)]">
                      <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#60a5fa]">
                        Item Preview
                      </div>
                      <div className="mt-3 text-[18px] font-semibold text-[#0f172a]">
                        {activeRow.assetName}
                      </div>
                      <div className="mt-2 text-[13px] text-[#475569]">
                        {activeRow.itemCode}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[12px] border border-[#dcdfe4] bg-white p-[18px]">
              <h3 className="text-[18px] font-semibold text-[#101828]">
                Receive Details
              </h3>
              <div className="mt-[14px] space-y-[14px]">
                <Field label="Received date">
                  <input
                    value={receivedDate}
                    onChange={(event) => setReceivedDate(event.target.value)}
                    type="date"
                    className="h-[42px] w-full rounded-[10px] border border-[#d0d5dd] px-[12px] text-[14px] outline-none"
                  />
                </Field>
                <Field label="Condition on arrival">
                  <select
                    value={receivedCondition}
                    onChange={(event) =>
                      setReceivedCondition(event.target.value as ReceiveCondition)
                    }
                    className="h-[42px] w-full rounded-[10px] border border-[#d0d5dd] px-[12px] text-[14px] outline-none"
                  >
                    <option value="good">Good</option>
                    <option value="damaged">Damaged</option>
                    <option value="defective">Defective</option>
                    <option value="missing">Missing</option>
                  </select>
                </Field>
                <Field label="Quantity received">
                  <input
                    value={quantityReceived}
                    onChange={(event) => setQuantityReceived(event.target.value)}
                    type="number"
                    min="1"
                    max={activeRow.quantity}
                    className="h-[42px] w-full rounded-[10px] border border-[#d0d5dd] px-[12px] text-[14px] outline-none"
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    value={receivedNote}
                    onChange={(event) => setReceivedNote(event.target.value)}
                    rows={4}
                    className="w-full rounded-[10px] border border-[#d0d5dd] px-[12px] py-[10px] text-[14px] outline-none"
                    placeholder="Add receive note..."
                  />
                </Field>
                <button
                  type="button"
                  disabled={!activeRow.selectable || Number(quantityReceived) <= 0}
                  onClick={async () => {
                    const nextCompletedRowIds = Array.from(
                      new Set([...completedRowIds, activeRow.id]),
                    );
                    setCompletedRowIds(nextCompletedRowIds);
                    const order = receiveOrders.find(
                      (entry) => entry.id === activeRow.orderId,
                    );
                    if (order) {
                      await receiveInventoryOrder({
                        orderId: order.id,
                        receivedAt: receivedDate,
                        receivedCondition:
                          receivedCondition === "good" ? "complete" : "issue",
                        receivedNote:
                          receivedNote.trim() ||
                          `Received ${activeRow.assetName} and completed intake.`,
                        storageLocation: "Main warehouse / Intake",
                        serialNumbers: buildSerialNumbers(order),
                      });
                    }

                    router.push(`${pathname}?section=storage`);
                  }}
                  className="inline-flex h-[42px] w-full items-center justify-center rounded-[10px] bg-[#101828] px-[16px] text-[14px] font-medium text-white disabled:opacity-40"
                >
                  {activeRow.selectable ? "Receive item" : "Already received"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </WorkspaceShell>
    );
  }

  const approvedRows = filteredRows.filter((row) => row.selectable);
  const totalCost = approvedRows.reduce((sum, row) => sum + row.purchaseCost, 0);

  return (
    <WorkspaceShell
      title="Receive"
      subtitle="Each item is recorded, verified, and serialized."
      contentAlignment="center"
      contentWidthClassName="max-w-[1138px]"
      outerClassName="px-[34px] py-[28px]"
    >
      <div className="flex min-h-[calc(100vh-180px)] flex-col">
        <div className="grid gap-[14px] md:grid-cols-4">
          <SummaryCard label="Order ID" value={approvedRows[0]?.requestNumber ?? "-"} />
          <SummaryCard label="Status" value="Approved" />
          <SummaryCard
            label="Received"
            value={`${completedRowIds.length}/${approvedRows.length || 0}`}
          />
          <SummaryCard
            label="Total Cost"
            value={formatCurrency(totalCost, approvedRows[0]?.currencyCode ?? "USD")}
          />
        </div>

        <ReceiveToolbar search={search} onSearchChange={setSearch} />

        <ReceiveTable
          rows={pagedRows}
          activeRowId={null}
          onOpenRow={(rowId) => {
            const row = rows.find((entry) => entry.id === rowId);
            setSelectedRowId(rowId);
            setQuantityReceived(`${row?.quantity ?? 1}`);
            setReceivedCondition("good");
            setReceivedNote("");
          }}
        />

        <ReceivePagination
          selectedCount={completedRowIds.length}
          totalSelectableCount={approvedRows.length}
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
      </div>
    </WorkspaceShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-[6px] block text-[12px] font-medium text-[#344054]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[#eaecf0] bg-white px-[12px] py-[10px]">
      <p className="text-[11px] text-[#98a2b3]">{label}</p>
      <p className="mt-[4px] text-[14px] font-medium text-[#101828]">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#dce6f3] bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-[16px] py-[14px] shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
      <p className="text-[12px] text-[#8fa0ba]">{label}</p>
      <p className="mt-[6px] text-[22px] font-semibold text-[#3b82f6]">{value}</p>
    </div>
  );
}
