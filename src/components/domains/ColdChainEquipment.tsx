import React, { useState } from 'react';
import { ColdChainUnit } from '../../types/healthGrid';

interface ColdChainEquipmentProps {
  units: ColdChainUnit[];
}

export const ColdChainEquipment: React.FC<ColdChainEquipmentProps> = ({ units }) => {
  const [filterBreach, setFilterBreach] = useState<boolean>(false);

  const displayedUnits = filterBreach ? units.filter(u => u.status !== 'optimal') : units;

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Top Banner */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
            <span>Operations</span>
            <span aria-hidden="true">/</span>
            <span className="text-sky-700">Cold Chain &amp; Thermal Telemetry</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            District Cold Chain &amp; Vaccine Thermal Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time IoT temperature sensor tracking for Ice Lined Refrigerators (ILR) and Deep Freezers (2°C - 8°C).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFilterBreach(!filterBreach)}
          className={`text-xs font-semibold px-4 py-2.5 rounded-xl border transition-colors cursor-pointer ${
            filterBreach
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
        >
          {filterBreach ? 'Show All Units' : 'Show Temperature Breaches Only'}
        </button>
      </section>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedUnits.map(unit => {
          const isBreach = unit.status === 'breach';
          const isWarning = unit.status === 'warning';
          return (
            <div
              key={unit.id}
              className={`bg-white border rounded-3xl p-5 shadow-xs space-y-3 ${
                isBreach ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{unit.facility}</h3>
                  <span className="text-[11px] text-slate-500">{unit.model} ({unit.equipmentType})</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isBreach
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : isWarning
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {unit.status.toUpperCase()}
                </span>
              </div>

              {/* Temp Display */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Temperature</span>
                  <div className={`text-2xl font-black ${isBreach ? 'text-rose-600' : 'text-slate-900'}`}>
                    {unit.currentTemp}°C
                  </div>
                </div>
                <div className="text-right text-[11px]">
                  <span className="text-slate-400 block text-[10px]">Threshold Window</span>
                  <strong className="text-slate-700">2.0°C – 8.0°C</strong>
                  <span className="text-emerald-700 block font-semibold text-[10px]">
                    Battery: {unit.batteryPct ?? 95}%
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                <span>Power Source: <strong className="text-slate-700">{unit.powerSource}</strong></span>
                <span className="text-[10px]">Ping {unit.lastPing}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
