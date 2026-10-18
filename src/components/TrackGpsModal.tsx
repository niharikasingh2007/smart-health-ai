import React from 'react';
import { OptimizationDirective } from '../types/healthGrid';

interface TrackGpsModalProps {
  directive: OptimizationDirective | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TrackGpsModal: React.FC<TrackGpsModalProps> = ({
  directive,
  isOpen,
  onClose
}) => {
  if (!isOpen || !directive) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gps-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn"
    >
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col text-slate-900">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-xl animate-pulse" aria-hidden="true">sensors</span>
            </div>
            <div>
              <h2 id="gps-modal-title" className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">
                Live Courier Telemetry: {directive.code}
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Active Cold-Box Transit • Route {directive.highway}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tracking telemetry dialog"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Driver & Status card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                MH
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">{directive.driverName || 'Suresh Patil'}</span>
                <span className="text-slate-500 text-[11px]">
                  Driver Mobile: <strong className="text-slate-700">{directive.driverPhone || '+91 98230 44910'}</strong>
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px] block">
                IN TRANSIT (ON TIME)
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Speed: 42 km/h</span>
            </div>
          </div>

          {/* IoT Cold Chain Telemetry Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Internal Temp</span>
              <span className="text-xl font-extrabold text-sky-800 block mt-0.5">3.8°C</span>
              <span className="text-emerald-700 text-[10px] font-semibold block mt-0.5">Safe (2°C - 8°C)</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Ambient Temp</span>
              <span className="text-xl font-extrabold text-slate-800 block mt-0.5">32.4°C</span>
              <span className="text-slate-500 text-[10px] block mt-0.5">Ghat Highway</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Battery State</span>
              <span className="text-xl font-extrabold text-slate-800 block mt-0.5">94%</span>
              <span className="text-emerald-700 text-[10px] font-semibold block mt-0.5">IoT Logger Nominal</span>
            </div>
          </div>

          {/* Route Progress Visualizer */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600">Route Progression: {directive.distance}</span>
              <span className="text-sky-700 font-bold">ETA: {directive.eta}</span>
            </div>

            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-600 h-full w-2/3"></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>{directive.donorName}</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-sky-800">
                <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping"></span>
                <span>En-Route Highway Point</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>{directive.recipientName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            GPS coordinates refreshed every 15 seconds via NIC Vehicle Beacon.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs px-5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Close Telemetry View
          </button>
        </div>
      </div>
    </div>
  );
};
