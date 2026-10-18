import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { FacilityRecord } from '../types/healthGrid';

interface DistrictGisMapProps {
  facilities: FacilityRecord[];
  onTriggerRestock: (facility: FacilityRecord) => void;
}

export const DistrictGisMap: React.FC<DistrictGisMapProps> = ({
  facilities,
  onTriggerRestock
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'low_stock' | 'bed_shortage'>('all');

  const filteredFacilities = facilities.filter(f => {
    if (activeFilter === 'critical') return f.status === 'critical' || f.criticalStockouts > 0 || f.doctorsOnDuty === 0;
    if (activeFilter === 'low_stock') return f.criticalStockouts > 0;
    if (activeFilter === 'bed_shortage') return f.bedOccupancy > 75;
    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Raigad District coordinates
    const map = L.map(mapContainerRef.current, {
      center: [18.58, 73.20],
      zoom: 9.5,
      zoomControl: true,
      scrollWheelZoom: false
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors • Raigad District Health GIS',
      maxZoom: 18,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when facilities or activeFilter change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredFacilities.forEach(f => {
      const isCritical = f.status === 'critical' || f.criticalStockouts > 0 || f.doctorsOnDuty === 0;
      const isWarning = !isCritical && (f.bedOccupancy > 75 || f.status === 'elevated');

      const color = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981';
      const statusLabel = isCritical ? 'Critical Alert' : isWarning ? 'Warning / Low Supply' : 'Normal Operations';

      // Custom SVG marker pin
      const markerHtml = `
        <div style="
          background-color: ${color};
          width: 28px;
          height: 28px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-leaflet-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      });

      const vacantBeds = f.totalBeds - Math.round((f.bedOccupancy * f.totalBeds) / 100);

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 text-slate-800 text-xs font-sans';
      popupContent.innerHTML = `
        <div style="font-family: 'Inter', sans-serif; min-width: 210px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="font-size: 13px; color: #0F172A;">${f.name}</strong>
            <span style="font-size: 9px; font-weight: 700; background: #E2E8F0; padding: 2px 6px; border-radius: 4px; color: #334155;">
              ${f.type}
            </span>
          </div>
          <div style="color: #64748B; font-size: 11px; margin-bottom: 8px;">${f.taluka} Taluka • ${f.opdHours || '8 AM - 2 PM'}</div>
          
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 6px; margin-bottom: 8px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span>Vacant Beds:</span>
              <strong style="color: ${f.bedOccupancy > 80 ? '#EF4444' : '#10B981'};">${vacantBeds} of ${f.totalBeds} beds</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span>Doctor On Duty:</span>
              <strong>${f.doctorsOnDuty > 0 ? `${f.doctorsOnDuty} Physician` : '0 (Relief Req)'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Status:</span>
              <strong style="color: ${color};">${statusLabel}</strong>
            </div>
          </div>

          <button id="restock-btn-${f.id}" style="
            width: 100%;
            background: #0284C7;
            color: #ffffff;
            font-size: 11px;
            font-weight: 600;
            padding: 6px 10px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          ">
            Trigger Emergency Restock
          </button>
        </div>
      `;

      // Bind button click
      const marker = L.marker([f.latitude, f.longitude], { icon: customIcon });
      marker.bindPopup(popupContent);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`restock-btn-${f.id}`);
        if (btn) {
          btn.onclick = () => {
            onTriggerRestock(f);
            marker.closePopup();
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredFacilities, onTriggerRestock]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
      {/* Map Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <i className="fa-solid fa-map-location-dot text-base" aria-hidden="true"></i>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              District GIS Health Facility Geospatial Grid
            </h3>
            <span className="text-[11px] text-slate-500">
              Interactive Leaflet GIS • Real-time status pins across Raigad
            </span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="GIS map view filters">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Facilities ({facilities.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('critical')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'critical'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" aria-hidden="true"></span>
            Critical Risk (2)
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('low_stock')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'low_stock'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true"></span>
            Low Stock Nodes
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('bed_shortage')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'bed_shortage'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            Bed Saturation
          </button>
        </div>
      </div>

      {/* Embedded Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-[360px] rounded-xl border border-slate-200 z-10 overflow-hidden shadow-inner"
        style={{ minHeight: '360px' }}
      ></div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Normal Status (&gt;7d stock, doctor present)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Warning (&lt;3d stock or &gt;75% bed occ)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            Critical Deficit (0 stock or 0 doctor)
          </span>
        </div>
        <span className="font-mono text-[10px]">Lat: 18.58°N • Lng: 73.20°E</span>
      </div>
    </div>
  );
};
