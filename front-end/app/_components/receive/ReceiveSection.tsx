"use client";

import { ReceiveDetailView } from "./ReceiveDetailView";
import { ReceiveListView } from "./ReceiveListView";
import { ReceivePageFrame } from "./ReceivePageFrame";
import { useReceiveSectionState } from "./useReceiveSectionState";

export function ReceiveSection() {
  const state = useReceiveSectionState();

  if (state.activeRow) {
    const completedItemsLabel = `${state.completedRowIds.filter((rowId) => state.rows.some((row) => row.id === rowId && row.orderId === state.activeRow?.orderId)).length}/${state.rows.filter((row) => row.orderId === state.activeRow?.orderId).length} items`;
    return (
      <ReceivePageFrame
        title="Receive"
        subtitle="Complete intake details for the selected item."
        backLabel="Back to Receive"
        onBack={state.resetDetailState}
        action={<button type="button" onClick={() => void state.handleQuickCreate()} className="inline-flex h-[40px] w-[140px] cursor-pointer items-center justify-center rounded-[6px] bg-[#0f172a] px-4 text-[14px] font-medium text-white transition duration-150 hover:bg-[#1f2937] active:scale-[0.98] active:bg-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"><span className="inline-flex items-center gap-[6px]"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="M3 12h18" /></svg><span>Demo Button</span></span></button>}
      >
        <div className="mx-auto flex max-w-[1238px] min-h-[calc(100vh-180px)] flex-col px-[40px] pb-12 pt-5">
          <ReceiveDetailView
            activeRow={state.activeRow}
            activeProductImageUrl={state.activeProduct?.imageUrl}
            uploadedImage={state.uploadedImage}
            completedItemsLabel={completedItemsLabel}
            qrValue={state.pendingQrLink || state.primaryQrEntry?.token || state.activeRow.itemCode}
            qrTitle={state.primaryQrEntry?.serialNumber ?? state.activeRow.itemCode}
            qrLink={state.pendingQrLink}
            receivedDate={state.receivedDate}
            receivedCondition={state.receivedCondition}
            quantityReceived={state.quantityReceived}
            receivedNote={state.receivedNote}
            categoryOptions={state.categoryOptions}
            typeOptions={state.typeOptions}
            selectedCategory={state.selectedCategory}
            selectedType={state.selectedType}
            onUploadImage={state.handleUploadImage}
            onOpenQrLink={state.handleOpenQrLink}
            onCopyQrLink={state.handleCopyQrLink}
            onReceivedDateChange={state.setReceivedDate}
            onReceivedConditionChange={state.setReceivedCondition}
            onQuantityReceivedChange={state.setQuantityReceived}
            onReceivedNoteChange={state.setReceivedNote}
            onCategoryChange={(value) => { state.setSelectedCategory(value); state.setSelectedType(""); }}
            onTypeChange={state.setSelectedType}
            onAddCategory={state.handleAddCategory}
            onAddType={state.handleAddType}
            onSubmit={state.handleSubmitReceive}
          />
        </div>
      </ReceivePageFrame>
    );
  }

  return (
    <ReceivePageFrame title="Receive" subtitle="Each item is recorded, verified, and serialized." fixedViewport>
      <ReceiveListView
        hasApprovedRows={state.approvedRows.length > 0}
        totalReceivedQuantity={state.totalReceivedQuantity}
        totalQuantity={state.totalQuantity}
        totalCost={state.totalCost}
        currencyCode={state.pagedRows[0]?.currencyCode ?? "USD"}
        search={state.search}
        onSearchChange={state.setSearch}
        onQuickCreate={state.handleQuickCreate}
        rows={state.pagedRows}
        expectedDateSortDirection={state.expectedDateSortDirection}
        onToggleExpectedDateSort={() => state.setExpectedDateSortDirection((current) => current === "desc" ? "asc" : "desc")}
        statusFilter={state.statusFilter}
        onStatusFilterChange={(value) => {
          state.setStatusFilter(value);
          state.setPage(1);
        }}
        onOpenRow={state.openRow}
        selectedCount={state.completedRowIds.length}
        totalSelectableCount={state.approvedRows.length}
        rowsPerPage={state.rowsPerPage}
        rowsPerPageOptions={state.ROWS_PER_PAGE_OPTIONS}
        currentPage={state.currentPage}
        totalPages={state.totalPages}
        onRowsPerPageChange={(value) => { state.setRowsPerPage(value as (typeof state.ROWS_PER_PAGE_OPTIONS)[number]); state.setPage(1); }}
        onFirstPage={() => state.setPage(1)}
        onPreviousPage={() => state.setPage((current) => Math.max(1, current - 1))}
        onNextPage={() => state.setPage((current) => Math.min(state.totalPages, current + 1))}
        onLastPage={() => state.setPage(state.totalPages)}
      />
    </ReceivePageFrame>
  );
}
