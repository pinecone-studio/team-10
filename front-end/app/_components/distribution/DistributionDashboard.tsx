export default function DistributionDashboard(props: {
  pendingCount: number;
  inTransitCount: number;
  deliveredCount: number;
  signedCount: number;
}) {
  const cards = [
    { label: "Pending", value: props.pendingCount, icon: <PendingMetricIcon />, iconBg: "bg-[linear-gradient(180deg,#c8d8ef_0%,#a8c2e6_100%)]" },
    { label: "In Transit", value: props.inTransitCount, icon: <InTransitMetricIcon />, iconBg: "bg-[linear-gradient(180deg,#c8d8ef_0%,#a8c2e6_100%)]" },
    { label: "Delivered", value: props.deliveredCount, icon: <DeliveredMetricIcon />, iconBg: "bg-[linear-gradient(180deg,#c8d8ef_0%,#a8c2e6_100%)]" },
    { label: "Signed", value: props.signedCount, icon: <SignedMetricIcon />, iconBg: "bg-[linear-gradient(180deg,#c8d8ef_0%,#a8c2e6_100%)]" },
  ] as const;

  return (
    <div className="grid w-full gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex h-[78px] flex-1 items-center rounded-[16px] border border-[rgba(255,255,255,0.20)] bg-[rgba(255,255,255,0.40)] p-4 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.05)] backdrop-blur-[10px]"
        >
          <div className={`flex h-12 w-12 items-center justify-center rounded-[16px] ${card.iconBg}`}>{card.icon}</div>
          <div className="ml-4 flex flex-col">
            <p className="font-[var(--font-inter)] text-[24px] font-bold leading-none text-[#050810]">{card.value}</p>
            <p className="mt-1 font-[var(--font-inter)] text-[14px] font-normal leading-5 text-[#64748B]">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PendingMetricIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 6V12L16 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function InTransitMetricIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 18V6C14 5.46957 13.7893 4.96086 13.4142 4.58579C13.0391 4.21071 12.5304 4 12 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V17C2 17.2652 2.10536 17.5196 2.29289 17.7071C2.48043 17.8946 2.73478 18 3 18H5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 18H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 18H21C21.2652 18 21.5196 17.8946 21.7071 17.7071C21.8946 17.5196 22 17.2652 22 17V13.35C21.9996 13.1231 21.922 12.903 21.78 12.726L18.3 8.376C18.2065 8.25888 18.0878 8.16428 17.9528 8.0992C17.8178 8.03412 17.6699 8.00021 17.52 8H14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 20C18.1046 20 19 19.1046 19 18C19 16.8954 18.1046 16 17 16C15.8954 16 15 16.8954 15 18C15 19.1046 15.8954 20 17 20Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 20C8.10457 20 9 19.1046 9 18C9 16.8954 8.10457 16 7 16C5.89543 16 5 16.8954 5 18C5 19.1046 5.89543 20 7 20Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function DeliveredMetricIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function SignedMetricIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18.226 5.22601L15.706 2.70601C15.4823 2.48153 15.2164 2.30357 14.9236 2.18239C14.6308 2.06122 14.3169 1.99923 14 2.00001H6C5.46957 2.00001 4.96086 2.21072 4.58579 2.58579C4.21071 2.96087 4 3.46957 4 4.00001V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V19.649" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21.377 12.626C21.7754 12.2277 21.9991 11.6874 21.9991 11.124C21.9991 10.5607 21.7754 10.0204 21.377 9.62203C20.9786 9.22367 20.4384 8.99988 19.875 8.99988C19.3116 8.99988 18.7714 9.22367 18.373 9.62203L14.363 13.634C14.1252 13.8716 13.9512 14.1654 13.857 14.488L13.02 17.358C12.9949 17.4441 12.9934 17.5353 13.0156 17.6221C13.0379 17.7089 13.0831 17.7882 13.1464 17.8516C13.2098 17.915 13.2891 17.9601 13.3759 17.9824C13.4627 18.0046 13.554 18.0031 13.64 17.978L16.51 17.141C16.8327 17.0468 17.1264 16.8728 17.364 16.635L21.377 12.626Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 18H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
