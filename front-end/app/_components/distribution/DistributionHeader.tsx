export default function DistributionHeader() {
    return (
      <div className="flex flex-col items-start gap-15 pt-15 pr-15 pb-4 pl-15 self-stretch w-full bg-white">
        <div className="flex justify-between items-end self-stretch w-full bg-white">
          <div className="flex flex-col items-start">
            <p className="font-inter text-[24px] font-bold leading-normal">
              Distribution
            </p>
            <p className="font-inter text-sm font-normal leading-5 text-slate-500">
              Distribute items from storage to employees
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex h-10 w-41 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 box-border transition hover:bg-slate-800 active:scale-[0.99]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
              >
                <path
                  d="M7.5 3.125V11.875"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.125 7.5H11.875"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-white font-inter text-sm font-medium leading-6 tracking-normal">
                New distribution
              </p>
            </div>
            <div className="flex h-10 w-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white p-2 transition hover:bg-slate-50 active:scale-[0.99]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 22C11.45 22 10.9792 21.8042 10.5875 21.4125C10.1958 21.0208 10 20.55 10 20H14C14 20.55 13.8042 21.0208 13.4125 21.4125C13.0208 21.8042 12.55 22 12 22ZM4 19V17H6V10C6 8.61667 6.41667 7.3875 7.25 6.3125C8.08333 5.2375 9.16667 4.53333 10.5 4.2V3.5C10.5 3.08333 10.6458 2.72917 10.9375 2.4375C11.2292 2.14583 11.5833 2 12 2C12.4167 2 12.7708 2.14583 13.0625 2.4375C13.3542 2.72917 13.5 3.08333 13.5 3.5V3.825C13.3167 4.19167 13.1833 4.56667 13.1 4.95C13.0167 5.33333 12.9833 5.725 13 6.125C12.8333 6.09167 12.6708 6.0625 12.5125 6.0375C12.3542 6.0125 12.1833 6 12 6C10.9 6 9.95833 6.39167 9.175 7.175C8.39167 7.95833 8 8.9 8 10V17H16V10.575C16.3 10.7083 16.6208 10.8125 16.9625 10.8875C17.3042 10.9625 17.65 11 18 11V17H20V19H4ZM15.875 8.125C15.2917 7.54167 15 6.83333 15 6C15 5.16667 15.2917 4.45833 15.875 3.875C16.4583 3.29167 17.1667 3 18 3C18.8333 3 19.5417 3.29167 20.125 3.875C20.7083 4.45833 21 5.16667 21 6C21 6.83333 20.7083 7.54167 20.125 8.125C19.5417 8.70833 18.8333 9 18 9C17.1667 9 16.4583 8.70833 15.875 8.125Z"
                  fill="black"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
}
