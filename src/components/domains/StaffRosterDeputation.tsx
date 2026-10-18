import React, { useState } from 'react';
import { StaffMember } from '../../types/healthGrid';
import { logSecurityEvent } from '../../utils/security';

interface StaffRosterDeputationProps {
  staffList: StaffMember[];
}

export const StaffRosterDeputation: React.FC<StaffRosterDeputationProps> = ({ staffList }) => {
  const [filterRole, setFilterRole] = useState<string>('All');
  const [toast, setToast] = useState<string | null>(null);

  const roles = ['All', 'Medical Officer', 'Specialist', 'Staff Nurse', 'Community Health Officer'];

  const filtered = staffList.filter(s => {
    if (filterRole === 'All') return true;
    return s.designation.toLowerCase().includes(filterRole.toLowerCase());
  });

  const handleIssueDeputation = async (staff: StaffMember) => {
    await logSecurityEvent('STAFF_ROTATION_DEPUTATION', 'Dr. Rajesh Sharma (CMO)', `Issued deputation order for ${staff.name} to PHC Kashele`);
    setToast(`Emergency rotational deputation order generated for ${staff.name} (#ORD-2026-99). Dispatched via WhatsApp/SMS.`);
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Toast Alert */}
      {toast && (
        <div role="status" aria-live="polite" className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-base" aria-hidden="true">check_circle</span>
            <span className="font-semibold">{toast}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
          </button>
        </div>
      )}

      {/* Top Banner */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
            <span>Operations</span>
            <span aria-hidden="true">/</span>
            <span className="text-sky-700">Staff Roster &amp; Deputation</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            District Medical Officer Roster &amp; Clinical Deputation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Balancing doctor and nursing coverage across PHCs and CHCs to ensure 24/7 emergency response.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl">
            {staffList.length} Clinical Officers Active
          </span>
        </div>
      </section>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {roles.map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setFilterRole(r)}
            className={`text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors cursor-pointer shrink-0 ${
              filterRole === r ? 'bg-sky-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Staff Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(staff => {
          const isEligibleForDeputation = staff.deputationStatus === 'Base Post' || staff.deputationStatus === 'On-Call';
          return (
            <div key={staff.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{staff.name}</h3>
                  <span className="text-xs text-slate-500">{staff.designation} • {staff.specialty}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    staff.deputationStatus === 'Base Post'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : staff.deputationStatus === 'Deputed'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {staff.deputationStatus}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Base Station</span>
                  <strong className="text-slate-800">{staff.baseFacility}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Registration</span>
                  <span className="font-mono text-slate-600 text-[11px]">{staff.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 text-[10px] font-bold uppercase">Assignment</span>
                  <span className="text-slate-700 font-semibold">{staff.currentAssignment}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">Contact: {staff.contact}</span>
                {isEligibleForDeputation && (
                  <button
                    type="button"
                    onClick={() => handleIssueDeputation(staff)}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    Issue Deputation
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
