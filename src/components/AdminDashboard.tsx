import React, { useState } from 'react';
import { FacilityRecord, EssentialDrug, OptimizationDirective, AuthUser } from '../types/healthGrid';
import { logSecurityEvent } from '../utils/security';

interface AdminDashboardProps {
  currentUser: AuthUser;
  facilities: FacilityRecord[];
  drugs: EssentialDrug[];
  directives: OptimizationDirective[];
  onOpenTrainModel: () => void;
  onNavigateToSupply: () => void;
  onDispatchDirective: (directiveId: string) => void;
  onIssueDeputation: (directiveId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  facilities,
  drugs,
  directives,
  onOpenTrainModel,
  onNavigateToSupply,
  onDispatchDirective,
  onIssueDeputation
}) => {
  const [toast, setToast] = useState<string | null>(null);

  // Auto-flagged underperforming centres
  const underperformingCentres = facilities.filter(f => 
    f.criticalStockouts > 0 || f.doctorsOnDuty === 0 || f.bedOccupancy > 85 || f.activeTriageQueue > 40
  );

  const totalBeds = facilities.reduce((sum, f) => sum + f.totalBeds, 0);
  const totalOccupied = facilities.reduce((sum, f) => sum + Math.round((f.bedOccupancy * f.totalBeds) / 100), 0);
  const totalDoctors = facilities.reduce((sum, f) => sum + f.doctorsOnDuty, 0);

  const handleQuickDispatch = async (directiveId: string) => {
    onDispatchDirective(directiveId);
    await logSecurityEvent('ADMIN_EMERGENCY_DISPATCH', currentUser.name, `Dispatched directive ${directiveId}`);
    setToast('Emergency transshipment dispatched via NIC cold courier! Tracking live.');
    setTimeout(() => setToast(null), 4000);
  };

  const handleQuickDeputation = async (directiveId: string) => {
    onIssueDeputation(directiveId);
    await logSecurityEvent('ADMIN_STAFF_DEPUTATION', currentUser.name, `Authorized relief deputation ${directiveId}`);
    setToast('Staff Deputation Order #ST-114 issued and transmitted via SMS/WhatsApp to Dr. S. More!');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div role="status" aria-live="polite" className="bg-sky-50 border border-sky-300 text-sky-900 p-4 rounded-xl flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600 text-xl" aria-hidden="true">check_circle</span>
            <span className="text-sm font-semibold">{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-sky-700 hover:text-sky-900">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">close</span>
          </button>
        </div>
      )}

      {/* Admin Command Header Banner */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 mb-1">
            <span className="material-symbols-outlined text-base" aria-hidden="true">shield</span>
            <span>District Medical Officer Command Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Raigad District Healthcare Oversight
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervising 16 Health Centres • Live Triage &amp; Resource Redistribution
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenTrainModel}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">model_training</span>
            <span>Train AI Demand Model</span>
          </button>

          <button
            type="button"
            onClick={onNavigateToSupply}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">swap_horiz</span>
            <span>Full MILP Redistribution</span>
          </button>
        </div>
      </section>

      {/* District KPI Summary */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium">Critical Deficit Nodes</span>
          <div className="text-2xl font-bold text-rose-600">02 Centres</div>
          <span className="text-[11px] text-rose-700 font-semibold block">
            PHC Neral (ARV) &amp; PHC Kashele (Doctor)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium">District Bed Occupancy</span>
          <div className="text-2xl font-bold text-slate-900">
            {Math.round((totalOccupied / totalBeds) * 100)}%
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {totalBeds - totalOccupied} Vacant beds ready
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium">Doctors on Active Shift</span>
          <div className="text-2xl font-bold text-slate-900">{totalDoctors} Present</div>
          <span className="text-[11px] text-slate-500 block">
            87.5% Duty attendance rate
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium">Active Transit Routes</span>
          <div className="text-2xl font-bold text-sky-600">06 Routes</div>
          <span className="text-[11px] text-sky-700 font-semibold block">
            2 Cold-chain verified (2°-8°C)
          </span>
        </div>
      </section>

      {/* AUTO-FLAGGED UNDERPERFORMING CENTRES */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600" aria-hidden="true">flag</span>
            <h2 className="font-bold text-slate-900 text-sm">
              Auto-Flagged Attention Centres ({underperformingCentres.length} Centres Requiring Intervention)
            </h2>
          </div>
          <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            Action Priority
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: PHC Neral */}
          <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">PHC Neral</span>
                <span className="text-xs text-slate-500 block">Karjat Taluka • Epidemic Outbreak Belt</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-200 text-rose-900 rounded-md">
                0 ARV VIALS
              </span>
            </div>

            <p className="text-xs text-slate-700">
              Canine bite outbreak identified. 14 patients presented in 24 hours. Zero rabies vaccines on site.
            </p>

            <div className="bg-white p-3 rounded-xl border border-rose-100 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Recommended Transfer Directive:</span>
                <span className="font-bold text-slate-800">20 Vials ARV from Alibag Central Depot (#TR-904)</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDispatch('dir-1')}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                Dispatch Courier
              </button>
            </div>
          </div>

          {/* Card 2: PHC Kashele */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">PHC Kashele</span>
                <span className="text-xs text-slate-500 block">Karjat Taluka • High Queue</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md">
                0 DOCTORS ON SITE
              </span>
            </div>

            <p className="text-xs text-slate-700">
              58 patients waiting in triage queue with 0 Medical Officers present. Paracetamol buffer at 1.4 days.
            </p>

            <div className="bg-white p-3 rounded-xl border border-amber-100 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Recommended Relief Reallocation:</span>
                <span className="font-bold text-slate-800">Depute Dr. S. More from CHC Karjat (#ST-114)</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDeputation('dir-3')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                Issue Deputation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* RESOURCE REDISTRIBUTION DIRECTIVES */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sky-600" aria-hidden="true">sync_alt</span>
            <h2 className="font-bold text-slate-900 text-sm">Active Transshipment Directives</h2>
          </div>
          <button
            type="button"
            onClick={onNavigateToSupply}
            className="text-xs font-semibold text-sky-600 hover:underline"
          >
            Open Full Supply &amp; Map Visualizer &rarr;
          </button>
        </div>

        <div className="space-y-3">
          {directives.map(dir => (
            <div
              key={dir.id}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{dir.code}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    dir.urgency === 'P1 Emergency'
                      ? 'bg-rose-100 text-rose-800'
                      : dir.urgency === 'Scheduled Batch P2'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {dir.urgency}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-medium">ETA: {dir.eta}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <span className="font-semibold">{dir.donorName}</span>
                  <span className="material-symbols-outlined text-sm text-slate-400" aria-hidden="true">arrow_forward</span>
                  <span className="font-semibold text-sky-700">{dir.recipientName}</span>
                  <span className="text-slate-400">({dir.distance})</span>
                </div>

                <div className="text-slate-500 text-[11px]">
                  Payload: <strong>{dir.manifest.map(m => `${m.quantity} ${m.name}`).join(', ')}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {dir.status === 'dispatched' || dir.isSigned ? (
                  <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">check</span>
                    <span>Dispatched / In-Transit</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleQuickDispatch(dir.id)}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Authorize &amp; Dispatch
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DOCTOR ATTENDANCE TRACKER */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600" aria-hidden="true">badge</span>
            <h2 className="font-bold text-slate-900 text-sm">Doctor Attendance &amp; Duty Roster</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">NIC Biometric Shift Log</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {facilities.slice(0, 6).map(fac => (
            <div key={fac.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{fac.name}</span>
                <span className="text-[11px] text-slate-500">{fac.taluka} Taluka</span>
              </div>
              <div className="text-right">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  fac.doctorsOnDuty > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {fac.doctorsOnDuty > 0 ? `${fac.doctorsOnDuty} MO Present` : '0 MO (Relief Req)'}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {fac.staffNurses} Staff Nurses
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
