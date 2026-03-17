"use client";

const BUTTON_CLASS_NAME =
  "inline-flex size-[30px] items-center justify-center rounded-[8px] border border-[#e5e7eb] bg-white text-[14px] text-[#525252] disabled:opacity-40";

export function ReceivePagination({
  selectedCount,
  totalSelectableCount,
  rowsPerPage,
  rowsPerPageOptions,
  currentPage,
  totalPages,
  onRowsPerPageChange,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
}: {
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
    <div className="mt-[18px] flex flex-col gap-[16px] text-[14px] text-[#737373] xl:flex-row xl:items-center xl:justify-between">
      <p>
        {selectedCount} of {totalSelectableCount} row(s) selected.
      </p>

      <div className="flex flex-col gap-[16px] md:flex-row md:items-center md:gap-[28px] xl:ml-auto">
        <div className="flex items-center gap-[10px]">
          <span className="font-medium text-[#171717]">Rows per page</span>
          <label className="inline-flex h-[38px] w-[72px] items-center justify-between rounded-[10px] border border-[#e5e7eb] bg-white px-[10px] text-[#171717]">
            <select
              value={rowsPerPage}
              onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
              className="w-full appearance-none bg-transparent outline-none"
            >
              {rowsPerPageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span aria-hidden="true">⌄</span>
          </label>
        </div>

        <p className="font-medium text-[#171717]">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex items-center gap-[8px]">
          <button type="button" onClick={onFirstPage} disabled={currentPage === 1} className={BUTTON_CLASS_NAME}>
            «
          </button>
          <button type="button" onClick={onPreviousPage} disabled={currentPage === 1} className={BUTTON_CLASS_NAME}>
            ‹
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            className={BUTTON_CLASS_NAME}
          >
            ›
          </button>
          <button
            type="button"
            onClick={onLastPage}
            disabled={currentPage === totalPages}
            className={BUTTON_CLASS_NAME}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}
