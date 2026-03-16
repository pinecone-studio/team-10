"use client";

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  useNotificationsStore,
} from "../../_lib/notification-store";
import { formatDisplayDate } from "../../_lib/order-store";

export function OrderHistoryNotifications(props: {
  onOpenDetail: (orderId: string) => void;
  onClose: () => void;
}) {
  const notifications = useNotificationsStore();

  return (
    <div className="absolute right-0 top-[52px] z-20 w-[320px] rounded-[18px] border border-[#dbe2ea] bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      <div className="flex items-center justify-between border-b border-[#eef2f6] pb-3">
        <div><p className="text-sm font-semibold text-[#111827]">Notifications</p><p className="text-xs text-[#94a3b8]">Order approval updates</p></div>
        <button type="button" onClick={() => void markAllNotificationsAsRead()} className="text-xs font-medium text-[#2563eb]">Mark all read</button>
      </div>
      <div className="mt-3 max-h-[300px] space-y-2 overflow-y-auto">
        {notifications.length > 0 ? notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() => {
              void markNotificationAsRead(notification.id);
              props.onClose();
              props.onOpenDetail(notification.orderId);
            }}
            className={`w-full rounded-[14px] border p-3 text-left ${notification.isRead ? "border-[#e5e7eb] bg-[#f8fafc]" : "border-[#c7d2fe] bg-[#f8faff]"}`}
          >
            <p className="text-sm font-medium text-[#111827]">{notification.title}</p>
            <p className="mt-1 text-xs leading-5 text-[#64748b]">{notification.message}</p>
            <p className="mt-2 text-[11px] text-[#94a3b8]">{formatDisplayDate(notification.createdAt.slice(0, 10))}</p>
          </button>
        )) : <div className="rounded-[14px] border border-dashed border-[#dbe2ea] px-4 py-8 text-center text-sm text-[#94a3b8]">No notifications yet.</div>}
      </div>
    </div>
  );
}
