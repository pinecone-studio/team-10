"use client";

const BUTTON_CLASS_NAME =
  "inline-flex size-[32px] items-center justify-center rounded-[8px] border border-[#eaecf0] bg-white text-[14px] text-[#667085] shadow-[0_1px_2px_rgba(16,24,40,0.05)] disabled:opacity-40";

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
    <div className="mt-[18px] flex flex-col gap-[16px] border-t border-[#eaecf0] pt-[12px] text-[14px] text-[#667085] xl:flex-row xl:items-center xl:justify-between">
      <p>
        {selectedCount} of {totalSelectableCount} row(s) selected.
      </p>

      <div className="flex flex-col gap-[16px] md:flex-row md:items-center md:gap-[28px] xl:ml-auto">
        <div className="flex items-center gap-[12px]">
          <span className="font-medium text-[#101828]">Rows per page</span>
          <label className="inline-flex h-[36px] w-[68px] items-center justify-between rounded-[8px] border border-[#d0d5dd] bg-white px-[10px] text-[#344054] shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
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

        <p className="font-medium text-[#101828]">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={currentPage === 1}
            className={BUTTON_CLASS_NAME}
          >
            ‹
          </button>
          <button type="button" onClick={onFirstPage} disabled={currentPage === 1} className={BUTTON_CLASS_NAME}>
            «
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
