export function PhoneStatusBar() {
  return (
    <div className="flex h-12 items-center justify-between px-2 text-[#263F91]">
      <span className="text-[15px] font-black tracking-normal">9:41</span>
      <span className="h-9 w-28 rounded-full bg-[#274093]" />
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-5 rounded-full bg-[#7286CA]" />
        <span className="h-2.5 w-5 rounded-full bg-[#5369BB]" />
        <span className="h-2.5 w-7 rounded-full bg-[#2442B7]" />
      </div>
    </div>
  );
}
