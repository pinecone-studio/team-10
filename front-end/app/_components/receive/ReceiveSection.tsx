"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { buildIntakeMetadataNote } from "../../_lib/intake-metadata";
import {
  createDemoReceivableOrder,
  createAssetIds,
  formatCurrency,
  receiveInventoryOrder,
  useOrdersStore,
} from "../../_lib/order-store";
import { useCatalogStore } from "../../_lib/catalog-store";
import { EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";
import { ReceiveAssetClassificationFields } from "./ReceiveAssetClassificationFields";
import { buildReceiveCatalogOptions } from "./receiveCatalogOptions";
import { ReceivePagination } from "./ReceivePagination";
import { ReceiveTable } from "./ReceiveTable";
import { ReceiveToolbar } from "./ReceiveToolbar";
import {
  buildQrToken,
  buildReceiveRows,
  buildSerialNumbers,
  ROWS_PER_PAGE_OPTIONS,
} from "./receiveData";
import type { ReceiveCondition } from "./receiveTypes";
import { BrandedQrCode } from "../shared/BrandedQrCode";
import { buildPendingAssetScanUrl } from "../../_lib/qr-links";

export function ReceiveSection() {
  const today = new Date().toISOString().slice(0, 10);
  const router = useRouter();
  const pathname = usePathname();
  const orders = useOrdersStore();
  const catalog = useCatalogStore();
  const receiveOrders = useMemo(
    () =>
      orders.filter((order) => {
        const isPersistedOrder = /^\d+$/.test(order.id.trim());
        return (
          isPersistedOrder &&
          (order.status === "approved_finance" ||
            order.status === "received_inventory" ||
            order.status === "assigned_hr")
        );
      }),
    [orders],
  );
  const rows = useMemo(() => buildReceiveRows(receiveOrders), [receiveOrders]);
  const [search, setSearch] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [completedRowIds, setCompletedRowIds] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] =
    useState<(typeof ROWS_PER_PAGE_OPTIONS)[number]>(10);
  const [page, setPage] = useState(1);
  const [receivedDate, setReceivedDate] = useState(today);
  const [receivedCondition, setReceivedCondition] =
    useState<ReceiveCondition>("good");
  const [quantityReceived, setQuantityReceived] = useState("1");
  const [receivedNote, setReceivedNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customTypesByCategory, setCustomTypesByCategory] = useState<Record<string, string[]>>(
    {},
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const activeRow = rows.find((row) => row.id === selectedRowId) ?? null;
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
  const catalogOptions = useMemo(() => buildReceiveCatalogOptions(catalog), [catalog]);
  const categoryOptions = useMemo(
    () =>
      [...new Set([...catalogOptions.categories, ...customCategories])].sort((left, right) =>
        left.localeCompare(right),
      ),
    [catalogOptions.categories, customCategories],
  );
  const typeOptions = useMemo(() => {
    if (!selectedCategory) return [];

    return [
      ...new Set([
        ...(catalogOptions.typesByCategory[selectedCategory] ?? []),
        ...(customTypesByCategory[selectedCategory] ?? []),
      ]),
    ].sort((left, right) => left.localeCompare(right));
  }, [catalogOptions.typesByCategory, customTypesByCategory, selectedCategory]);
  const generatedQrCodes = useMemo(() => {
    if (!activeRow) return [];
    const count = Math.max(1, Math.min(activeRow.quantity, Number(quantityReceived) || 1));
    return Array.from({ length: count }, (_, index) => {
      const serialNumber = `${activeRow.itemCode}-${String(index + 1).padStart(3, "0")}`;
      return {
        serialNumber,
        token: buildQrToken(activeRow.orderId, activeRow.itemCode, serialNumber),
      };
    });
  }, [activeRow, quantityReceived]);
  const currentRole =
    pathname.split("/").filter(Boolean)[0] === "systemAdmin" ? "systemAdmin" : "inventoryHead";
  const primaryQrEntry = generatedQrCodes[0] ?? null;
  const pendingQrLink =
    typeof window !== "undefined" && activeRow && primaryQrEntry
      ? buildPendingAssetScanUrl({
          token: primaryQrEntry.token,
          assetName: activeRow.assetName,
          serialNumber: primaryQrEntry.serialNumber,
          role: currentRole,
        })
      : "";

  function applyClassificationDefaults(row: (typeof rows)[number]) {
    const matchedProduct =
      catalog.products.find(
        (product) =>
          product.code === row.itemCode ||
          product.name.toLowerCase() === row.assetName.toLowerCase(),
      ) ?? null;
    const matchedCategoryName =
      matchedProduct
        ? catalog.categories.find((category) => category.id === matchedProduct.categoryId)?.name ?? ""
        : row.category;
    const matchedTypeName =
      matchedProduct
        ? catalog.itemTypes.find((itemType) => itemType.id === matchedProduct.itemTypeId)?.name ?? ""
        : "";

    const resolvedCategory = matchedCategoryName || row.category || "";
    setSelectedCategory(resolvedCategory);
    setSelectedType(matchedTypeName);
  }

  function handleAddCategory(value: string) {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    setCustomCategories((current) =>
      current.includes(trimmedValue) ? current : [...current, trimmedValue],
    );
    setSelectedCategory(trimmedValue);
    setSelectedType("");
  }

  function handleAddType(value: string) {
    const trimmedValue = value.trim();
    if (!trimmedValue || !selectedCategory) return;

    setCustomTypesByCategory((current) => {
      const existingTypes = current[selectedCategory] ?? [];
      return existingTypes.includes(trimmedValue)
        ? current
        : { ...current, [selectedCategory]: [...existingTypes, trimmedValue] };
    });
    setSelectedType(trimmedValue);
  }

  function fillReceiveDemo(row: (typeof rows)[number]) {
    setSelectedRowId(row.id);
    setReceivedDate(today);
    setReceivedCondition("good");
    setQuantityReceived(`${Math.max(1, row.quantity)}`);
    setReceivedNote(`Demo intake for ${row.assetName}.`);
    applyClassificationDefaults(row);
    setUploadedImage(null);
    setUploadedImageName(null);
  }

  async function handleQuickCreate() {
    const createdOrder = await createDemoReceivableOrder();
    const createdRow = buildReceiveRows([createdOrder])[0];
    if (!createdRow) {
      return;
    }

    fillReceiveDemo(createdRow);
  }

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() =>
                resetDetailState(
                  setSelectedRowId,
                  setSelectedCategory,
                  setSelectedType,
                  setUploadedImage,
                  setUploadedImageName,
                )
              }
              className="inline-flex w-fit items-center gap-2 text-[14px] font-medium text-[#344054]"
            >
              <span aria-hidden="true">{"<-"}</span>
              <span>Back to Receive</span>
            </button>
            <button
              type="button"
              onClick={() => fillReceiveDemo(activeRow)}
              className="fx-submit-button h-10 px-4 text-[13px] font-medium"
            >
              <span className="fx-submit-icon-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="fx-submit-icon"
                >
                  <path d="M12 3v18" />
                  <path d="M3 12h18" />
                </svg>
              </span>
              <span className="fx-submit-label">Demo Button</span>
            </button>
          </div>

          <div className="grid gap-[18px] xl:grid-cols-[minmax(0,1.15fr)_390px]">
            <div className="self-start rounded-[12px] border border-[#dcdfe4] bg-white p-[18px]">
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
              <div className="mt-[16px] overflow-hidden rounded-[16px] border border-[#dce6f3] bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_100%)]">
                {uploadedImage ? (
                  <div className="flex min-h-[280px] items-center justify-center bg-[radial-gradient(circle_at_top,#f8fbff_0%,#dbeafe_72%)] p-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImage}
                      alt={`${activeRow.assetName} upload`}
                      className="max-h-[240px] w-full rounded-[14px] object-contain shadow-[0_18px_45px_rgba(59,130,246,0.14)]"
                    />
                  </div>
                ) : activeProduct?.imageUrl ? (
                  <div className="flex min-h-[280px] items-center justify-center bg-[radial-gradient(circle_at_top,#f8fbff_0%,#dbeafe_72%)] p-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeProduct.imageUrl}
                      alt={activeRow.assetName}
                      className="max-h-[240px] w-full rounded-[14px] object-contain shadow-[0_18px_45px_rgba(59,130,246,0.14)]"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[280px] items-center justify-center p-6">
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
              <label className="mt-[12px] flex cursor-pointer items-center justify-center rounded-[10px] border border-dashed border-[#93c5fd] bg-[#f8fbff] px-4 py-3 text-[13px] font-medium text-[#2563eb]">
                Upload item image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setUploadedImage(String(reader.result));
                      setUploadedImageName(file.name);
                      setSubmitError(null);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>

            <div className="self-start rounded-[12px] border border-[#dcdfe4] bg-white p-[18px] xl:sticky xl:top-6">
              <h3 className="text-[18px] font-semibold text-[#101828]">
                Receive Details
              </h3>
              <div className="mt-[14px] space-y-[14px]">
                <div className="grid gap-[12px] sm:grid-cols-2">
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
                </div>
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
                <ReceiveAssetClassificationFields
                  department={activeRow.department}
                  categoryOptions={categoryOptions}
                  typeOptions={typeOptions}
                  selectedCategory={selectedCategory}
                  selectedType={selectedType}
                  onCategoryChange={(value) => {
                    setSelectedCategory(value);
                    setSelectedType("");
                  }}
                  onTypeChange={setSelectedType}
                  onAddCategory={handleAddCategory}
                  onAddType={handleAddType}
                />
                <div className="rounded-[12px] border border-[#dbe3ee] bg-[#f8fbff] p-4">
                  <p className="text-[13px] font-semibold text-[#0f172a]">QR code, serial number, and link</p>
                  <div className="mt-3 rounded-[10px] border border-[#dbeafe] bg-white p-3">
                    <div className="flex flex-col items-center gap-3">
                      <BrandedQrCode
                        value={pendingQrLink || primaryQrEntry?.token || activeRow.itemCode}
                        title={primaryQrEntry?.serialNumber ?? activeRow.itemCode}
                        size={132}
                        className="w-full max-w-[210px] shrink-0 p-2 shadow-none"
                        showValue={false}
                      />
                      <div className="w-full rounded-[12px] border border-[#e2e8f0] bg-[#f8fbff] px-3 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8fa0ba]">
                            QR Link
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              if (!pendingQrLink) return;
                              router.push(pendingQrLink);
                            }}
                            className="text-[11px] font-semibold text-[#2563eb] underline underline-offset-2"
                          >
                            Open
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!pendingQrLink) return;

                            try {
                              await navigator.clipboard.writeText(pendingQrLink);
                              window.alert("Successfully copied to clipboard");
                            } catch {
                              window.alert("Failed to copy QR link");
                            }
                          }}
                          className="mt-2 block w-full break-all text-left text-[11px] leading-5 text-[#475569] hover:text-[#2563eb]"
                        >
                          {pendingQrLink || primaryQrEntry?.token || activeRow.itemCode}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <Field label="Notes">
                  <textarea
                    value={receivedNote}
                    onChange={(event) => {
                      setReceivedNote(event.target.value);
                      setSubmitError(null);
                    }}
                    rows={3}
                    className="w-full rounded-[10px] border border-[#d0d5dd] px-[12px] py-[10px] text-[14px] outline-none"
                    placeholder="Add receive note..."
                  />
                </Field>
                {submitError ? (
                  <div className="rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-3 py-3 text-[13px] font-medium text-[#b42318]">
                    {submitError}
                  </div>
                ) : null}
                <button
                  type="button"
                  disabled={!activeRow.selectable || Number(quantityReceived) <= 0}
                  onClick={async () => {
                    setSubmitError(null);
                    const order = orders.find(
                      (entry) => entry.id === activeRow.orderId,
                    );

                    if (!order) {
                      setSubmitError("The selected order could not be found.");
                      return;
                    }

                    try {
                      const resolvedQuantity = Math.max(
                        1,
                        Math.min(activeRow.quantity, Number(quantityReceived) || 1),
                      );
                      await receiveInventoryOrder({
                        orderId: order.id,
                        catalogId:
                          activeProduct?.id ??
                          order.items.find(
                            (item) => item.code === activeRow.itemCode,
                          )?.catalogId ??
                          activeRow.itemCode,
                        itemCode: activeRow.itemCode,
                        quantityReceived: resolvedQuantity,
                        receivedAt: receivedDate,
                        receivedCondition:
                          receivedCondition === "good" ? "complete" : "issue",
                        receivedNote: buildIntakeMetadataNote({
                          note:
                            receivedNote.trim() ||
                            `Received ${activeRow.assetName} and completed intake.`,
                          department: activeRow.department,
                          category: selectedCategory,
                          itemType: selectedType,
                        }),
                        storageLocation: "Main warehouse / Intake",
                        assetImageDataUrl: uploadedImage,
                        assetImageFileName: uploadedImageName,
                        serialNumbers:
                          generatedQrCodes.length > 0
                            ? generatedQrCodes.map((entry) => entry.serialNumber)
                            : buildSerialNumbers(order),
                        assetIds: createAssetIds(
                          activeRow.assetName,
                          receivedDate,
                          resolvedQuantity,
                        ),
                      });

                      const nextCompletedRowIds = Array.from(
                        new Set([...completedRowIds, activeRow.id]),
                      );
                      setCompletedRowIds(nextCompletedRowIds);
                      resetDetailState(
                        setSelectedRowId,
                        setSelectedCategory,
                        setSelectedType,
                        setUploadedImage,
                        setUploadedImageName,
                      );
                    } catch (error) {
                      setSubmitError(
                        error instanceof Error
                          ? error.message
                          : "Failed to receive this asset.",
                      );
                    }
                  }}
                  className="fx-submit-button h-[48px] w-full px-4 text-[15px] font-medium"
                >
                  <span className="fx-submit-icon-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="fx-submit-icon"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                  <span className="fx-submit-label">
                    {activeRow.selectable ? "Receive item" : "Already received"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </WorkspaceShell>
    );
  }

  const approvedRows = filteredRows.filter((row) => row.selectable);
  const receivedRows = filteredRows.filter((row) => !row.selectable);
  const totalCost = filteredRows.reduce((sum, row) => sum + row.purchaseCost, 0);
  const totalReceivedQuantity = filteredRows.reduce((sum, row) => sum + row.received, 0);
  const summaryRequestLabel =
    approvedRows[0]?.requestNumber ?? receivedRows[0]?.requestNumber ?? "-";

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
          <SummaryCard label="Order ID" value={summaryRequestLabel} />
          <SummaryCard
            label="Status"
            value={approvedRows.length > 0 ? "Approved" : "Received"}
          />
          <SummaryCard
            label="Received"
            value={`${totalReceivedQuantity}/${filteredRows.reduce((sum, row) => sum + row.quantity, 0) || 0}`}
          />
          <SummaryCard
            label="Total Cost"
            value={formatCurrency(
              totalCost,
              filteredRows[0]?.currencyCode ?? "USD",
            )}
          />
        </div>

        <ReceiveToolbar
          search={search}
          onSearchChange={setSearch}
          onQuickCreate={handleQuickCreate}
        />

        <ReceiveTable
          rows={pagedRows}
          activeRowId={null}
          onOpenRow={(rowId) => {
            const row = rows.find((entry) => entry.id === rowId);
            setSelectedRowId(rowId);
            setReceivedDate(today);
            setQuantityReceived(`${row?.quantity ?? 1}`);
            setReceivedCondition("good");
            setReceivedNote("");
            setSubmitError(null);
            if (row) {
              applyClassificationDefaults(row);
            }
            setUploadedImage(null);
            setUploadedImageName(null);
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

function resetDetailState(
  setSelectedRowId: (value: string | null) => void,
  setSelectedCategory: (value: string) => void,
  setSelectedType: (value: string) => void,
  setUploadedImage: (value: string | null) => void,
  setUploadedImageName: (value: string | null) => void,
) {
  setSelectedRowId(null);
  setSelectedCategory("");
  setSelectedType("");
  setUploadedImage(null);
  setUploadedImageName(null);
}
