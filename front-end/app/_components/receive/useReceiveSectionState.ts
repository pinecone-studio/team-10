"use client";

import { useMemo, useState } from "react";
import { useCatalogStore } from "../../_lib/catalog-store";
import { buildIntakeMetadataNote } from "../../_lib/intake-metadata";
import { createAssetIds, createDemoReceivableOrder, receiveInventoryOrder, useOrdersStore } from "../../_lib/order-store";
import { buildReceiveCatalogOptions } from "./receiveCatalogOptions";
import { buildQrToken, buildReceiveRows, buildSerialNumbers, ROWS_PER_PAGE_OPTIONS } from "./receiveData";
import {
  buildReceiveSpecificationFields,
  getSuggestedSpecificationNames,
  type ReceiveSpecificationField,
} from "./receiveSpecifications";
import type { ReceiveCondition, ReceiveStatusFilterValue } from "./receiveTypes";

export function useReceiveSectionState() {
  const today = new Date().toISOString().slice(0, 10);
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
  const [uploadedImageFileName, setUploadedImageFileName] = useState<string | null>(null);
  const [specificationFields, setSpecificationFields] = useState<ReceiveSpecificationField[]>([]);

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
  const suggestedSpecificationFields = useMemo(
    () =>
      activeRow
        ? getSuggestedSpecificationNames(
            selectedCategory,
            selectedType,
            activeRow.assetName,
          ).filter(
            (name) =>
              !specificationFields.some(
                (field) => field.name.trim().toLowerCase() === name.trim().toLowerCase(),
              ),
          )
        : [],
    [activeRow, selectedCategory, selectedType, specificationFields],
  );
  const generatedQrCodes = useMemo(() => !activeRow ? [] : Array.from({ length: Math.max(1, Math.min(activeRow.quantity, Number(quantityReceived) || 1)) }, (_, index) => ({ serialNumber: `${activeRow.itemCode}-${String(index + 1).padStart(3, "0")}`, token: buildQrToken(activeRow.orderId, activeRow.itemCode, `${activeRow.itemCode}-${String(index + 1).padStart(3, "0")}`) })), [activeRow, quantityReceived]);
  const approvedRows = filteredRows.filter((row) => row.selectable);
  const receivedRows = filteredRows.filter((row) => !row.selectable);
  const totalCost = filteredRows.reduce((sum, row) => sum + row.purchaseCost, 0);
  const totalReceivedQuantity = filteredRows.reduce((sum, row) => sum + row.received, 0);
  const totalQuantity = filteredRows.reduce((sum, row) => sum + row.quantity, 0);
  const summaryRequestLabel = approvedRows[0]?.requestNumber ?? receivedRows[0]?.requestNumber ?? "-";

  function resolveMatchedProduct(row: (typeof rows)[number]) {
    return catalog.products.find((product) => product.code === row.itemCode || product.name.toLowerCase() === row.assetName.toLowerCase()) ?? null;
  }
  function syncSpecificationFields(nextCategory: string, nextType: string, row: (typeof rows)[number], current = specificationFields) {
    setSpecificationFields(buildReceiveSpecificationFields({ product: resolveMatchedProduct(row), category: nextCategory, itemType: nextType, assetName: row.assetName, current }));
  }
  function refillMockSpecifications(row: (typeof rows)[number]) {
    setSpecificationFields((current) =>
      buildReceiveSpecificationFields({
        product: resolveMatchedProduct(row),
        category: selectedCategory,
        itemType: selectedType,
        assetName: row.assetName,
        current,
        preferSuggestedValues: true,
      }),
    );
  }
  function applyClassificationDefaults(row: (typeof rows)[number]) {
    const matchedProduct = resolveMatchedProduct(row);
    const matchedCategoryName = matchedProduct ? catalog.categories.find((category) => category.id === matchedProduct.categoryId)?.name ?? "" : row.category;
    const matchedTypeName = matchedProduct ? catalog.itemTypes.find((itemType) => itemType.id === matchedProduct.itemTypeId)?.name ?? "" : "";
    setSelectedCategory(matchedCategoryName || row.category || "");
    setSelectedType(matchedTypeName);
    setSpecificationFields(buildReceiveSpecificationFields({ product: matchedProduct, category: matchedCategoryName || row.category || "", itemType: matchedTypeName, assetName: row.assetName }));
  }

  function resetDetailState() {
    setSelectedRowId(null); setSelectedCategory(""); setSelectedType(""); setUploadedImage(null); setUploadedImageFileName(null); setSpecificationFields([]);
  }
  function openRow(rowId: string) {
    const row = rows.find((entry) => entry.id === rowId);
    setSelectedRowId(rowId); setReceivedDate(today); setQuantityReceived("1"); setReceivedCondition("good"); setReceivedNote(""); if (row) applyClassificationDefaults(row); setUploadedImage(null); setUploadedImageFileName(null);
  }
  async function handleQuickCreate() {
    if (activeRow) {
      refillMockSpecifications(activeRow);
      setReceivedNote(`Demo intake for ${activeRow.assetName}.`);
      return;
    }
    const createdOrder = await createDemoReceivableOrder();
    const createdRow = buildReceiveRows([createdOrder])[0];
    if (createdRow) {
      setSelectedRowId(createdRow.id); setReceivedDate(today); setReceivedCondition("good"); setQuantityReceived("1"); setReceivedNote(`Demo intake for ${createdRow.assetName}.`); applyClassificationDefaults(createdRow); setUploadedImage(null); setUploadedImageFileName(null);
    }
  }
  function handleAddCategory(value: string) {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    setCustomCategories((current) => current.includes(trimmedValue) ? current : [...current, trimmedValue]);
    setSelectedCategory(trimmedValue);
    setSelectedType("");
    if (activeRow) syncSpecificationFields(trimmedValue, "", activeRow);
  }
  function handleAddType(value: string) {
    const trimmedValue = value.trim();
    if (!trimmedValue || !selectedCategory) return;
    setCustomTypesByCategory((current) => ({ ...current, [selectedCategory]: (current[selectedCategory] ?? []).includes(trimmedValue) ? current[selectedCategory] ?? [] : [...(current[selectedCategory] ?? []), trimmedValue] }));
    setSelectedType(trimmedValue);
    if (activeRow) syncSpecificationFields(selectedCategory, trimmedValue, activeRow);
  }
  function handleCategoryChange(value: string) {
    setSelectedCategory(value);
    setSelectedType("");
    if (activeRow) syncSpecificationFields(value, "", activeRow);
  }
  function handleTypeChange(value: string) {
    setSelectedType(value);
    if (activeRow) syncSpecificationFields(selectedCategory, value, activeRow);
  }
  function handleQuantityReceivedChange(value: string) {
    if (!activeRow) {
      setQuantityReceived(value);
      return;
    }
    const numericValue = Number(value);
    if (!value.trim()) {
      setQuantityReceived("");
      return;
    }
    if (!Number.isFinite(numericValue)) return;
    const nextValue = Math.max(1, Math.min(activeRow.quantity, Math.trunc(numericValue)));
    setQuantityReceived(String(nextValue));
  }
  function handleAddCustomField(name: string) {
    setSpecificationFields((current) => buildReceiveSpecificationFields({
      product: activeRow ? resolveMatchedProduct(activeRow) : null,
      category: selectedCategory,
      itemType: selectedType,
      assetName: activeRow?.assetName ?? "",
      current: [...current, { id: `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`, name, value: "", source: "custom", removable: true }],
    }));
  }
  function handleSpecificationChange(id: string, value: string) {
    setSpecificationFields((current) => current.map((field) => field.id === id ? { ...field, value } : field));
  }
  function handleRemoveSpecification(id: string) {
    setSpecificationFields((current) => current.filter((field) => field.id !== id));
  }
  function handleUploadImage(file: File) { const reader = new FileReader(); setUploadedImageFileName(file.name); reader.onload = () => setUploadedImage(String(reader.result)); reader.readAsDataURL(file); }
  async function handleSubmitReceive() {
    if (!activeRow) return;
    setCompletedRowIds((current) => Array.from(new Set([...current, activeRow.id])));
    const order = orders.find((entry) => entry.id === activeRow.orderId);
    if (!order) return;
    const resolvedQuantity = Math.max(1, Math.min(activeRow.quantity, Number(quantityReceived) || 1));
    await receiveInventoryOrder({ orderId: order.id, catalogId: activeProduct?.id ?? order.items.find((item) => item.code === activeRow.itemCode)?.catalogId ?? activeRow.itemCode, itemCode: activeRow.itemCode, quantityReceived: resolvedQuantity, receivedAt: receivedDate, receivedCondition: receivedCondition === "good" ? "complete" : "issue", receivedNote: buildIntakeMetadataNote({ note: receivedNote.trim() || `Received ${activeRow.assetName} and completed intake.`, department: activeRow.department, category: selectedCategory, itemType: selectedType, specifications: specificationFields.map((field) => ({ name: field.name, value: field.value })) }), storageLocation: "Main warehouse / Intake", assetImageDataUrl: uploadedImage, assetImageFileName: uploadedImageFileName, serialNumbers: generatedQrCodes.length > 0 ? generatedQrCodes.map((entry) => entry.serialNumber) : buildSerialNumbers(order), assetIds: createAssetIds(activeRow.assetName, receivedDate, resolvedQuantity) });
    resetDetailState();
  }

  return { rows, search, setSearch, completedRowIds, rowsPerPage, setRowsPerPage, page, setPage, currentPage, totalPages, expectedDateSortDirection, setExpectedDateSortDirection, statusFilter, setStatusFilter, receivedDate, setReceivedDate, receivedCondition, setReceivedCondition, quantityReceived, setQuantityReceived: handleQuantityReceivedChange, receivedNote, setReceivedNote, selectedCategory, setSelectedCategory, selectedType, setSelectedType, specificationFields, suggestedSpecificationFields, uploadedImage, activeRow, activeProduct, categoryOptions, typeOptions, pagedRows, approvedRows, totalCost, totalReceivedQuantity, totalQuantity, summaryRequestLabel, handleQuickCreate, handleAddCategory, handleAddType, handleCategoryChange, handleTypeChange, handleAddCustomField, handleSpecificationChange, handleRemoveSpecification, handleUploadImage, handleSubmitReceive, openRow, resetDetailState, ROWS_PER_PAGE_OPTIONS };
}
