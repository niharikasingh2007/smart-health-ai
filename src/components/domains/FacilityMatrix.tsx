import React, { useState, useEffect } from 'react';
import { FacilityRecord } from '../../types/healthGrid';
import { sanitizeInput } from '../../utils/security';

interface FacilityMatrixProps {
  facilities: FacilityRecord[];
}

export const FacilityMatrix: React.FC<FacilityMatrixProps> = ({ facilities }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedFacility, setSelectedFacility] = useState<FacilityRecord | null>(null);

  // Close inspection modal on Escape key
  useEffect(() => {
    if (!selectedFacility) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedFacility(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFacility]);

  const cleanSearch = sanitizeInput(searchTerm);
  const filtered = facilities.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(cleanSearch.toLowerCase()) || f.taluka.toLowerCase().includes(cleanSearch.toLowerCase());
    const matchesType = filterType === 'All' || f.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Top Banner */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
            <span>Operations</span>
            <span aria-hidden="true">/</span>
            <span className="text-sky-700">District Facility Matrix</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Public Health Facility Infrastructure Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive telemetry across all Primary Health Centres, Community Health Centres, and Sub-District Hospitals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
            {facilities.length} Facilities Monitored • 100% Online
          </span>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base" aria-hidden="true">search</span>
            <label htmlFor="search-facility-input" className="sr-only">Search facility name or taluka</label>
            <input
              id="search-facility-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search facility name or taluka..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {['All', 'PHC', 'CHC', 'SDH', 'DH'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                filterType === t ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Facilities Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
              <tr>
                <th scope="col" className="p-4">Facility Name &amp; Type</th>
                <th scope="col" className="p-4">Taluka</th>
                <th scope="col" className="p-4">Bed Occupancy</th>
                <th scope="col" className="p-4">Staff on Duty</th>
                <th scope="col" className="p-4">Active Stockouts</th>
                <th scope="col" className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(f => {
                const isCritical = f.status === 'critical' || f.criticalStockouts > 0 || f.doctorsOnDuty === 0;
                const isWarning = !isCritical && (f.bedOccupancy > 75 || f.status === 'elevated');
                return (
                  <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{f.name}</div>
                      <span className="text-[10px] font-semibold text-slate-500">{f.type} • ID: {f.id}</span>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{f.taluka}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              f.bedOccupancy > 80 ? 'bg-rose-500' : f.bedOccupancy > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${f.bedOccupancy}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-800">{f.bedOccupancy}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Total beds: {f.totalBeds}</span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{f.doctorsOnDuty} Doctors</div>
                      <span className="text-[10px] text-slate-500">{f.staffNurses} Nurses</span>
                    </td>
                    <td className="p-4">
                      {f.criticalStockouts > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px]">
                          {f.criticalStockouts} Stockouts
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                          Zero Deficit
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedFacility(f)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Inspect Facility
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Facility Inspection Drawer Modal */}
      {selectedFacility && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn"
        >
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 space-y-4 text-xs text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">{selectedFacility.name}</h3>
                <span className="text-slate-500 text-xs">{selectedFacility.type} • {selectedFacility.taluka} Taluka</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFacility(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Bed Vacancy</span>
                <span className="text-lg font-bold text-slate-900">
                  {selectedFacility.totalBeds - Math.round((selectedFacility.bedOccupancy * selectedFacility.totalBeds) / 100)} Beds
                </span>
                <span className="text-slate-500 block text-[10px]">of {selectedFacility.totalBeds} total</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Duty Staff</span>
                <span className="text-lg font-bold text-slate-900">
                  {selectedFacility.doctorsOnDuty} Doctors
                </span>
                <span className="text-slate-500 block text-[10px]">{selectedFacility.staffNurses} Nurses on shift</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Operational Status</span>
              <div className="font-semibold text-slate-800">
                Status: <strong className="text-sky-700 uppercase">{selectedFacility.status}</strong>
              </div>
              <div className="text-slate-500 text-[11px]">
                Active Triage Queue: {selectedFacility.activeTriageQueue} patients currently in OPD
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedFacility(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
