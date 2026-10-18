import React from 'react';
import { TacticalDomain } from '../types/healthGrid';

interface SidebarProps {
  currentDomain: TacticalDomain;
  onSelectDomain: (domain: TacticalDomain) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentDomain, onSelectDomain }) => {
  const domains: { id: TacticalDomain; label: string; icon: string }[] = [
    { id: 'overview-triage', label: 'Overview & Triage', icon: 'grid_view' },
    { id: 'facility-matrix', label: 'Facility Matrix', icon: 'local_hospital' },
    { id: 'supply-redistribution', label: 'Supply & Redistribution', icon: 'swap_horiz' },
    { id: 'cold-chain-equipment', label: 'Cold Chain & Equipment', icon: 'ac_unit' },
    { id: 'staff-roster-deputation', label: 'Staff Roster & Deputation', icon: 'badge' },
  ];

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="fixed left-0 top-16 bottom-0 w-64 bg-[#050d25] border-r border-[#3f4850]/30 z-40 flex flex-col justify-between"
    >
      <div className="flex flex-col pt-4">
        {/* Category Header */}
        <div className="px-4 mb-3">
          <span className="font-mono text-[9px] text-[#89929b] uppercase tracking-widest font-semibold">
            Mission Tactical Domains
          </span>
        </div>

        {/* Navigation list */}
        <nav aria-label="Mission Tactical Domains" className="flex flex-col gap-1 px-2">
          {domains.map((item) => {
            const isActive = currentDomain === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Navigate to ${item.label}`}
                onClick={() => onSelectDomain(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all text-left text-xs focus-visible:ring-2 focus-visible:ring-[#93ccff] ${
                  isActive
                    ? 'bg-[#212942] text-[#93ccff] border-l-2 border-[#93ccff] font-semibold shadow-sm'
                    : 'text-[#bfc7d2] hover:bg-[#171e37] hover:text-[#dbe1ff]'
                }`}
              >
                <span className={`material-symbols-outlined text-lg ${isActive ? 'text-[#93ccff]' : 'text-[#89929b]'}`} aria-hidden="true">
                  {item.icon}
                </span>
                <span className="font-medium tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Network Bandwidth and Encryption Footer */}
      <div className="p-3 border-t border-[#3f4850]/30 bg-[#131a33]/50">
        <div className="flex items-center justify-between text-[#89929b] mb-1">
          <span className="font-mono text-[9px] uppercase tracking-wider">Network Bandwidth</span>
          <span className="font-mono text-[9px] text-[#4edea3] font-semibold">48.2 Mbps</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={84}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Network capacity gauge"
          className="w-full bg-[#2c344d] h-1 rounded overflow-hidden"
        >
          <div className="bg-[#4edea3] h-full w-[84%] transition-all duration-500"></div>
        </div>
        <div className="mt-2 flex items-center justify-between text-[#89929b]">
          <span className="font-mono text-[9px] tracking-wider">NIC-SECURED LINK</span>
          <span className="font-mono text-[9px] text-[#93ccff] font-semibold">AES-256</span>
        </div>
      </div>
    </aside>
  );
};
