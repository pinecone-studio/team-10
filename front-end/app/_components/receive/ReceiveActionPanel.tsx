"use client";

export function ReceiveActionPanel({
  storageLocation,
  receivedNote,
  disabled,
  onStorageLocationChange,
  onReceivedNoteChange,
  onSubmit,
}: {
  storageLocation: string;
  receivedNote: string;
  disabled: boolean;
  onStorageLocationChange: (value: string) => void;
  onReceivedNoteChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-auto flex items-end justify-between gap-4 border-t border-[#eaecf0] pt-[24px]">
      <div className="grid flex-1 gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-[13px] font-medium text-[#344054]">
          <span>Storage location</span>
          <input
            value={storageLocation}
            onChange={(event) => onStorageLocationChange(event.target.value)}
            placeholder="Main warehouse / Intake"
            className="h-[40px] rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-[14px] text-[#101828] outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-[13px] font-medium text-[#344054]">
          <span>Receive note</span>
          <input
            value={receivedNote}
            onChange={(event) => onReceivedNoteChange(event.target.value)}
            placeholder="Checked and received by Inventory Head"
            className="h-[40px] rounded-[8px] border border-[#d0d5dd] bg-white px-3 text-[14px] text-[#101828] outline-none"
          />
        </label>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onSubmit}
        className="inline-flex h-[40px] items-center gap-[10px] rounded-[8px] bg-[#101828] px-[16px] text-[16px] font-medium text-white shadow-[0_1px_2px_rgba(16,24,40,0.05)] disabled:opacity-40"
      >
        <span>Receive to storage</span>
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}
