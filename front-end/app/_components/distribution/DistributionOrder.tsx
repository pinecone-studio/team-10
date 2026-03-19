import type { DistributionRecordDto } from "@/app/(dashboard)/_graphql/distribution/distribution-api";
import CallendarIcon from "./icons/CallendarIcon";
import DeliveredIcon from "./icons/DeliveredIcon";
import EyeIcon from "./icons/EyeIcon";
import PendingIcon from "./icons/PendingIcon";
import SignedIcon from "./icons/SignedIcon";
import TransitIcon from "./icons/TransitIcon";

const columns = [
  ["Distribution #", "w-[12%]"],
  ["Recipient", "w-[19%]"],
  ["Department", "w-[13%]"],
  ["Location", "w-[18%]"],
  ["Items", "w-[9%]"],
  ["Date", "w-[12%]"],
  ["Status", "w-[12%]"],
  ["Actions", "w-[5%]"],
] as const;

function StatusBadge(props: { status: string }) {
  if (props.status === "Delivered") {
    return <Badge tone="border-[#A4F4CF] bg-[#D0FAE5] text-[#006045]" icon={<DeliveredIcon />}>Delivered</Badge>;
  }
  if (props.status === "Signed") {
    return <Badge tone="border-[#E9D4FF] bg-[#F3E8FF] text-[#6E11B0]" icon={<SignedIcon />}>Signed</Badge>;
  }
  if (props.status === "In Transit") {
    return <Badge tone="border-[#BEDBFF] bg-[#DBEAFE] text-[#193CB8]" icon={<TransitIcon />}>In Transit</Badge>;
  }
  return <Badge tone="border-[#FEE685] bg-[#FEF3C6] text-[#973C00]" icon={<PendingIcon />}>Pending</Badge>;
}

function Badge(props: { children: React.ReactNode; tone: string; icon: React.ReactNode }) {
  return (
    <span className={`inline-flex h-[30px] max-w-full items-center gap-1 rounded-[12px] border px-2.5 text-[11px] font-medium leading-none ${props.tone}`}>
      <span className="flex h-3.5 w-3.5 items-center justify-center [&_svg]:h-3.5 [&_svg]:w-3.5">{props.icon}</span>
      {props.children}
    </span>
  );
}

export default function DistributionOrder(props: { rows: DistributionRecordDto[] }) {
  return (
    <section className="w-full rounded-[24px] border border-[#D8E8FF] bg-[rgba(255,255,255,0.7)] p-[12px]">
      <div className="overflow-hidden rounded-[20px] border border-[#D8E8FF] bg-white px-2">
        <table className="w-full table-fixed border-separate border-spacing-0">
          <colgroup>
            {columns.map(([heading, width]) => (
              <col key={heading} className={width} />
            ))}
          </colgroup>
          <thead>
            <tr className="h-[60px] border-b border-[#D8E8FF]">
              {columns.map(([heading]) => (
                <th key={heading} className={`border-b border-[#D8E8FF] px-2 text-left font-geist text-[14px] font-medium leading-5 text-[#050810] ${heading === "Actions" ? "pr-0 text-right" : ""}`}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child_td]:border-b-0">
            {props.rows.map((row) => (
              <tr key={row.id} className="h-[56px]">
                <Cell className="font-[var(--font-inter)] text-[11px] text-[#111827]">{`DIST-${row.id.slice(-4).toUpperCase()}`}</Cell>
                <Cell>
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-[12px] font-normal text-[#0A0A0A]">{initialsOf(row.employeeName)}</div>
                    <span className="truncate font-geist text-[13px] font-normal leading-5 text-[#050810]">{row.employeeName}</span>
                  </div>
                </Cell>
                <Cell className="truncate font-geist text-[13px] text-[#6B7280]">{row.recipientRole || "-"}</Cell>
                <Cell className="truncate font-geist text-[13px] text-[#6B7280]">{row.currentStorageName || "Assigned out"}</Cell>
                <Cell className="font-[var(--font-inter)] text-[13px] text-[#111827]">1 item</Cell>
                <Cell>
                  <div className="flex min-w-0 items-center gap-2 font-[var(--font-inter)] text-[13px] text-[#111827]">
                    <CallendarIcon />
                    <span className="truncate">{formatDate(row.distributedAt || row.createdAt)}</span>
                  </div>
                </Cell>
                <Cell><StatusBadge status={statusLabel(row)} /></Cell>
                <Cell className="pr-0 text-right">
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-[#0A0A0A] transition hover:border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <EyeIcon />
                  </button>
                </Cell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Cell(props: { children: React.ReactNode; className?: string }) {
  return <td className={`border-b border-[#D8E8FF] px-2 py-3 align-middle ${props.className ?? ""}`}>{props.children}</td>;
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

function initialsOf(value: string) {
  return value.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function statusLabel(record: DistributionRecordDto) {
  const value = `${record.status} ${record.assetStatus}`.toLowerCase();
  if (value.includes("deliver") || record.returnedAt) return "Delivered";
  if (value.includes("sign")) return "Signed";
  if (value.includes("transit") || value.includes("active")) return "In Transit";
  return "Pending";
}
