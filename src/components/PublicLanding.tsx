import React, { useState } from 'react';
import { FacilityRecord, EssentialDrug } from '../types/healthGrid';

interface PublicLandingProps {
  facilities: FacilityRecord[];
  drugs: EssentialDrug[];
  onOpenLogin: () => void;
  onSelectFacility: (facility: FacilityRecord) => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  facilities,
  drugs,
  onOpenLogin,
  onSelectFacility
}) => {
  const [selectedTaluka, setSelectedTaluka] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const talukas = ['All', 'Karjat', 'Pen', 'Alibag', 'Roha', 'Mahad', 'Mangaon', 'Poladpur'];

  const filteredFacilities = facilities.filter(f => {
    const matchTaluka = selectedTaluka === 'All' || f.taluka.toLowerCase() === selectedTaluka.toLowerCase();
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.taluka.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTaluka && matchSearch;
  });

  const totalBeds = facilities.reduce((sum, f) => sum + f.totalBeds, 0);
  const totalOccupied = facilities.reduce((sum, f) => sum + Math.round((f.bedOccupancy * f.totalBeds) / 100), 0);
  const totalVacantBeds = totalBeds - totalOccupied;
  const doctorsPresent = facilities.reduce((sum, f) => sum + f.doctorsOnDuty, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <section className="bg-gradient-to-b from-sky-50/80 to-white border border-sky-100 rounded-3xl p-6 sm:p-10 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 text-sky-800 text-xs font-semibold mb-4 border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span>Public Health Infrastructure • Raigad District Network</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Transparent Healthcare Operations for Every Citizen
          </h1>

          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Real-time public tracker for Primary Health Centres (PHC) and Community Health Centres (CHC). Check live bed vacancies, doctor attendance on duty, free diagnostic testing availability, and emergency medicine buffers without technical jargon.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#facilities-section"
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xs text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg" aria-hidden="true">search</span>
              <span>Find Nearest PHC / Bed Vacancy</span>
            </a>

            <button
              type="button"
              onClick={onOpenLogin}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg text-slate-500" aria-hidden="true">lock</span>
              <span>Staff / Official Portal Login</span>
            </button>
          </div>
        </div>
      </section>

      {/* District Macro Statistics Strip */}
      <section aria-label="District Health Summary" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Operational Centres</span>
            <span className="material-symbols-outlined text-sky-600" aria-hidden="true">domain</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{facilities.length} Facilities</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">check_circle</span>
            100% Reporting Online
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Vacant Inpatient Beds</span>
            <span className="material-symbols-outlined text-emerald-600" aria-hidden="true">bed</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{totalVacantBeds} Beds Ready</div>
          <span className="text-[11px] text-slate-500">
            {totalOccupied} of {totalBeds} currently occupied
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Doctors on Active Duty</span>
            <span className="material-symbols-outlined text-indigo-600" aria-hidden="true">stethoscope</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{doctorsPresent} Physicians</div>
          <span className="text-[11px] text-slate-500">
            Across Casualty &amp; General OPD
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Essential Medicines</span>
            <span className="material-symbols-outlined text-amber-600" aria-hidden="true">medication</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">91.4% Stock Buffer</div>
          <span className="text-[11px] text-sky-600 font-semibold">
            Auto-Redistribution Active
          </span>
        </div>
      </section>

      {/* Public Outbreak & Triage Announcement Ticker */}
      <section className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 shrink-0 font-bold">
            <span className="material-symbols-outlined text-lg animate-pulse" aria-hidden="true">warning</span>
          </span>
          <div>
            <span className="font-bold text-rose-900 block sm:inline mr-2">PUBLIC HEALTH NOTICE:</span>
            <span className="text-rose-800">
              Canine bite cluster reported in Karjat/Neral belt. Free Anti-Rabies Vaccine (ARV) emergency cold-courier dispatched to PHC Neral. Category-III bite cases directed to CHC Karjat and PHC Neral.
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono text-rose-700 font-semibold shrink-0">
          Emergency Desk: 108 / 104
        </span>
      </section>

      {/* Public Facility Status Board */}
      <section id="facilities-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Primary &amp; Community Health Centre Live Directory
            </h2>
            <p className="text-xs text-slate-500">
              Select any centre to inspect services, duty doctors, and bed vacancies
            </p>
          </div>

          {/* Search and Taluka Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-base" aria-hidden="true">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search facility name..."
                className="bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 w-48 sm:w-60"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {talukas.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTaluka(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    selectedTaluka === t
                      ? 'bg-sky-600 text-white font-semibold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Facility Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFacilities.map((facility) => {
            const vacantCount = facility.totalBeds - Math.round((facility.bedOccupancy * facility.totalBeds) / 100);
            const isFull = facility.bedOccupancy >= 85;
            const isModerate = facility.bedOccupancy >= 65 && facility.bedOccupancy < 85;

            return (
              <div
                key={facility.id}
                onClick={() => onSelectFacility(facility)}
                className="bg-white border border-slate-200 hover:border-sky-300 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors text-sm">
                          {facility.name}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold">
                          {facility.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        {facility.taluka} Taluka • Sub-District Belt
                      </span>
                    </div>

                    {/* Bed Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                        isFull
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isModerate
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isFull ? 'bg-rose-600' : isModerate ? 'bg-amber-600' : 'bg-emerald-600'}`} aria-hidden="true" />
                      {isFull ? 'High Occupancy' : isModerate ? 'Moderate Beds' : 'Vacant Beds Available'}
                    </span>
                  </div>

                  {/* Bed Meter */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Bed Availability:</span>
                      <span className="font-semibold text-slate-900">
                        {vacantCount} vacant / {facility.totalBeds} total
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          isFull ? 'bg-rose-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${facility.bedOccupancy}%` }}
                      />
                    </div>
                  </div>

                  {/* Services and Doctor Status */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Doctor on Duty:</span>
                      <span className={`font-semibold ${facility.doctorsOnDuty > 0 ? 'text-slate-800' : 'text-rose-600'}`}>
                        {facility.doctorsOnDuty > 0 ? `${facility.doctorsOnDuty} Physician Present` : 'Relief On-Call'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">OPD Timings:</span>
                      <span className="text-slate-800 font-medium">8:00 AM – 2:00 PM</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Free Diagnostics:</span>
                      <span className="text-emerald-700 font-medium">BP, Sugar, Hemoglobin</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-sky-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>View Facility Details</span>
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* User Guidance / Explanatory Section */}
      <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          How the District Health Platform Operates
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">1</div>
            <h4 className="font-bold text-slate-800 text-sm">For Citizens &amp; Patients</h4>
            <p className="leading-relaxed">
              Check real-time bed availability before traveling to a health center. Use the floating AI Assistant at the bottom-right to ask any question in simple everyday words.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">2</div>
            <h4 className="font-bold text-slate-800 text-sm">For PHC &amp; CHC Staff</h4>
            <p className="leading-relaxed">
              Log in using staff credentials to submit your centre's daily morning medicine counts, available bed tallies, and OPD patient footfall in under two minutes.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">3</div>
            <h4 className="font-bold text-slate-800 text-sm">For District Health Officers (DMO)</h4>
            <p className="leading-relaxed">
              View automatic deficit alerts. When a health centre runs low on critical drugs like Anti-Rabies Vaccine, transfer stock from surplus depots with a single click.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
