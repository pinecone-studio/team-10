"use client";

import {
  useEffect,
  useRef,
  type ChangeEvent,
  type ReactNode,
} from "react";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-[16px] w-[16px] text-[#8f8f8f]"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="m10.5 10.5 3 3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-[16px] w-[16px]"
      aria-hidden="true"
    >
      <path
        d="M8 3v10M3 8h10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-[16px] w-[16px] text-[#262626]"
      aria-hidden="true"
    >
      <path
        d="M8 2.5a3 3 0 0 0-3 3v2.2c0 .5-.2 1-.5 1.4L3.8 10h8.4l-.7-.9a2.3 2.3 0 0 1-.5-1.4V5.5a3 3 0 0 0-3-3Zm-1.5 8.5a1.5 1.5 0 0 0 3 0"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SectionCard({
  title,
  icon,
  trailing,
  children,
}: {
  title: string;
  icon: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[10px] border border-[#d7d7da] bg-[#efefef] px-[16px] py-[16px]">
      <div className="flex items-center justify-between border-b border-[#d2d2d6] pb-[16px]">
        <div className="flex items-center gap-[8px] text-[24px] font-semibold leading-[1] text-[#111111]">
          {icon}
          <span className="text-[24px]">{title}</span>
        </div>
        {trailing}
      </div>
      <div className="pt-[16px]">{children}</div>
    </section>
  );
}

export function InputField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[12px] text-[#6f6f6f]">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: "text" | "date" | "number";
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={disabled || !onChange}
      placeholder={placeholder}
      disabled={disabled}
      min={type === "number" ? 1 : undefined}
      className="h-[36px] rounded-[6px] border border-[#d8d8dc] bg-[#f4f4f5] px-[10px] text-[12px] text-[#565656] outline-none placeholder:text-[#a0a0a0] disabled:cursor-not-allowed disabled:text-[#9b9b9b]"
    />
  );
}

export function SelectInput({
  value,
  onChange,
  children,
  disabled = false,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="h-[36px] cursor-pointer rounded-[6px] border border-[#d8d8dc] bg-[#f4f4f5] px-[10px] text-[12px] text-[#565656] outline-none disabled:cursor-not-allowed disabled:text-[#9b9b9b]"
    >
      {children}
    </select>
  );
}

export function TopBar({
  actionLabel,
  onAction,
  showNotification = false,
  notificationCount = 0,
  isNotificationOpen = false,
  onNotificationToggle,
  onNotificationClose,
  notificationPanel,
}: {
  actionLabel: string;
  onAction: () => void;
  showNotification?: boolean;
  notificationCount?: number;
  isNotificationOpen?: boolean;
  onNotificationToggle?: () => void;
  onNotificationClose?: () => void;
  notificationPanel?: ReactNode;
}) {
  const notificationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isNotificationOpen || !onNotificationClose) return;
    const handleClose = onNotificationClose;

    function handlePointerDown(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isNotificationOpen, onNotificationClose]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex h-[36px] w-[207px] items-center gap-[7px] rounded-[6px] border border-[#d8d8dc] bg-[#efefef] px-[10px] text-[14px] text-[#8a8a8a]">
        <SearchIcon />
        <span>Search</span>
      </div>
      <div className="flex items-center gap-[12px]">
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-[36px] cursor-pointer items-center justify-center gap-[6px] rounded-[6px] border border-[#d8d8dc] bg-[#e9e9eb] px-[18px] text-[14px] leading-none text-[#111111]"
        >
          {actionLabel.includes("additional") ? <PlusIcon /> : null}
          <span className="text-[14px]">{actionLabel}</span>
        </button>
        {showNotification ? (
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={onNotificationToggle}
              className="inline-flex h-[36px] w-[44px] cursor-pointer items-center justify-center rounded-[6px] border border-[#d8d8dc] bg-[#e9e9eb]"
              aria-label="Notifications"
            >
              <NotificationIcon />
              {notificationCount > 0 ? (
                <span className="absolute right-[-4px] top-[-4px] inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#149b63] px-[5px] text-[10px] font-semibold text-white">
                  {notificationCount}
                </span>
              ) : null}
            </button>
            {isNotificationOpen && notificationPanel ? (
              <div className="absolute right-0 top-[44px] z-20 w-[320px]">
                {notificationPanel}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
