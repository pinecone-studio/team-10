"use client";

import { useMemo, useState } from "react";

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function CalendarIcon() {
  return <svg viewBox="0 0 15 14" fill="none" className="h-[14px] w-[15px]" aria-hidden="true"><path d="M12.1878 1.75065H11.6018V0.583984H10.43V1.75065H4.57059V0.583984H3.39871V1.75065H2.81277C2.16824 1.75065 1.6409 2.27565 1.6409 2.91732V12.2507C1.6409 12.8923 2.16824 13.4173 2.81277 13.4173H12.1878C12.8323 13.4173 13.3597 12.8923 13.3597 12.2507V2.91732C13.3597 2.27565 12.8323 1.75065 12.1878 1.75065ZM12.1878 12.2507H2.81277V4.66732H12.1878V12.2507Z" fill="black" /></svg>;
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true"><path d={direction === "left" ? "m10 3-5 5 5 5" : "m6 3 5 5-5 5"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function toKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value: string) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function buildDays(monthDate: Date) {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function formatLabel(startDate: string, endDate: string) {
  if (!startDate && !endDate) return "Date Range";
  const format = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return `${startDate ? format.format(new Date(startDate)) : "Any"} - ${endDate ? format.format(new Date(endDate)) : "Any"}`;
}

export function OrderHistoryDateRangePicker(props: {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}) {
  const initialMonth = parseDate(props.startDate) ?? new Date();
  const [isOpen, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));
  const [draftStartDate, setDraftStartDate] = useState(props.startDate);
  const [draftEndDate, setDraftEndDate] = useState(props.endDate);
  const days = useMemo(() => buildDays(visibleMonth), [visibleMonth]);
  const monthLabel = visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const label = useMemo(() => formatLabel(props.startDate, props.endDate), [props.endDate, props.startDate]);

  function selectDate(date: Date) {
    const value = toKey(date);
    if (!draftStartDate) {
      setDraftStartDate(value);
      setDraftEndDate("");
      props.onChange(value, "");
      return;
    }

    if (!draftEndDate) {
      if (value < draftStartDate) {
        setDraftStartDate(value);
        setDraftEndDate(draftStartDate);
        props.onChange(value, draftStartDate);
        return;
      }
      setDraftEndDate(value);
      props.onChange(draftStartDate, value);
      return;
    }

    const moveStart =
      value <= draftStartDate ||
      (value < draftEndDate &&
        value >= draftStartDate &&
        value.localeCompare(draftStartDate) <= draftEndDate.localeCompare(value));

    if (moveStart) {
      const nextStartDate = value <= draftEndDate ? value : draftEndDate;
      const nextEndDate = value <= draftEndDate ? draftEndDate : value;
      setDraftStartDate(nextStartDate);
      setDraftEndDate(nextEndDate);
      props.onChange(nextStartDate, nextEndDate);
      return;
    }

    const nextStartDate = draftStartDate <= value ? draftStartDate : value;
    const nextEndDate = draftStartDate <= value ? value : draftStartDate;
    setDraftStartDate(nextStartDate);
    setDraftEndDate(nextEndDate);
    props.onChange(nextStartDate, nextEndDate);
  }

  function clearRange() {
    setDraftStartDate("");
    setDraftEndDate("");
    props.onChange("", "");
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => {
        setDraftStartDate(props.startDate);
        setDraftEndDate(props.endDate);
        setOpen((current) => !current);
      }} className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#d9e0e8] bg-white px-4 text-[14px] text-[#111827] transition duration-150 hover:bg-[#f8fafc] active:scale-[0.98] active:bg-[#eef2f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2">
        <CalendarIcon />
        <span>{label}</span>
      </button>
      {isOpen ? (
        <div className="absolute right-0 top-[56px] z-20 w-[300px] rounded-[16px] border border-[#dbe2ea] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#475569] transition hover:bg-[#f8fafc] active:scale-[0.98]">
              <Arrow direction="left" />
            </button>
            <p className="text-[14px] font-semibold text-[#111827]">{monthLabel}</p>
            <button type="button" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#475569] transition hover:bg-[#f8fafc] active:scale-[0.98]">
              <Arrow direction="right" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-[#94a3b8]">
            {weekDays.map((day) => <span key={day} className="py-1">{day}</span>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {days.map((date) => {
              const value = toKey(date);
              const inMonth = date.getMonth() === visibleMonth.getMonth();
              const isStart = value === draftStartDate;
              const isEnd = value === draftEndDate;
              const inRange = draftStartDate && draftEndDate && value > draftStartDate && value < draftEndDate;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={`inline-flex h-9 items-center justify-center rounded-[10px] text-[12px] transition duration-150 ${isStart || isEnd ? "bg-[#111827] font-semibold text-white" : inRange ? "bg-[#eef2ff] text-[#111827]" : inMonth ? "text-[#334155] hover:bg-[#f8fafc]" : "text-[#cbd5e1] hover:bg-[#f8fafc]"}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[12px] text-[#94a3b8]">{draftStartDate && !draftEndDate ? "Choose an end date" : "Select a range"}</p>
            <button type="button" onClick={clearRange} className="inline-flex h-9 items-center justify-center rounded-[10px] px-3 text-[12px] font-medium text-[#475569] transition hover:bg-[#f8fafc] active:scale-[0.98]">
              Clear
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
