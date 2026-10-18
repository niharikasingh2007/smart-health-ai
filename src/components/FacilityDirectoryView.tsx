import React, { useState } from 'react';
import { FacilityRecord } from '../types/healthGrid';

interface FacilityDirectoryViewProps {
  facilities: FacilityRecord[];
}

export const FacilityDirectoryView: React.FC<FacilityDirectoryViewProps> = ({ facilities }) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [activeModalFacility, setActiveModalFacility] = useState<FacilityRecord | null>(null);

  const filtered = facilities.filter(f => {
    const matchType = selectedType === 'All' || f.type === selectedType;
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.taluka.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          District Public Healthcare Facility Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete listing of all 16 Primary Health Centres (PHC), Community Health Centres (CHC), and Sub-District Hospitals in Raigad.
        </p>

        {/* Search & Type filter */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base" aria-hidden="true">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by facility or taluka..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium mr-1">Facility Type:</span>
            {['All', 'PHC', 'CHC', 'SDH', 'DH'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  selectedType === t
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Facility Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(facility => {
          const vacantCount = facility.totalBeds - Math.round((facility.bedOccupancy * facility.totalBeds) / 100);
          const isFull = facility.bedOccupancy >= 85;

          return (
            <div
              key={facility.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{facility.name}</h3>
                    <span className="text-xs text-slate-500">{facility.taluka} Taluka</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold font-mono">
                    {facility.type}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Available Inpatient Beds:</span>
                    <strong className={isFull ? 'text-rose-600' : 'text-emerald-700'}>
                      {vacantCount} vacant / {facility.totalBeds} total
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Medical Officers:</span>
                    <strong>{facility.doctorsOnDuty} Physician{facility.doctorsOnDuty === 1 ? '' : 's'} on duty</strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Cold Chain Logistics:</span>
                    <strong className="text-emerald-700">{facility.coldChainHealth}% Optimal</strong>
                  </div>

                  <div className="flex justify-between">
                    <span>OPD Hours:</span>
                    <span>8:00 AM – 2:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Sync: {facility.lastSync}</span>
                <button
                  type="button"
                  onClick={() => setActiveModalFacility(facility)}
                  className="text-sky-600 hover:text-sky-800 font-semibold cursor-pointer"
                >
                  View Details &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Facility Details Modal */}
      {activeModalFacility && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{activeModalFacility.name}</h3>
                <span className="text-xs text-slate-500">
                  {activeModalFacility.type} • {activeModalFacility.taluka} Taluka • Raigad District
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalFacility(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Bed Status</span>
                  <span className="text-base font-bold text-slate-900">
                    {activeModalFacility.totalBeds - Math.round((activeModalFacility.bedOccupancy * activeModalFacility.totalBeds) / 100)} Vacant Beds
                  </span>
                  <span className="text-slate-500 text-[10px] block">
                    Total capacity: {activeModalFacility.totalBeds} beds
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Physicians Present</span>
                  <span className="text-base font-bold text-slate-900">
                    {activeModalFacility.doctorsOnDuty} Medical Officers
                  </span>
                  <span className="text-slate-500 text-[10px] block">
                    {activeModalFacility.staffNurses} Staff Nurses
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 block">Available Clinical Services</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  <li>24x7 Emergency Triage &amp; Casualty Stabilization</li>
                  <li>Outpatient Department (OPD): General Medicine, Pediatrics, Geriatrics</li>
                  <li>Free Essential Medicines as per IDSP Essential Drug Formulary</li>
                  <li>Primary Diagnostic Lab: Blood Pressure, Random Blood Sugar, Hemoglobin</li>
                  <li>Maternal Care &amp; Labor Room with trained auxiliary nurses</li>
                  <li>Cold Chain Immunization: Anti-Rabies Vaccine, Pentavalent, Tetanus</li>
                </ul>
              </div>

              <div className="flex justify-between items-center text-slate-500 text-[11px]">
                <span>National Health Mission (NHM) Registered</span>
                <span className="text-emerald-700 font-semibold">Active Telemetry Sync</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModalFacility(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
