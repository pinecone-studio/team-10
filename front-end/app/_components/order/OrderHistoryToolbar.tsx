"use client";

import { useNotificationsStore } from "../../_lib/notification-store";
import { OrderHistoryNotifications } from "./OrderHistoryNotifications";

const filterOptions = ["all", "pending", "completed", "cancelled"] as const;

function NotificationIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        d="M12 22C11.45 22 10.9792 21.8042 10.5875 21.4125C10.1958 21.0208 10 20.55 10 20H14C14 20.55 13.8042 21.0208 13.4125 21.4125C13.0208 21.8042 12.55 22 12 22ZM4 19V17H6V10C6 8.61667 6.41667 7.3875 7.25 6.3125C8.08333 5.2375 9.16667 4.53333 10.5 4.2V3.5C10.5 3.08333 10.6458 2.72917 10.9375 2.4375C11.2292 2.14583 11.5833 2 12 2C12.4167 2 12.7708 2.14583 13.0625 2.4375C13.3542 2.72917 13.5 3.08333 13.5 3.5V3.825C13.3167 4.19167 13.1833 4.56667 13.1 4.95C13.0167 5.33333 12.9833 5.725 13 6.125C12.8333 6.09167 12.6708 6.0625 12.5125 6.0375C12.3542 6.0125 12.1833 6 12 6C10.9 6 9.95833 6.39167 9.175 7.175C8.39167 7.95833 8 8.9 8 10V17H16V10.575C16.3 10.7083 16.6208 10.8125 16.9625 10.8875C17.3042 10.9625 17.65 11 18 11V17H20V19H4ZM15.875 8.125C15.2917 7.54167 15 6.83333 15 6C15 5.16667 15.2917 4.45833 15.875 3.875C16.4583 3.29167 17.1667 3 18 3C18.8333 3 19.5417 3.29167 20.125 3.875C20.7083 4.45833 21 5.16667 21 6C21 6.83333 20.7083 7.54167 20.125 8.125C19.5417 8.70833 18.8333 9 18 9C17.1667 9 16.4583 8.70833 15.875 8.125Z"
        fill="black"
      />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      className="h-[15px] w-[15px]"
    >
      <path
        d="M13.8333 15L8.58333 9.75C8.16667 10.0833 7.6875 10.3472 7.14583 10.5417C6.60417 10.7361 6.02778 10.8333 5.41667 10.8333C3.90278 10.8333 2.62153 10.309 1.57292 9.26042C0.524306 8.21181 0 6.93056 0 5.41667C0 3.90278 0.524306 2.62153 1.57292 1.57292C2.62153 0.524306 3.90278 0 5.41667 0C6.93056 0 8.21181 0.524306 9.26042 1.57292C10.309 2.62153 10.8333 3.90278 10.8333 5.41667C10.8333 6.02778 10.7361 6.60417 10.5417 7.14583C10.3472 7.6875 10.0833 8.16667 9.75 8.58333L15 13.8333L13.8333 15ZM5.41667 9.16667C6.45833 9.16667 7.34375 8.80208 8.07292 8.07292C8.80208 7.34375 9.16667 6.45833 9.16667 5.41667C9.16667 4.375 8.80208 3.48958 8.07292 2.76042C7.34375 2.03125 6.45833 1.66667 5.41667 1.66667C4.375 1.66667 3.48958 2.03125 2.76042 2.76042C2.03125 3.48958 1.66667 4.375 1.66667 5.41667C1.66667 6.45833 2.03125 7.34375 2.76042 8.07292C3.48958 8.80208 4.375 9.16667 5.41667 9.16667Z"
        fill="black"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="14"
      viewBox="0 0 15 14"
      fill="none"
      aria-hidden="true"
      className="h-[14px] w-[15px]"
    >
      <path
        d="M12.1878 1.75065H11.6018V0.583984H10.43V1.75065H4.57059V0.583984H3.39871V1.75065H2.81277C2.16824 1.75065 1.6409 2.27565 1.6409 2.91732V12.2507C1.6409 12.8923 2.16824 13.4173 2.81277 13.4173H12.1878C12.8323 13.4173 13.3597 12.8923 13.3597 12.2507V2.91732C13.3597 2.27565 12.8323 1.75065 12.1878 1.75065ZM12.1878 12.2507H2.81277V4.66732H12.1878V12.2507Z"
        fill="black"
      />
    </svg>
  );
}

export function OrderHistoryToolbar(props: {
  counts: Record<(typeof filterOptions)[number], number>;
  selectedFilter: (typeof filterOptions)[number];
  searchQuery: string;
  isNotificationOpen: boolean;
  onFilterChange: (value: (typeof filterOptions)[number]) => void;
  onSearchChange: (value: string) => void;
  onOpenCreate: () => void;
  onOpenDetail: (orderId: string) => void;
  onToggleNotifications: () => void;
  onCloseNotifications: () => void;
}) {
  const unreadCount = useNotificationsStore().filter(
    (notification) => !notification.isRead,
  ).length;

  return (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-[#d9e0e8] bg-white px-9 py-10">
        <div>
          <h2 className="text-[24px] font-semibold leading-none text-[#111827]">
            Order history
          </h2>
          <p className="mt-3 text-[14px] text-[#94a3b8]">
            View and manage all inventory order requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={props.onOpenCreate}
            className="inline-flex h-12 items-center justify-center rounded-[10px] bg-[#111827] px-5 text-[14px] font-medium text-white"
          >
            Create new order
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={props.onToggleNotifications}
              className="relative inline-flex h-12 w-12 items-center justify-center rounded-[10px] border border-[#d9e0e8] bg-white"
            >
              <NotificationIcon />
            </button>
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#ef4444] px-1.5 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            ) : null}
            {props.isNotificationOpen ? (
              <OrderHistoryNotifications
                onOpenDetail={props.onOpenDetail}
                onClose={props.onCloseNotifications}
              />
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="inline-flex w-fit flex-wrap items-center gap-2 rounded-[12px] bg-[#f1f5f9] p-1">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => props.onFilterChange(filter)}
              className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm ${props.selectedFilter === filter ? "bg-white font-medium text-[#111827] shadow-[0_1px_2px_rgba(15,23,42,0.06)]" : "text-[#64748b]"}`}
            >
              <span>{filter[0]!.toUpperCase() + filter.slice(1)}</span>
              <span className="text-xs text-[#94a3b8]">
                {props.counts[filter]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-12 w-full items-center gap-2 rounded-[10px] border border-[#d9e0e8] bg-white px-4 sm:w-[270px]">
            <span>
              <SearchIcon />
            </span>
            <input
              value={props.searchQuery}
              onChange={(event) => props.onSearchChange(event.target.value)}
              placeholder="Search orders..."
              className="w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#94a3b8]"
            />
          </label>
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-[#d9e0e8] bg-white px-4 text-[14px] text-[#111827]"
          >
            <CalendarIcon />
            <span>Date Range</span>
          </button>
        </div>
      </div>
    </>
  );
}
