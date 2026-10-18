import React from 'react';

interface TacticalRibbonProps {
  alertText?: string;
  solverCycle?: number;
  convergenceTime?: string;
  isSolving?: boolean;
}

export const TacticalRibbon: React.FC<TacticalRibbonProps> = ({
  alertText = 'Canine Bite Cluster identified in Karjat/Neral periphery. Zero ARV stock reported at PHC Neral. MILP Optimizer engaged.',
  solverCycle = 419,
  convergenceTime = '0.042s',
  isSolving = false,
}) => {
  return (
    <div className="w-full bg-[#93000a]/20 border-b border-[#93000a]/30 px-6 py-1.5 flex items-center justify-between text-[#dbe1ff]">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb4ab] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffb4ab]"></span>
        </span>
        <span className="font-mono text-[9px] uppercase text-[#ffb4ab] tracking-wider font-bold shrink-0">
          ACTIVE EPIDEMIC VECTOR ALERT:
        </span>
        <span className="text-xs text-[#dbe1ff] truncate">
          {alertText}
        </span>
      </div>
      <div className="flex items-center gap-4 text-[#89929b] shrink-0 font-mono text-[9px]">
        <span>SOLVER CYCLE #{solverCycle}</span>
        {isSolving ? (
          <span className="text-[#93ccff] flex items-center gap-1 animate-pulse">
            <span className="material-symbols-outlined text-xs animate-spin">sync</span>
            SOLVING (MILP-LP)...
          </span>
        ) : (
          <span className="text-[#4edea3] font-semibold">
            CONVERGED ({convergenceTime})
          </span>
        )}
      </div>
    </div>
  );
};
