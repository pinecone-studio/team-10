/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  createCatalogProduct,
  suggestCatalogProductCode,
  updateCatalogProduct,
  useCatalogStore,
} from "../../_lib/catalog-store";
import {
  currencyOptions,
  getCurrencySymbol,
} from "../../_lib/order-format";
import {
  findDuplicateCatalogAttributeName,
  formatCatalogAttributeText,
} from "../../_lib/order-catalog";
import type {
  CatalogProductAttribute,
  CurrencyCode,
  GoodsCatalogItem,
} from "../../_lib/order-types";
import { ActionButton } from "../shared/WorkspacePrimitives";
import { InputField, SelectInput, TextInput } from "./OrderPrimitives";

type DraftAttribute = CatalogProductAttribute;

type OrderCatalogProductDialogProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  categoryId: string;
  productId: string | null;
  onClose: () => void;
  onSelectCatalogProduct: (productId: string) => void;
};

type CatalogProductDialogContentProps = Omit<
  OrderCatalogProductDialogProps,
  "isOpen"
> & {
  initialProduct: GoodsCatalogItem | null;
};

function createAttributeId() {
  return `draft-attribute-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptyAttribute(): DraftAttribute {
  return {
    id: createAttributeId(),
    name: "",
    value: "",
  };
}

function CatalogFormHeader({
  mode,
  onClose,
}: {
  mode: "create" | "edit";
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-[16px] border-b border-[#eceff3] pb-[14px]">
      <div>
        <h3 className="text-[16px] font-semibold text-[#16181d]">
          {mode === "edit" ? "Edit Details" : "Add New Product"}
        </h3>
        <p className="mt-[4px] text-[12px] text-[#7f8894]">
          {mode === "edit"
            ? "Update the catalog product so the order picker stays in sync."
            : "Add a new catalog product so it can be reused in future orders."}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-[36px] w-[36px] cursor-pointer items-center justify-center rounded-[10px] border border-[#d8dde3] text-[18px] leading-none text-[#7f8894]"
        aria-label="Close product dialog"
      >
        X
      </button>
    </div>
  );
}

export function OrderCatalogProductDialog(props: OrderCatalogProductDialogProps) {
  const catalog = useCatalogStore();
  const initialProduct =
    props.mode === "edit"
      ? catalog.products.find((product) => product.id === props.productId) ?? null
      : null;

  if (!props.isOpen) return null;

  return (
    <CatalogProductDialogContent
      key={`${props.mode}-${props.productId ?? "new"}-${props.categoryId}`}
      {...props}
      initialProduct={initialProduct}
    />
  );
}

function CatalogProductDialogContent({
  mode,
  categoryId,
  productId,
  initialProduct,
  onClose,
  onSelectCatalogProduct,
}: CatalogProductDialogContentProps) {
  const catalog = useCatalogStore();
  const fileInputId = useId();
  const itemTypeSuggestionsId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const deleteMenuRef = useRef<HTMLDivElement | null>(null);

  const initialCategoryId =
    initialProduct?.categoryId ?? categoryId ?? catalog.categories[0]?.id ?? "";
  const initialItemTypeName =
    catalog.itemTypes.find((itemType) => itemType.id === initialProduct?.itemTypeId)
      ?.name ??
    catalog.itemTypes.find((itemType) => itemType.categoryId === initialCategoryId)
      ?.name ??
    "";

  const [name, setName] = useState(initialProduct?.name ?? "");
  const [code, setCode] = useState(initialProduct?.code ?? "");
  const [selectedCategoryId, setSelectedCategoryId] = useState(initialCategoryId);
  const [itemTypeName, setItemTypeName] = useState(initialItemTypeName);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<
    CurrencyCode | ""
  >(initialProduct?.currencyCode ?? "");
  const [price, setPrice] = useState(
    initialProduct?.defaultPrice !== undefined
      ? `${initialProduct.defaultPrice}`
      : "",
  );
  const [description, setDescription] = useState(
    initialProduct?.description ?? "",
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialProduct?.imageUrl ?? null,
  );
  const [attributes, setAttributes] = useState<DraftAttribute[]>(
    initialProduct && initialProduct.attributes.length > 0
      ? initialProduct.attributes.map((attribute) => ({ ...attribute }))
      : [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCodeDirty, setIsCodeDirty] = useState(Boolean(initialProduct));
  const [isDeleteMenuOpen, setIsDeleteMenuOpen] = useState(false);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);

  const availableItemTypes = useMemo(
    () =>
      catalog.itemTypes.filter(
        (itemType) => itemType.categoryId === selectedCategoryId,
      ),
    [catalog.itemTypes, selectedCategoryId],
  );
  const duplicateAttributeName = useMemo(
    () =>
      findDuplicateCatalogAttributeName(
        attributes.map((attribute) => attribute.name),
      ),
    [attributes],
  );
  const activeSelectedAttributeIds = useMemo(
    () =>
      selectedAttributeIds.filter((attributeId) =>
        attributes.some((attribute) => attribute.id === attributeId),
      ),
    [attributes, selectedAttributeIds],
  );

  useEffect(() => {
    if (!isDeleteMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        deleteMenuRef.current &&
        !deleteMenuRef.current.contains(event.target as Node)
      ) {
        setIsDeleteMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDeleteMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDeleteMenuOpen]);

  function handleNameChange(value: string) {
    setName(value);
    if (!isCodeDirty && value.trim()) {
      setCode(suggestCatalogProductCode(value, productId ?? undefined));
    }
  }

  function handleAttributeChange(
    attributeId: string,
    key: "name" | "value",
    value: string,
  ) {
    const nextValue = formatCatalogAttributeText(value);
    setAttributes((current) =>
      current.map((attribute) =>
        attribute.id === attributeId
          ? { ...attribute, [key]: nextValue }
          : attribute,
      ),
    );
    setErrorMessage("");
  }

  function handleAddAttribute() {
    setAttributes((current) => [...current, createEmptyAttribute()]);
    setErrorMessage("");
  }

  function removeAttributes(attributeIds: string[]) {
    const attributeIdSet = new Set(attributeIds);

    setAttributes((current) => {
      const nextAttributes = current.filter(
        (attribute) => !attributeIdSet.has(attribute.id),
      );
      if (nextAttributes.length === 0) {
        setIsDeleteMenuOpen(false);
      }
      return nextAttributes;
    });
    setSelectedAttributeIds((current) =>
      current.filter((attributeId) => !attributeIdSet.has(attributeId)),
    );
    setErrorMessage("");
  }

  function handleToggleAttributeSelection(attributeId: string) {
    setSelectedAttributeIds((current) =>
      current.includes(attributeId)
        ? current.filter((currentId) => currentId !== attributeId)
        : [...current, attributeId],
    );
  }

  function handleDeleteSelectedAttributes() {
    if (activeSelectedAttributeIds.length === 0) return;
    removeAttributes(activeSelectedAttributeIds);
  }

  function handleDeleteAllAttributes() {
    setAttributes([]);
    setSelectedAttributeIds([]);
    setIsDeleteMenuOpen(false);
    setErrorMessage("");
  }

  function handleCategoryChange(nextCategoryId: string) {
    setSelectedCategoryId(nextCategoryId);
    setItemTypeName((current) => {
      if (current.trim().length > 0) return current;
      return (
        catalog.itemTypes.find((itemType) => itemType.categoryId === nextCategoryId)
          ?.name ?? ""
      );
    });
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(nextStatus: GoodsCatalogItem["status"]) {
    setErrorMessage("");

    const parsedPrice = Number(price);
    if (!name.trim()) {
      setErrorMessage("Product name is required.");
      return;
    }

    if (!code.trim()) {
      setErrorMessage("Product code is required.");
      return;
    }

    if (!selectedCategoryId || !itemTypeName.trim()) {
      setErrorMessage("Choose both a category and a type.");
      return;
    }

    if (!selectedCurrencyCode) {
      setErrorMessage("Choose a currency before entering pricing.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setErrorMessage("Pricing must be a valid non-negative number.");
      return;
    }

    if (duplicateAttributeName) {
      setErrorMessage(
        `Custom attributes must be unique. "${duplicateAttributeName}" is already added.`,
      );
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        name,
        code,
        categoryId: selectedCategoryId,
        itemTypeName,
        currencyCode: selectedCurrencyCode,
        defaultPrice: parsedPrice,
        description,
        imageUrl,
        status: nextStatus,
        attributes,
      } as const;

      const product =
        mode === "edit" && productId
          ? await updateCatalogProduct(productId, payload)
          : await createCatalogProduct(payload);

      onSelectCatalogProduct(product.id);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save product.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10131a]/60 px-[16px] py-[24px]">
      <div className="w-full max-w-[700px] rounded-[18px] border border-[#d8dde3] bg-white p-[18px] shadow-[0_28px_80px_rgba(12,18,28,0.25)]">
        <CatalogFormHeader mode={mode} onClose={onClose} />

        <div className="mt-[16px] grid gap-[14px] md:grid-cols-2">
          <InputField label="Product Name">
            <TextInput
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Full product name"
              disabled={isSaving}
            />
          </InputField>
          <InputField label="Product Code">
            <TextInput
              value={code}
              onChange={(event) => {
                setIsCodeDirty(true);
                setCode(event.target.value.toUpperCase());
              }}
              placeholder="LMXK001"
              disabled={isSaving}
            />
          </InputField>
          <InputField label="Product Category">
            <SelectInput
              value={selectedCategoryId}
              onChange={(event) => handleCategoryChange(event.target.value)}
              disabled={isSaving}
            >
              {catalog.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectInput>
          </InputField>
          <InputField label="Type">
            <>
              <input
                list={itemTypeSuggestionsId}
                value={itemTypeName}
                onChange={(event) => {
                  setItemTypeName(formatCatalogAttributeText(event.target.value));
                  setErrorMessage("");
                }}
                disabled={isSaving}
                placeholder="Keyboard"
                className="h-[36px] w-full rounded-[6px] border border-[#d8d8dc] bg-[#f4f4f5] px-[10px] text-[12px] text-[#565656] outline-none placeholder:text-[#a0a0a0]"
              />
              <datalist id={itemTypeSuggestionsId}>
                {availableItemTypes.map((itemType) => (
                  <option key={itemType.id} value={itemType.name} />
                ))}
              </datalist>
            </>
          </InputField>
          <InputField label="Pricing">
            <div className="grid gap-[10px] md:grid-cols-[170px_1fr]">
              <SelectInput
                value={selectedCurrencyCode}
                onChange={(event) => {
                  setSelectedCurrencyCode(event.target.value as CurrencyCode | "");
                  setErrorMessage("");
                }}
                disabled={isSaving}
              >
                <option value="">Choose currency</option>
                {currencyOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {`${option.symbol} ${option.label}`}
                  </option>
                ))}
              </SelectInput>
              <div
                className={`flex h-[36px] items-center rounded-[6px] border border-[#d8d8dc] px-[10px] ${
                  selectedCurrencyCode ? "bg-[#f4f4f5]" : "bg-[#eceef2]"
                }`}
              >
                <span className="mr-[8px] text-[14px] text-[#565656]">
                  {selectedCurrencyCode
                    ? getCurrencySymbol(selectedCurrencyCode)
                    : "-"}
                </span>
                <input
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder={
                    selectedCurrencyCode ? "0" : "Choose currency first"
                  }
                  disabled={!selectedCurrencyCode || isSaving}
                  min={0}
                  className="h-full w-full bg-transparent text-[12px] text-[#565656] outline-none placeholder:text-[#a0a0a0] disabled:cursor-not-allowed disabled:text-[#9b9b9b]"
                />
              </div>
            </div>
          </InputField>
        </div>

        <div className="mt-[18px]">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[#6f7a88]">Custom attribute</p>
            <div className="flex items-center gap-[12px] text-[11px]">
              <div className="relative" ref={deleteMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsDeleteMenuOpen((current) => !current)}
                  disabled={attributes.length === 0 || isSaving}
                  className="cursor-pointer text-[#cf5b4d] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Delete Variables
                </button>
                {isDeleteMenuOpen && attributes.length > 0 ? (
                  <div className="absolute right-0 top-full z-20 mt-[8px] w-[280px] rounded-[14px] border border-[#d8dde3] bg-white p-[12px] shadow-[0_18px_40px_rgba(16,24,34,0.18)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7f8894]">
                      Select Variables
                    </p>
                    <p className="mt-[4px] text-[11px] text-[#8a94a3]">
                      Click a row or checkbox to select variables, then delete them explicitly.
                    </p>
                    <div className="mt-[10px] max-h-[220px] space-y-[8px] overflow-y-auto pr-[2px]">
                      {attributes.map((attribute, index) => {
                        const attributeLabel =
                          attribute.name.trim() ||
                          attribute.value.trim() ||
                          `Variable ${index + 1}`;
                        const attributeValue =
                          attribute.value.trim() ||
                          (attribute.name.trim()
                            ? "No value yet"
                            : "Empty variable");
                        const selected = activeSelectedAttributeIds.includes(
                          attribute.id,
                        );

                        return (
                          <button
                            key={attribute.id}
                            type="button"
                            onClick={() =>
                              handleToggleAttributeSelection(attribute.id)
                            }
                            disabled={isSaving}
                            className={`flex w-full cursor-pointer items-start gap-[8px] rounded-[10px] border p-[8px] text-left disabled:cursor-not-allowed disabled:opacity-50 ${
                              selected
                                ? "border-[#b8cbf8] bg-[#edf3ff]"
                                : "border-[#e6ebf2] bg-[#f8fafc]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                handleToggleAttributeSelection(attribute.id)
                              }
                              onClick={(event) => event.stopPropagation()}
                              disabled={isSaving}
                              className="mt-[3px] h-[14px] w-[14px] cursor-pointer rounded border border-[#b7c2d0]"
                            />
                            <span className="flex-1">
                              <span className="block text-[12px] font-medium text-[#1f2733]">
                                {attributeLabel}
                              </span>
                              <span className="mt-[2px] block text-[11px] text-[#7f8894]">
                                {attributeValue}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-[12px] flex items-center justify-between gap-[8px]">
                      <button
                        type="button"
                        onClick={handleDeleteSelectedAttributes}
                        disabled={activeSelectedAttributeIds.length === 0 || isSaving}
                        className="cursor-pointer rounded-[8px] border border-[#efc3bd] px-[10px] py-[7px] text-[11px] font-medium text-[#cf5b4d] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete Selected
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteAllAttributes}
                        disabled={attributes.length === 0 || isSaving}
                        className="cursor-pointer rounded-[8px] border border-[#efc3bd] px-[10px] py-[7px] text-[11px] font-medium text-[#cf5b4d] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete All
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleAddAttribute}
                disabled={isSaving}
                className="cursor-pointer text-[#5b7bd1] disabled:cursor-not-allowed disabled:opacity-50"
              >
                + Add Variable
              </button>
            </div>
          </div>
          {attributes.length > 0 ? (
            <div className="mt-[12px] grid gap-[12px] md:grid-cols-2">
              {attributes.map((attribute) => (
                <div
                  key={attribute.id}
                  className="rounded-[10px] border border-[#e2e7ee] bg-[#f8fafc] px-[12px] py-[10px]"
                >
                  <input
                    value={attribute.name}
                    onChange={(event) =>
                      handleAttributeChange(
                        attribute.id,
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="Attribute Name"
                    disabled={isSaving}
                    className="w-full bg-transparent p-0 text-[12px] text-[#6f7a88] outline-none placeholder:text-[#9aa3af]"
                  />
                  <TextInput
                    value={attribute.value}
                    onChange={(event) =>
                      handleAttributeChange(
                        attribute.id,
                        "value",
                        event.target.value,
                      )
                    }
                    placeholder="Value"
                    disabled={isSaving}
                  />
                </div>
              ))}
            </div>
          ) : null}
          {duplicateAttributeName ? (
            <p className="mt-[8px] text-[12px] text-[#cf5b4d]">
              {`"${duplicateAttributeName}" is duplicated. Custom attribute names must be unique.`}
            </p>
          ) : null}
        </div>

        <div className="mt-[18px]">
          <p className="text-[12px] text-[#6f7a88]">Upload Image</p>
          <input
            id={fileInputId}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSaving}
            className="hidden"
          />
          <div
            className={`mt-[8px] rounded-[10px] border ${
              imageUrl
                ? "border-[#bc4f4f] bg-white"
                : "border-dashed border-[#d4dae2] bg-[#eef3f8]"
            } px-[16px] py-[18px]`}
          >
            {imageUrl ? (
              <div className="flex min-h-[130px] items-center justify-center">
                <img
                  src={imageUrl}
                  alt={name || "Catalog product"}
                  className="max-h-[120px] max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="flex min-h-[90px] flex-col items-center justify-center text-center">
                <p className="text-[12px] text-[#7f8894]">
                  Drag and drop your product image here
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                  className="mt-[8px] cursor-pointer text-[12px] text-[#4f74d8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  browse
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-[18px]">
          <label className="flex flex-col gap-[6px]">
            <span className="text-[12px] text-[#6f7a88]">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSaving}
              placeholder="Describe the product thoroughly"
              className="min-h-[92px] rounded-[10px] border border-[#d8dde3] bg-[#f7f9fb] px-[12px] py-[10px] text-[12px] text-[#47505c] outline-none placeholder:text-[#9aa3af]"
            />
          </label>
        </div>

        {errorMessage ? (
          <p className="mt-[12px] text-[12px] text-[#cf5b4d]">{errorMessage}</p>
        ) : null}

        <div className="mt-[18px] flex flex-wrap items-center justify-between gap-[12px]">
          <ActionButton variant="light" onClick={onClose} disabled={isSaving}>
            Cancel
          </ActionButton>
          <div className="flex flex-wrap items-center gap-[10px]">
            <ActionButton
              variant="light"
              onClick={() => void handleSave("draft")}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save as a draft"}
            </ActionButton>
            <ActionButton
              variant="dark"
              onClick={() => void handleSave("active")}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : mode === "edit" ? "Update now" : "Add now"}
            </ActionButton>
          </div>
        </div>
      </div>
    </div>
  );
}
