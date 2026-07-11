import type { WorkspaceTab } from "../data/workspace";

type WorkspaceSegmentTabsProps = {
  tabs: Array<{ key: WorkspaceTab; label: string }>;
  activeTab: WorkspaceTab;
  onChange: (tab: WorkspaceTab) => void;
};

export function WorkspaceSegmentTabs({ tabs, activeTab, onChange }: WorkspaceSegmentTabsProps) {
  return (
    <div className="sticky top-0 z-10 -mx-5 bg-[#EFF5FF]/95 px-5 py-3 backdrop-blur">
      <div className="grid grid-cols-3 rounded-[22px] bg-[#E5EFFD] p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`h-11 rounded-[17px] text-[13px] font-black transition ${
              activeTab === tab.key ? "bg-white text-[#2442B7] shadow-[0_8px_16px_rgba(91,129,190,0.15)]" : "text-[#89AEE4]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
