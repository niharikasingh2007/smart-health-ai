import React, { useState } from 'react';
import { FacilityRecord, EssentialDrug, AuthUser } from '../types/healthGrid';
import { logSecurityEvent } from '../utils/security';

interface UserDataEntryPortalProps {
  currentUser: AuthUser;
  facilities: FacilityRecord[];
  drugs: EssentialDrug[];
  onUpdateFacility: (updated: FacilityRecord) => void;
  onUpdateDrugStock: (drugId: string, facilityName: string, newStock: number) => void;
}

export const UserDataEntryPortal: React.FC<UserDataEntryPortalProps> = ({
  currentUser,
  facilities,
  drugs,
  onUpdateFacility,
  onUpdateDrugStock
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState(
    facilities.find(f => f.name.includes('Neral'))?.id || facilities[0]?.id
  );

  const facility = facilities.find(f => f.id === selectedFacilityId) || facilities[0];

  // Local Form State
  const [generalBeds, setGeneralBeds] = useState(facility.totalBeds - Math.round((facility.bedOccupancy * facility.totalBeds) / 100));
  const [doctorsOnDuty, setDoctorsOnDuty] = useState(facility.doctorsOnDuty);
  const [staffNurses, setStaffNurses] = useState(facility.staffNurses);
  const [opdFootfall, setOpdFootfall] = useState(48);
  const [feverClinicCases, setFeverClinicCases] = useState(12);
  const [emergencyCases, setEmergencyCases] = useState(4);

  // Medicine stocks state for selected facility
  const [medicineStocks, setMedicineStocks] = useState<Record<string, number>>({
    'drug-1': 0,    // ARV Vials
    'drug-2': 120,  // Paracetamol
    'drug-3': 80,   // Amoxicillin
    'drug-4': 340,  // ORS
    'drug-5': 14,   // Oxytocin
  });

  const [toast, setToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStockChange = (drugId: string, value: number) => {
    setMedicineStocks(prev => ({
      ...prev,
      [drugId]: Math.max(0, value)
    }));
  };

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Calculate new bed occupancy percentage based on updated vacant beds
    const total = facility.totalBeds;
    const occupied = Math.max(0, total - generalBeds);
    const newOccupancy = Math.min(100, Math.round((occupied / total) * 100));

    const updatedFacility: FacilityRecord = {
      ...facility,
      bedOccupancy: newOccupancy,
      doctorsOnDuty,
      staffNurses,
      activeTriageQueue: opdFootfall,
      criticalStockouts: medicineStocks['drug-1'] === 0 ? 1 : 0,
      lastSync: 'Just now'
    };

    // Propagate updates to facility
    onUpdateFacility(updatedFacility);

    // Propagate stock updates for each medicine
    Object.entries(medicineStocks).forEach(([drugId, count]) => {
      onUpdateDrugStock(drugId, facility.name, count);
    });

    await logSecurityEvent(
      'DAILY_FACILITY_REPORT_SUBMITTED',
      currentUser.name,
      `Submitted daily inventory & bed report for ${facility.name} by ${currentUser.email}`
    );

    setTimeout(() => {
      setIsSubmitting(false);
      setToast(`Daily operational report for ${facility.name} saved and synced across district grid successfully!`);
      setTimeout(() => setToast(null), 5000);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Toast message */}
      {toast && (
        <div role="status" aria-live="polite" className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-emerald-600 text-xl" aria-hidden="true">check_circle</span>
            <span className="text-sm font-semibold">{toast}</span>
          </div>
          <button 
            type="button"
            onClick={() => setToast(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">close</span>
          </button>
        </div>
      )}

      {/* Portal Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">assignment_turned_in</span>
            <span>PHC / CHC Staff Daily Operations Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Submit Daily Facility Data
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <strong>{currentUser.name}</strong> ({currentUser.designation})
          </p>
        </div>

        {/* Facility Selector */}
        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
          <label htmlFor="select-centre" className="block text-[11px] font-semibold text-slate-600 mb-1">
            Current Health Centre:
          </label>
          <select
            id="select-centre"
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {facilities.map(f => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.taluka} Taluka)
              </option>
            ))}
          </select>
        </div>
      </div>

      <form onSubmit={handleSaveReport} className="space-y-6">
        {/* SECTION 1: MEDICINE STOCK TRACKER */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg" aria-hidden="true">medication</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">1. Essential Medicine Stocks in Hand</h2>
                <span className="text-xs text-slate-500">Record current morning shelf stock to trigger auto-replenishment</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">WHO / IDSP Formulary</span>
          </div>

          <div className="space-y-3">
            {drugs.slice(0, 5).map(drug => {
              const count = medicineStocks[drug.id] ?? 50;
              const isZero = count === 0;
              const isLow = count > 0 && count < drug.reorderBoundary;

              return (
                <div
                  key={drug.id}
                  className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{drug.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isZero
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isLow
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {isZero ? 'CRITICAL (0 STOCK)' : isLow ? 'LOW SUPPLY WARNING' : 'ADEQUATE BUFFER'}
                      </span>
                    </div>
                    <span className="text-slate-500 block">{drug.form}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-medium">Quantity on hand:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStockChange(drug.id, count - 10)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={count}
                        onChange={(e) => handleStockChange(drug.id, parseInt(e.target.value) || 0)}
                        className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleStockChange(drug.id, count + 10)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: BED VACANCY COUNTER */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg" aria-hidden="true">bed</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">2. Inpatient Bed Availability</h2>
                <span className="text-xs text-slate-500">Total capacity for {facility.name}: {facility.totalBeds} Beds</span>
              </div>
            </div>
            <span className="text-xs text-emerald-700 font-bold">
              {generalBeds} Available Beds
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">General Ward Vacant Beds</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGeneralBeds(Math.max(0, generalBeds - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700"
                >
                  -
                </button>
                <span className="text-lg font-bold text-slate-900 w-12 text-center">{generalBeds}</span>
                <button
                  type="button"
                  onClick={() => setGeneralBeds(Math.min(facility.totalBeds, generalBeds + 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-slate-700"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">Maternity / Delivery Beds</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">4 Vacant</span>
                <span className="text-slate-500">(Labor ward ready)</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block">Emergency Observation</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-900">2 Beds</span>
                <span className="text-emerald-600 font-semibold">(Oxygen fitted)</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PATIENT FOOTFALL & DOCTOR ATTENDANCE */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-lg" aria-hidden="true">groups</span>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">3. Daily Patient Footfall &amp; Duty Register</h2>
                <span className="text-xs text-slate-500">Record registrations and on-site staff presence</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label htmlFor="opd-count" className="block text-slate-700 font-semibold mb-1">
                General OPD Footfall (Today)
              </label>
              <input
                id="opd-count"
                type="number"
                min="0"
                value={opdFootfall}
                onChange={(e) => setOpdFootfall(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label htmlFor="fever-count" className="block text-slate-700 font-semibold mb-1">
                Fever / Monsoon Clinic
              </label>
              <input
                id="fever-count"
                type="number"
                min="0"
                value={feverClinicCases}
                onChange={(e) => setFeverClinicCases(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-sm font-semibold"
              />
            </div>

            <div>
              <label htmlFor="doc-count" className="block text-slate-700 font-semibold mb-1">
                Doctors on Active Duty
              </label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setDoctorsOnDuty(Math.max(0, doctorsOnDuty - 1))}
                  className="w-7 h-7 rounded bg-slate-100 border border-slate-300 font-bold"
                >
                  -
                </button>
                <span className="font-bold text-sm text-slate-900 w-8 text-center">{doctorsOnDuty}</span>
                <button
                  type="button"
                  onClick={() => setDoctorsOnDuty(doctorsOnDuty + 1)}
                  className="w-7 h-7 rounded bg-slate-100 border border-slate-300 font-bold"
                >
                  +
                </button>
                <span className="text-[11px] text-slate-500">Physicians</span>
              </div>
            </div>

            <div>
              <label htmlFor="nurse-count" className="block text-slate-700 font-semibold mb-1">
                Staff Nurses on Shift
              </label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setStaffNurses(Math.max(1, staffNurses - 1))}
                  className="w-7 h-7 rounded bg-slate-100 border border-slate-300 font-bold"
                >
                  -
                </button>
                <span className="font-bold text-sm text-slate-900 w-8 text-center">{staffNurses}</span>
                <button
                  type="button"
                  onClick={() => setStaffNurses(staffNurses + 1)}
                  className="w-7 h-7 rounded bg-slate-100 border border-slate-300 font-bold"
                >
                  +
                </button>
                <span className="text-[11px] text-slate-500">Nurses</span>
              </div>
            </div>
          </div>
        </section>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-sm text-sm transition-all flex items-center gap-2 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin" aria-hidden="true">refresh</span>
                <span>Saving Report &amp; Syncing Grid...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg" aria-hidden="true">cloud_upload</span>
                <span>Save &amp; Sync Facility Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
