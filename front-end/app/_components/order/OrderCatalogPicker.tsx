"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  createCatalogCategory,
  deleteCatalogCategories,
  useCatalogStore,
} from "../../_lib/catalog-store";
import { CubeIcon } from "./OrderCreateIcons";
import { OrderCatalogProductDialog } from "./OrderCatalogProductDialog";

type OrderCatalogPickerProps = {
  selectedCatalogProductId: string | null;
  onSelectCatalogProduct: (productId: string) => void;
};

function PencilIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[14px] w-[14px]" aria-hidden="true">
      <path
        d="M10.7 2.3a1.5 1.5 0 0 1 2.1 2.1L6 11.2l-2.7.6.6-2.7 6.8-6.8Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.7 3.3 12.7 6.3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={`h-[14px] w-[14px] transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[14px] w-[14px]" aria-hidden="true">
      <path
        d="M4 4 12 12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M12 4 4 12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[16px] w-[16px]" aria-hidden="true">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[14px] w-[14px]" aria-hidden="true">
      <path
        d="M8 3.25v9.5M3.25 8h9.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CreateCatalogItemCard({
  label,
  description,
  onClick,
}: {
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-[10px] rounded-[10px] border border-dashed border-[#78a4ff] bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] px-[12px] py-[10px] text-left transition hover:border-[#5d8df4] hover:bg-[linear-gradient(135deg,#f3f8ff_0%,#e9f2ff_100%)]"
    >
      <span className="inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] border border-[#d5e3ff] bg-white text-[#4d78da] shadow-[0_4px_10px_rgba(77,120,218,0.12)]">
        <PlusIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-[#204186]">
          {label}
        </span>
        <span className="mt-[2px] block text-[11px] text-[#6983b7]">
          {description}
        </span>
      </span>
    </button>
  );
}

export function OrderCatalogPicker({
  selectedCatalogProductId,
  onSelectCatalogProduct,
}: OrderCatalogPickerProps) {
  const catalog = useCatalogStore();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const selectedProduct =
    catalog.products.find((product) => product.id === selectedCatalogProductId) ??
    null;
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    selectedProduct?.categoryId ?? catalog.categories[0]?.id ?? "",
  );
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [dialogProductId, setDialogProductId] = useState<string | null>(null);
  const [isCreatingCategory, setCreatingCategory] = useState(false);
  const [isSavingCategory, setSavingCategory] = useState(false);
  const [isDeleteCategoryMenuOpen, setDeleteCategoryMenuOpen] = useState(false);
  const [isDeletingCategories, setDeletingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [selectedDeleteCategoryIds, setSelectedDeleteCategoryIds] = useState<string[]>([]);
  const [panelStyle, setPanelStyle] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const deleteCategoryMenuRef = useRef<HTMLDivElement | null>(null);
  const resolvedSelectedCategoryId = useMemo(() => {
    if (catalog.categories.length === 0) return "";

    return catalog.categories.some(
      (category) => category.id === selectedCategoryId,
    )
      ? selectedCategoryId
      : catalog.categories[0]!.id;
  }, [catalog.categories, selectedCategoryId]);

  const productsForCategory = useMemo(
    () =>
      catalog.products
        .filter((product) => product.categoryId === resolvedSelectedCategoryId)
        .sort((left, right) => left.name.localeCompare(right.name)),
    [catalog.products, resolvedSelectedCategoryId],
  );

  const itemTypeGroups = useMemo(
    () =>
      catalog.itemTypes
        .filter((itemType) => itemType.categoryId === resolvedSelectedCategoryId)
        .map((itemType) => ({
          itemType,
          products: productsForCategory.filter(
            (product) => product.itemTypeId === itemType.id,
          ),
        }))
        .filter((group) => group.products.length > 0),
    [catalog.itemTypes, productsForCategory, resolvedSelectedCategoryId],
  );
  const categoryProductCounts = useMemo(
    () =>
      new Map(
        catalog.categories.map((category) => [
          category.id,
          catalog.products.filter((product) => product.categoryId === category.id).length,
        ]),
      ),
    [catalog.categories, catalog.products],
  );
  const hasCategories = catalog.categories.length > 0;
  const selectedCategory =
    catalog.categories.find(
      (category) => category.id === resolvedSelectedCategoryId,
    ) ??
    null;
  const emptyStateTitle = hasCategories
    ? "No items in this category yet."
    : "No categories added yet.";
  const emptyStateDescription = hasCategories
    ? "Create a new item to get started."
    : "Add a category first to start building the catalog.";
  const activeSelectedDeleteCategoryIds = useMemo(
    () =>
      selectedDeleteCategoryIds.filter((categoryId) =>
        catalog.categories.some((category) => category.id === categoryId),
      ),
    [catalog.categories, selectedDeleteCategoryIds],
  );

  useEffect(() => {
    if (!isPickerOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPickerOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPickerOpen]);

  useEffect(() => {
    if (!isPickerOpen) return undefined;

    const updatePanelPosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 16;
      const panelWidth = Math.min(620, window.innerWidth - viewportPadding * 2);
      const panelHeight = Math.min(
        620,
        Math.max(260, window.innerHeight - viewportPadding * 2),
      );
      const preferredTop = rect.bottom + 8;
      const maxTop = window.innerHeight - panelHeight - viewportPadding;
      const top = Math.max(viewportPadding, Math.min(preferredTop, maxTop));
      const maxLeft = window.innerWidth - panelWidth - viewportPadding;
      const left = Math.max(viewportPadding, Math.min(rect.left, maxLeft));

      setPanelStyle({ top, left, width: panelWidth, height: panelHeight });
    };

    const frameId = window.requestAnimationFrame(updatePanelPosition);
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [isPickerOpen]);

  useEffect(() => {
    if (!isPickerOpen || typeof document === "undefined") return undefined;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const computedBodyPaddingRight = Number.parseFloat(
      window.getComputedStyle(document.body).paddingRight,
    );
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${
        (Number.isFinite(computedBodyPaddingRight)
          ? computedBodyPaddingRight
          : 0) + scrollbarWidth
      }px`;
    }

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [isPickerOpen]);

  useEffect(() => {
    if (!isDeleteCategoryMenuOpen) return undefined;

    function handlePointerDown(event: MouseEvent) {
      if (
        deleteCategoryMenuRef.current &&
        !deleteCategoryMenuRef.current.contains(event.target as Node)
      ) {
        setDeleteCategoryMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDeleteCategoryMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDeleteCategoryMenuOpen]);

  function clearFocusedElement() {
    if (
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }
  }

  function handleSelectProduct(productId: string) {
    onSelectCatalogProduct(productId);
    setPickerOpen(false);
    clearFocusedElement();
  }

  function handleOpenCreateDialog() {
    if (!hasCategories || !resolvedSelectedCategoryId) {
      setCreatingCategory(true);
      setDeleteCategoryMenuOpen(false);
      clearFocusedElement();
      return;
    }

    setDialogMode("create");
    setDialogProductId(null);
    setDialogOpen(true);
    setPickerOpen(false);
    setDeleteCategoryMenuOpen(false);
    clearFocusedElement();
  }

  function handleOpenEditDialog(productId: string) {
    setDialogMode("edit");
    setDialogProductId(productId);
    setDialogOpen(true);
    setPickerOpen(false);
    clearFocusedElement();
  }

  async function handleCreateCategory() {
    setSavingCategory(true);
    try {
      const { category } = await createCatalogCategory(newCategoryName);
      setSelectedCategoryId(category.id);
      setNewCategoryName("");
      setCategoryError("");
      setCreatingCategory(false);
      clearFocusedElement();
    } catch (error) {
      setCategoryError(
        error instanceof Error ? error.message : "Failed to create category.",
      );
    } finally {
      setSavingCategory(false);
    }
  }

  function handleToggleDeleteCategorySelection(categoryId: string) {
    setSelectedDeleteCategoryIds((current) =>
      current.includes(categoryId)
        ? current.filter((currentId) => currentId !== categoryId)
        : [...current, categoryId],
    );
  }

  async function removeCategories(categoryIds: string[]) {
    if (categoryIds.length === 0) return;

    setDeletingCategories(true);
    setCategoryError("");

    try {
      await deleteCatalogCategories(categoryIds);
      setSelectedDeleteCategoryIds((current) =>
        current.filter((categoryId) => !categoryIds.includes(categoryId)),
      );
      setDeleteCategoryMenuOpen(false);
      clearFocusedElement();
    } catch (error) {
      setCategoryError(
        error instanceof Error ? error.message : "Failed to delete category.",
      );
    } finally {
      setDeletingCategories(false);
    }
  }

  async function handleDeleteSelectedCategories() {
    await removeCategories(activeSelectedDeleteCategoryIds);
  }

  async function handleDeleteAllCategories() {
    await removeCategories(catalog.categories.map((category) => category.id));
  }

  const pickerOverlay =
    isPickerOpen && panelStyle && typeof document !== "undefined"
      ? createPortal(
          <>
            <button
              type="button"
              aria-label="Close goods picker"
              onClick={() => setPickerOpen(false)}
              className="fixed inset-0 z-20 cursor-default bg-transparent"
            />
            <div
              className="fixed z-30 overflow-hidden overscroll-contain rounded-[16px] border border-[#d8dde3] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
              style={{
                top: `${panelStyle.top}px`,
                left: `${panelStyle.left}px`,
                width: `${panelStyle.width}px`,
                height: `${panelStyle.height}px`,
              }}
            >
              <div className="grid h-full min-h-0 grid-cols-[154px_1fr]">
                <div className="flex h-full min-h-0 flex-col border-r border-[#edf0f3] bg-[#f9fafb] p-[10px]">
                  <p className="px-[6px] text-[11px] font-medium uppercase tracking-[0.08em] text-[#8b94a1]">
                    Category
                  </p>
                  <div className="mt-[8px] min-h-0 flex-1 space-y-[4px] overflow-y-auto overscroll-contain pr-[4px] [scrollbar-gutter:stable]">
                    {catalog.categories.map((category) => {
                      const count = categoryProductCounts.get(category.id) ?? 0;
                      const active = category.id === resolvedSelectedCategoryId;

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryId(category.id);
                            clearFocusedElement();
                          }}
                          className={`grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-start gap-[8px] rounded-[8px] px-[8px] py-[8px] text-left text-[12px] ${
                            active
                              ? "bg-[#e9eef8] text-[#162033]"
                              : "text-[#586271] hover:bg-[#eef2f7]"
                          }`}
                        >
                          <span className="whitespace-normal break-words leading-[1.35]">
                            {category.name}
                          </span>
                          {active ? (
                            <span className="mt-[2px] text-[#111827]">
                              <CheckIcon />
                            </span>
                          ) : (
                            <span className="mt-[2px] text-[11px] text-[#8b94a1]">{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-[12px] shrink-0 border-t border-[#e5e9ef] pt-[10px]">
                    {isCreatingCategory ? (
                      <>
                        <input
                          value={newCategoryName}
                          onChange={(event) => setNewCategoryName(event.target.value)}
                          placeholder="Category name"
                          disabled={isSavingCategory}
                          className="h-[34px] w-full rounded-[8px] border border-[#d8dde3] bg-white px-[10px] text-[12px] text-[#4f5660] outline-none"
                        />
                        {categoryError ? (
                          <p className="mt-[6px] text-[11px] text-[#cf5b4d]">
                            {categoryError}
                          </p>
                        ) : null}
                        <div className="mt-[8px] flex gap-[6px]">
                          <button
                            type="button"
                            onClick={handleCreateCategory}
                            disabled={isSavingCategory}
                            className="inline-flex h-[30px] cursor-pointer flex-1 items-center justify-center rounded-[7px] bg-[#1f2937] px-[8px] text-[11px] text-white"
                          >
                            {isSavingCategory ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCreatingCategory(false);
                              setNewCategoryName("");
                              setCategoryError("");
                              clearFocusedElement();
                            }}
                            disabled={isSavingCategory}
                            className="inline-flex h-[30px] cursor-pointer flex-1 items-center justify-center rounded-[7px] border border-[#d8dde3] bg-white px-[8px] text-[11px] text-[#4f5660]"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setCreatingCategory(true);
                          setDeleteCategoryMenuOpen(false);
                          clearFocusedElement();
                        }}
                        className="inline-flex h-[32px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#9aa7ba] px-[10px] text-[11px] text-white"
                      >
                        + Add new category
                      </button>
                    )}
                    <div className="relative mt-[8px]" ref={deleteCategoryMenuRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteCategoryMenuOpen((current) => !current);
                          setCreatingCategory(false);
                          clearFocusedElement();
                        }}
                        disabled={catalog.categories.length === 0 || isDeletingCategories}
                        className="inline-flex h-[32px] w-full cursor-pointer items-center justify-center rounded-[8px] border border-[#efc3bd] bg-white px-[10px] text-[11px] text-[#cf5b4d] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete categories
                      </button>
                      {isDeleteCategoryMenuOpen && catalog.categories.length > 0 ? (
                        <div className="absolute bottom-full left-0 z-20 mb-[8px] w-[250px] rounded-[14px] border border-[#d8dde3] bg-white p-[12px] shadow-[0_18px_40px_rgba(16,24,34,0.18)]">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7f8894]">
                            Select Categories
                          </p>
                          <p className="mt-[4px] text-[11px] text-[#8a94a3]">
                            Click a row or checkbox to select categories, then delete them explicitly.
                          </p>
                          <div className="mt-[10px] max-h-[220px] space-y-[8px] overflow-y-auto pr-[2px]">
                            {catalog.categories.map((category) => {
                              const selected = activeSelectedDeleteCategoryIds.includes(
                                category.id,
                              );

                              return (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={() =>
                                    handleToggleDeleteCategorySelection(category.id)
                                  }
                                  disabled={isDeletingCategories}
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
                                      handleToggleDeleteCategorySelection(category.id)
                                    }
                                    onClick={(event) => event.stopPropagation()}
                                    disabled={isDeletingCategories}
                                    className="mt-[3px] h-[14px] w-[14px] cursor-pointer rounded border border-[#b7c2d0]"
                                  />
                                  <span className="flex-1">
                                    <span className="block text-[12px] font-medium text-[#1f2733]">
                                      {category.name}
                                    </span>
                                    <span className="mt-[2px] block text-[11px] text-[#7f8894]">
                                      {`${categoryProductCounts.get(category.id) ?? 0} item${(categoryProductCounts.get(category.id) ?? 0) === 1 ? "" : "s"}`}
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-[12px] flex items-center justify-between gap-[8px]">
                            <button
                              type="button"
                              onClick={() => void handleDeleteSelectedCategories()}
                              disabled={
                                activeSelectedDeleteCategoryIds.length === 0 ||
                                isDeletingCategories
                              }
                              className="cursor-pointer rounded-[8px] border border-[#efc3bd] px-[10px] py-[7px] text-[11px] font-medium text-[#cf5b4d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete Selected
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteAllCategories()}
                              disabled={
                                catalog.categories.length === 0 || isDeletingCategories
                              }
                              className="cursor-pointer rounded-[8px] border border-[#efc3bd] px-[10px] py-[7px] text-[11px] font-medium text-[#cf5b4d] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Delete All
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    {!isCreatingCategory && categoryError ? (
                      <p className="mt-[6px] text-[11px] text-[#cf5b4d]">
                        {categoryError}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="flex h-full min-h-0 flex-col p-[18px]">
                  <div className="flex items-start justify-between gap-[12px]">
                    <div>
                      <p className="text-[16px] font-semibold text-[#1a2233]">
                        {selectedCategory?.name ?? "Catalog"}
                      </p>
                      <p className="mt-[4px] text-[12px] text-[#7f8894]">
                        {hasCategories
                          ? "Choose a catalog product or create a new one for this category."
                          : "Add a category to start building the catalog."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPickerOpen(false);
                        clearFocusedElement();
                      }}
                      className="inline-flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[8px] border border-[#d8dde3] bg-white text-[#6d7682]"
                      aria-label="Close goods picker"
                    >
                      <CloseIcon />
                    </button>
                  </div>

                  {productsForCategory.length === 0 ? (
                    <div className="mt-[22px] flex min-h-[250px] flex-1 flex-col items-center justify-center rounded-[14px] border border-[#e6eaf0] bg-[#fbfcfd] px-[24px] text-center">
                      <CubeIcon />
                      <p className="mt-[12px] text-[13px] text-[#6c7685]">
                        {emptyStateTitle}
                      </p>
                      <p className="text-[13px] text-[#6c7685]">
                        {emptyStateDescription}
                      </p>
                      <div className="mt-[18px] w-full max-w-[420px]">
                        <CreateCatalogItemCard
                          label={hasCategories ? "Create Item" : "Add Category"}
                          description={
                            hasCategories
                              ? "Create a new product card for this category."
                              : "Start by adding your first category."
                          }
                          onClick={handleOpenCreateDialog}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-[18px] min-h-0 flex-1 space-y-[16px] overflow-y-auto overscroll-contain pr-[6px] [scrollbar-gutter:stable]">
                      <CreateCatalogItemCard
                        label="Create Item"
                        description={`Add a new product to ${selectedCategory?.name ?? "this category"}.`}
                        onClick={handleOpenCreateDialog}
                      />
                      {itemTypeGroups.map(({ itemType, products }) => (
                        <div key={itemType.id}>
                          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8b94a1]">
                            {itemType.name}
                          </p>
                          <div className="mt-[8px] space-y-[6px]">
                            {products.map((product) => {
                              const active = product.id === selectedCatalogProductId;
                              return (
                                <div
                                  key={product.id}
                                  className={`flex items-center gap-[10px] rounded-[10px] border px-[12px] py-[10px] ${
                                    active
                                      ? "border-[#91a6da] bg-[#eef3ff]"
                                      : "border-[#e4e8ee] bg-white"
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleSelectProduct(product.id)}
                                    className="flex-1 cursor-pointer text-left"
                                  >
                                    <p className="text-[13px] font-medium text-[#182132]">
                                      {product.name}
                                    </p>
                                    <p className="mt-[2px] text-[11px] text-[#7f8894]">
                                      {product.code}
                                    </p>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditDialog(product.id)}
                                    className="inline-flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-[8px] border border-[#dbe1e8] text-[#6d7682]"
                                    aria-label={`Edit ${product.name}`}
                                  >
                                    <PencilIcon />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
            setSelectedCategoryId(
              selectedProduct?.categoryId ??
              resolvedSelectedCategoryId ??
              catalog.categories[0]?.id ??
              "",
            );
          setPickerOpen((current) => !current);
          event.currentTarget.blur();
        }}
        className={`relative z-40 inline-flex h-[36px] w-[154px] cursor-pointer items-center justify-between rounded-[8px] border border-[#d8dde3] bg-[#f7f9fb] px-[10px] text-[12px] text-[#4f5660] ${
          isPickerOpen ? "invisible" : ""
        }`}
      >
        <span className="truncate pr-[8px]">
          {selectedProduct?.name ?? "Add Goods"}
        </span>
        <ChevronIcon open={isPickerOpen} />
      </button>

      {pickerOverlay}

      <OrderCatalogProductDialog
        isOpen={isDialogOpen}
        mode={dialogMode}
        categoryId={resolvedSelectedCategoryId}
        productId={dialogProductId}
        onClose={() => setDialogOpen(false)}
        onSelectCatalogProduct={(productId) => {
          onSelectCatalogProduct(productId);
          setDialogOpen(false);
        }}
      />
    </div>
  );
}
