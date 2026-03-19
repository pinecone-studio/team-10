"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCatalogStore } from "../../_lib/catalog-store";
import { buildIntakeMetadataNote } from "../../_lib/intake-metadata";
import { buildPendingAssetScanUrl } from "../../_lib/qr-links";
import { createAssetIds, createDemoReceivableOrder, receiveInventoryOrder, useOrdersStore } from "../../_lib/order-store";
import { buildReceiveCatalogOptions } from "./receiveCatalogOptions";
import { buildQrToken, buildReceiveRows, buildSerialNumbers, ROWS_PER_PAGE_OPTIONS } from "./receiveData";
import type { ReceiveCondition, ReceiveStatusFilterValue } from "./receiveTypes";

export function useReceiveSectionState() {
  const today = new Date().toISOString().slice(0, 10);
  const router = useRouter();
  const pathname = usePathname();
  const orders = useOrdersStore();
  const catalog = useCatalogStore();
  const rows = useMemo(() => buildReceiveRows(orders.filter((order) => ["approved_finance", "received_inventory", "assigned_hr"].includes(order.status))), [orders]);
  const [search, setSearch] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [completedRowIds, setCompletedRowIds] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<(typeof ROWS_PER_PAGE_OPTIONS)[number]>(10);
  const [page, setPage] = useState(1);
  const [expectedDateSortDirection, setExpectedDateSortDirection] = useState<"desc" | "asc">("desc");
  const [statusFilter, setStatusFilter] = useState<ReceiveStatusFilterValue>("all");
  const [receivedDate, setReceivedDate] = useState(today);
  const [receivedCondition, setReceivedCondition] = useState<ReceiveCondition>("good");
  const [quantityReceived, setQuantityReceived] = useState("1");
  const [receivedNote, setReceivedNote] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [customTypesByCategory, setCustomTypesByCategory] = useState<Record<string, string[]>>({});
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !normalizedSearch || [row.assetName, row.category, row.requestNumber].join(" ").toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || row.condition === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);
  const sortedRows = useMemo(() => [...filteredRows].sort((left, right) => expectedDateSortDirection === "desc" ? right.expectedDate.localeCompare(left.expectedDate) : left.expectedDate.localeCompare(right.expectedDate)), [expectedDateSortDirection, filteredRows]);
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pagedRows = useMemo(() => sortedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage), [currentPage, rowsPerPage, sortedRows]);
  const activeRow = rows.find((row) => row.id === selectedRowId) ?? null;
  const activeProduct = useMemo(() => activeRow ? catalog.products.find((product) => product.code === activeRow.itemCode || product.name.toLowerCase() === activeRow.assetName.toLowerCase()) ?? null : null, [activeRow, catalog.products]);
  const catalogOptions = useMemo(() => buildReceiveCatalogOptions(catalog), [catalog]);
  const categoryOptions = useMemo(() => [...new Set([...catalogOptions.categories, ...customCategories])].sort((left, right) => left.localeCompare(right)), [catalogOptions.categories, customCategories]);
  const typeOptions = useMemo(() => selectedCategory ? [...new Set([...(catalogOptions.typesByCategory[selectedCategory] ?? []), ...(customTypesByCategory[selectedCategory] ?? [])])].sort((left, right) => left.localeCompare(right)) : [], [catalogOptions.typesByCategory, customTypesByCategory, selectedCategory]);
  const generatedQrCodes = useMemo(() => !activeRow ? [] : Array.from({ length: Math.max(1, Math.min(activeRow.quantity, Number(quantityReceived) || 1)) }, (_, index) => ({ serialNumber: `${activeRow.itemCode}-${String(index + 1).padStart(3, "0")}`, token: buildQrToken(activeRow.orderId, activeRow.itemCode, `${activeRow.itemCode}-${String(index + 1).padStart(3, "0")}`) })), [activeRow, quantityReceived]);
  const currentRole = pathname.split("/").filter(Boolean)[0] === "systemAdmin" ? "systemAdmin" : "inventoryHead";
  const primaryQrEntry = generatedQrCodes[0] ?? null;
  const pendingQrLink = typeof window !== "undefined" && activeRow && primaryQrEntry ? buildPendingAssetScanUrl({ token: primaryQrEntry.token, assetName: activeRow.assetName, serialNumber: primaryQrEntry.serialNumber, role: currentRole }) : "";
  const approvedRows = filteredRows.filter((row) => row.selectable);
  const receivedRows = filteredRows.filter((row) => !row.selectable);
  const totalCost = filteredRows.reduce((sum, row) => sum + row.purchaseCost, 0);
  const totalReceivedQuantity = filteredRows.reduce((sum, row) => sum + row.received, 0);
  const totalQuantity = filteredRows.reduce((sum, row) => sum + row.quantity, 0);
  const summaryRequestLabel = approvedRows[0]?.requestNumber ?? receivedRows[0]?.requestNumber ?? "-";

  function applyClassificationDefaults(row: (typeof rows)[number]) {
    const matchedProduct = catalog.products.find((product) => product.code === row.itemCode || product.name.toLowerCase() === row.assetName.toLowerCase()) ?? null;
    const matchedCategoryName = matchedProduct ? catalog.categories.find((category) => category.id === matchedProduct.categoryId)?.name ?? "" : row.category;
    const matchedTypeName = matchedProduct ? catalog.itemTypes.find((itemType) => itemType.id === matchedProduct.itemTypeId)?.name ?? "" : "";
    setSelectedCategory(matchedCategoryName || row.category || "");
    setSelectedType(matchedTypeName);
  }

  function resetDetailState() {
    setSelectedRowId(null); setSelectedCategory(""); setSelectedType(""); setUploadedImage(null);
  }
  function openRow(rowId: string) {
    const row = rows.find((entry) => entry.id === rowId);
    setSelectedRowId(rowId); setReceivedDate(today); setQuantityReceived(`${row?.quantity ?? 1}`); setReceivedCondition("good"); setReceivedNote(""); if (row) applyClassificationDefaults(row); setUploadedImage(null);
  }
  async function handleQuickCreate() {
    const createdOrder = await createDemoReceivableOrder();
    const createdRow = buildReceiveRows([createdOrder])[0];
    if (createdRow) {
      setSelectedRowId(createdRow.id); setReceivedDate(today); setReceivedCondition("good"); setQuantityReceived(`${Math.max(1, createdRow.quantity)}`); setReceivedNote(`Demo intake for ${createdRow.assetName}.`); applyClassificationDefaults(createdRow); setUploadedImage(null);
    }
  }
  function handleAddCategory(value: string) { const trimmedValue = value.trim(); if (!trimmedValue) return; setCustomCategories((current) => current.includes(trimmedValue) ? current : [...current, trimmedValue]); setSelectedCategory(trimmedValue); setSelectedType(""); }
  function handleAddType(value: string) { const trimmedValue = value.trim(); if (!trimmedValue || !selectedCategory) return; setCustomTypesByCategory((current) => ({ ...current, [selectedCategory]: (current[selectedCategory] ?? []).includes(trimmedValue) ? current[selectedCategory] ?? [] : [...(current[selectedCategory] ?? []), trimmedValue] })); setSelectedType(trimmedValue); }
  function handleUploadImage(file: File) { const reader = new FileReader(); reader.onload = () => setUploadedImage(String(reader.result)); reader.readAsDataURL(file); }
  async function handleCopyQrLink() { if (!pendingQrLink) return; try { await navigator.clipboard.writeText(pendingQrLink); window.alert("Successfully copied to clipboard"); } catch { window.alert("Failed to copy QR link"); } }
  function handleOpenQrLink() { if (pendingQrLink) router.push(pendingQrLink); }
  async function handleSubmitReceive() {
    if (!activeRow) return;
    setCompletedRowIds((current) => Array.from(new Set([...current, activeRow.id])));
    const order = orders.find((entry) => entry.id === activeRow.orderId);
    if (!order) return;
    const resolvedQuantity = Math.max(1, Math.min(activeRow.quantity, Number(quantityReceived) || 1));
    await receiveInventoryOrder({ orderId: order.id, catalogId: activeProduct?.id ?? order.items.find((item) => item.code === activeRow.itemCode)?.catalogId ?? activeRow.itemCode, itemCode: activeRow.itemCode, quantityReceived: resolvedQuantity, receivedAt: receivedDate, receivedCondition: receivedCondition === "good" ? "complete" : "issue", receivedNote: buildIntakeMetadataNote({ note: receivedNote.trim() || `Received ${activeRow.assetName} and completed intake.`, department: activeRow.department, category: selectedCategory, itemType: selectedType }), storageLocation: "Main warehouse / Intake", serialNumbers: generatedQrCodes.length > 0 ? generatedQrCodes.map((entry) => entry.serialNumber) : buildSerialNumbers(order), assetIds: createAssetIds(activeRow.assetName, receivedDate, resolvedQuantity) });
    resetDetailState();
  }

  return { rows, search, setSearch, completedRowIds, rowsPerPage, setRowsPerPage, page, setPage, currentPage, totalPages, expectedDateSortDirection, setExpectedDateSortDirection, statusFilter, setStatusFilter, receivedDate, setReceivedDate, receivedCondition, setReceivedCondition, quantityReceived, setQuantityReceived, receivedNote, setReceivedNote, selectedCategory, setSelectedCategory, selectedType, setSelectedType, uploadedImage, activeRow, activeProduct, categoryOptions, typeOptions, pendingQrLink, primaryQrEntry, pagedRows, approvedRows, totalCost, totalReceivedQuantity, totalQuantity, summaryRequestLabel, handleQuickCreate, handleAddCategory, handleAddType, handleUploadImage, handleCopyQrLink, handleOpenQrLink, handleSubmitReceive, openRow, resetDetailState, ROWS_PER_PAGE_OPTIONS };
}
