import React, { useState } from 'react';
import { FacilityRecord } from '../../types/healthGrid';

interface OverviewTriageProps {
  facilities: FacilityRecord[];
  onNavigateToSupply: () => void;
}

export const OverviewTriage: React.FC<OverviewTriageProps> = ({ facilities, onNavigateToSupply }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('All');

  const outbreakVectors = [
    {
      id: 'vec-1',
      syndrome: 'Canine Bite / Rabies Risk Cluster',
      location: 'Karjat / Neral Belt',
      cases24h: 14,
      trend: '+40% vs baseline',
      severity: 'Critical Tier-1',
      severityColor: 'text-rose-700 bg-rose-50 border-rose-200',
      actionPrompt: 'ARV Stock Exhaustion. MILP Directives active.',
      hasAction: true,
    },
    {
      id: 'vec-2',
      syndrome: 'Acute Diarrheal Disease (ADD / Monsoon)',
      location: 'Mangaon & Roha Riverside',
      cases24h: 38,
      trend: '+12% vs baseline',
      severity: 'Elevated Tier-2',
      severityColor: 'text-amber-800 bg-amber-50 border-amber-200',
      actionPrompt: 'ORS & Zinc buffer stabilized. Chlorine tablets deployed.',
      hasAction: false,
    },
    {
      id: 'vec-3',
      syndrome: 'Suspected Dengue / NS1 Positivity',
      location: 'Panvel Urban Fringe',
      cases24h: 22,
      trend: '-5% vs baseline',
      severity: 'Monitoring',
      severityColor: 'text-slate-700 bg-slate-100 border-slate-200',
      actionPrompt: 'Platelet and IV fluid buffer nominal at SDH Panvel.',
      hasAction: false,
    },
    {
      id: 'vec-4',
      syndrome: 'Snakebite Envenomation (Viperidae)',
      location: 'Poladpur Ghat & Mahad Rural',
      cases24h: 6,
      trend: 'Normal seasonal',
      severity: 'Elevated Tier-2',
      severityColor: 'text-amber-800 bg-amber-50 border-amber-200',
      actionPrompt: 'Polyvalent ASV vials prioritized for PHC Poladpur.',
      hasAction: false,
    }
  ];

  const filteredVectors = outbreakVectors.filter(v => {
    if (filterSeverity === 'All') return true;
    return v.severity.includes(filterSeverity);
  });

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Banner */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
            <span>Operations</span>
            <span aria-hidden="true">/</span>
            <span className="text-sky-700">District Epidemic Surveillance &amp; Triage</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            District Epidemic Vector Surveillance &amp; Clinical Triage
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Syndromic early warnings from 16 Primary and Community Health Centres in Raigad District.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToSupply}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">swap_horiz</span>
          <span>Open Resource Balancing</span>
        </button>
      </section>

      {/* Triage Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium">Active Vector Clusters</span>
          <div className="text-2xl font-bold text-rose-600">01 High Priority</div>
          <span className="text-[11px] text-rose-700 font-semibold block">Karjat/Neral Canine Bite Surge</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium">Outbreak Risk Index (ORI)</span>
          <div className="text-2xl font-bold text-slate-900">3.8 / 10</div>
          <span className="text-[11px] text-amber-700 font-semibold block">Elevated Monsoon Baseline</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium">District 24h Triage Caseload</span>
          <div className="text-2xl font-bold text-slate-900">1,248 Patients</div>
          <span className="text-[11px] text-emerald-600 font-semibold block">98.2% Seen within 30 mins</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium">Total Reporting Facilities</span>
          <div className="text-2xl font-bold text-slate-900">{facilities.length} Centres</div>
          <span className="text-[11px] text-sky-600 font-semibold block">100% Real-Time Connected</span>
        </div>
      </div>

      {/* Vector Alert Feed */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Active Syndromic Alerts &amp; Epidemiological Clusters</h2>
            <p className="text-[11px] text-slate-500">Live data streaming from IDSP daily telemetry loggers</p>
          </div>
          <div className="flex items-center gap-1.5">
            {['All', 'Tier-1', 'Tier-2', 'Monitoring'].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterSeverity(s)}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterSeverity === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVectors.map(v => (
            <div key={v.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{v.syndrome}</span>
                  <span className="text-xs text-slate-500 font-medium">Corridor: {v.location}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${v.severityColor}`}>
                  {v.severity}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">24h Case Count</span>
                  <strong className="text-slate-900 text-sm">{v.cases24h} Cases</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">7d Trend Velocity</span>
                  <strong className={v.trend.includes('+') ? 'text-rose-600' : 'text-emerald-600'}>
                    {v.trend}
                  </strong>
                </div>
              </div>

              <div className="text-xs text-slate-600 flex items-center justify-between">
                <span>{v.actionPrompt}</span>
                {v.hasAction && (
                  <button
                    type="button"
                    onClick={onNavigateToSupply}
                    className="text-sky-700 font-bold hover:text-sky-900 text-xs underline cursor-pointer"
                  >
                    View Directives →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
