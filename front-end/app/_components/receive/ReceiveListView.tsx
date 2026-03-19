"use client";

import type { CurrencyCode } from "../../_lib/order-types";
import type { ReceiveRow, ReceiveStatusFilterValue } from "./receiveTypes";
import { ReceivePagination } from "./ReceivePagination";
import { ReceiveSummaryCards } from "./ReceiveSummaryCards";
import { ReceiveTable } from "./ReceiveTable";
import { ReceiveToolbar } from "./ReceiveToolbar";

export function ReceiveListView(props: {
  hasApprovedRows: boolean;
  totalReceivedQuantity: number;
  totalQuantity: number;
  totalCost: number;
  currencyCode: CurrencyCode;
  search: string;
  onSearchChange: (value: string) => void;
  onQuickCreate: () => void | Promise<void>;
  rows: ReceiveRow[];
  expectedDateSortDirection: "asc" | "desc";
  onToggleExpectedDateSort: () => void;
  statusFilter: ReceiveStatusFilterValue;
  onStatusFilterChange: (value: ReceiveStatusFilterValue) => void;
  onOpenRow: (rowId: string) => void;
  selectedCount: number;
  totalSelectableCount: number;
  rowsPerPage: number;
  rowsPerPageOptions: readonly number[];
  currentPage: number;
  totalPages: number;
  onRowsPerPageChange: (value: number) => void;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
}) {
  return (
    <>
      <ReceiveSummaryCards
        hasApprovedRows={props.hasApprovedRows}
        totalReceivedQuantity={props.totalReceivedQuantity}
        totalQuantity={props.totalQuantity}
        totalCost={props.totalCost}
        currencyCode={props.currencyCode}
      />
      <div className="mx-auto flex min-h-0 w-full max-w-[1161px] flex-1 flex-col overflow-hidden px-[40px] pb-[80px] pt-5">
        <ReceiveToolbar
          search={props.search}
          onSearchChange={props.onSearchChange}
          onQuickCreate={props.onQuickCreate}
        />
        <ReceiveTable
          rows={props.rows}
          activeRowId={null}
          expectedDateSortDirection={props.expectedDateSortDirection}
          onToggleExpectedDateSort={props.onToggleExpectedDateSort}
          statusFilter={props.statusFilter}
          onStatusFilterChange={props.onStatusFilterChange}
          onOpenRow={props.onOpenRow}
        />
        <div className="shrink-0">
          <ReceivePagination
            selectedCount={props.selectedCount}
            totalSelectableCount={props.totalSelectableCount}
            rowsPerPage={props.rowsPerPage}
            rowsPerPageOptions={props.rowsPerPageOptions}
            currentPage={props.currentPage}
            totalPages={props.totalPages}
            onRowsPerPageChange={props.onRowsPerPageChange}
            onFirstPage={props.onFirstPage}
            onPreviousPage={props.onPreviousPage}
            onNextPage={props.onNextPage}
            onLastPage={props.onLastPage}
          />
        </div>
      </div>
    </>
  );
}
