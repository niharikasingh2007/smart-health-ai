import React, { useState, useMemo, useCallback } from 'react';
import { EssentialDrug, OptimizationDirective, DrugCategory, UrgencyTier } from '../../types/healthGrid';
import { TrainModelModal } from '../TrainModelModal';
import { TrainingMetrics, ForecastResult } from '../../utils/mlModel';

interface SupplyRedistributionProps {
  drugs: EssentialDrug[];
  directives: OptimizationDirective[];
  onOpenSignDispatch: (directive: OptimizationDirective) => void;
  onOpenTrackGps: (directive: OptimizationDirective) => void;
  onIssueDeputation: (directiveId: string) => void;
  onRerunMilp: () => void;
  isSolving: boolean;
  selectedSubDistrict: string;
  onSelectSubDistrict: (subDistrict: string) => void;
  activeTransferCount: number;
}

export const SupplyRedistribution: React.FC<SupplyRedistributionProps> = ({
  drugs,
  directives,
  onOpenSignDispatch,
  onOpenTrackGps,
  onIssueDeputation,
  onRerunMilp,
  isSolving,
  selectedSubDistrict,
  onSelectSubDistrict,
  activeTransferCount
}) => {
  const [selectedCategory, setSelectedCategory] = useState<DrugCategory>('All');
  const [selectedUrgency, setSelectedUrgency] = useState<UrgencyTier>('All');
  const [selectedDrugId, setSelectedDrugId] = useState<string>(drugs[0]?.id || 'drug-1');
  const [showTrainModal, setShowTrainModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Custom trained parameters per drug
  const [trainedForecasts, setTrainedForecasts] = useState<Record<string, { metrics: TrainingMetrics; forecast: ForecastResult }>>({
    'drug-1': {
      metrics: {
        epochs: 25,
        initialLoss: 5.82,
        finalLoss: 0.38,
        mse: 0.38,
        mape: 4.8,
        rSquared: 0.94,
        trainedAt: new Date().toLocaleTimeString(),
        sampleCount: 90
      },
      forecast: {
        historical: [3.8, 4.1, 4.0, 4.2, 5.1, 7.8, 9.4],
        forecast: [9.6, 9.8, 10.2, 10.5, 11.0, 11.2, 11.4],
        upperConfidenceCone: [10.2, 10.8, 11.4, 12.0, 12.8, 13.2, 13.6],
        lowerConfidenceCone: [9.0, 8.8, 9.0, 9.0, 9.2, 9.2, 9.2],
        stockoutDay: 6.2,
        predicted7dDemand: 73.7,
        deficitInitiationHours: 14.5,
        redistributionPayoffDays: 8.5
      }
    }
  });

  const subDistricts = [
    'Karjat & Pen (Cluster 1)',
    'Alibag & Murud (Coastal)',
    'Roha & Mangaon (Mid-District)',
    'Panvel & Uran (Northern Gateway)',
    'Mahad & Poladpur (Southern Ghats)'
  ];

  // Filter drugs
  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      const matchesCategory = selectedCategory === 'All' || drug.category === selectedCategory;
      const matchesUrgency = 
        selectedUrgency === 'All' ||
        (selectedUrgency === 'P1 Emergency' && (drug.status === 'P1 DEFICIT' || drug.status === 'CRITICAL')) ||
        (selectedUrgency === 'P2 Scheduled' && (drug.status === 'BATCH ROUTED' || drug.status === 'MONITORING'));
      return matchesCategory && matchesUrgency;
    });
  }, [drugs, selectedCategory, selectedUrgency]);

  const selectedDrug = useMemo(() => {
    return drugs.find(d => d.id === selectedDrugId) || drugs[0];
  }, [drugs, selectedDrugId]);

  const activeTrainedData = trainedForecasts[selectedDrug?.id || 'drug-1'];

  const handleModelTrained = useCallback((result: { metrics: TrainingMetrics; forecast: ForecastResult }) => {
    if (!selectedDrug) return;
    setTrainedForecasts(prev => ({
      ...prev,
      [selectedDrug.id]: result
    }));
    setToastMessage(`Model successfully trained on 90-day mock dataset for ${selectedDrug.name}! R² = ${result.metrics.rSquared}, MAPE = ${result.metrics.mape}%`);
    setTimeout(() => setToastMessage(null), 6000);
  }, [selectedDrug]);

  const handleExportDirectives = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Code,Urgency,Donor,Recipient,Distance,ETA,Status",
        ...directives.map(d => `${d.code},${d.urgency},"${d.donorName}","${d.recipientName}",${d.distance},${d.eta},${d.status}`)
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `raigad_milp_directives_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage('Exported MILP directives CSV successfully');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-base" aria-hidden="true">check_circle</span>
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss toast alert" 
            className="text-emerald-700 hover:text-emerald-900 p-0.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
          </button>
        </div>
      )}

      {/* Breadcrumb & Action Banner */}
      <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
            <span>Operations</span>
            <span aria-hidden="true">/</span>
            <span className="text-sky-700">Stock Redistribution &amp; Supply Balancing</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            District Medicine Redistribution Engine (MILP Optimizer)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Transshipment algorithm minimizing road transit distance &amp; preventing stockouts across all PHCs/CHCs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowTrainModal(true)}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-emerald-600" aria-hidden="true">model_training</span>
            <span>Train on Mock Data</span>
          </button>

          <button
            type="button"
            onClick={onRerunMilp}
            disabled={isSolving}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-base ${isSolving ? 'animate-spin' : ''}`} aria-hidden="true">
              sync
            </span>
            <span>{isSolving ? 'Solving MILP Matrix...' : 'Run AI Auto-Balancing'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportDirectives}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* Model Calibration Status Callout */}
      <section className="bg-gradient-to-r from-emerald-50/70 via-sky-50/50 to-white border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl" aria-hidden="true">auto_graph</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                AI Forecasting Model Status: Calibrated on 90-Day Historical Mock Dataset
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Forecast models fitted on seasonal consumption, epidemiological bite alerts, and monsoon covariates.
              {activeTrainedData && selectedDrug && ` Target (${selectedDrug.name}): R² = ${activeTrainedData.metrics.rSquared}, MAPE = ${activeTrainedData.metrics.mape}%, Final Loss = ${activeTrainedData.metrics.finalLoss}.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowTrainModal(true)}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto cursor-pointer"
        >
          View / Re-train Parameters →
        </button>
      </section>

      {/* Macro Telemetry Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium">Monitored Formulary</span>
          <div className="text-2xl font-bold text-slate-900">{drugs.length * 17 + 6} Items</div>
          <span className="text-[11px] text-emerald-600 font-semibold block">WHO &amp; IDSP Compliant</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium">District Stock Sufficiency</span>
          <div className="text-2xl font-bold text-slate-900">91.4%</div>
          <span className="text-[11px] text-sky-600 font-semibold block">+1.8% vs last 24h</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium">Active Transfer Routes</span>
          <div className="text-2xl font-bold text-sky-700">{String(activeTransferCount).padStart(2, '0')} Corridors</div>
          <span className="text-[11px] text-slate-500 block">Avg ETA 46 mins</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 font-medium">Critical Deficit Centres</span>
          <div className="text-2xl font-bold text-rose-600">02 Nodes</div>
          <span className="text-[11px] text-rose-700 font-semibold block">Emergency re-routes active</span>
        </div>
      </section>

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drug Formulary & Selection (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Essential Drug Stock Triage</h2>
                <span className="text-[11px] text-slate-500">Select drug to view telemetry &amp; train models</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                {filteredDrugs.length} Items
              </span>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="All">All Categories</option>
                  <option value="Vaccines/EPI">Vaccines / EPI</option>
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Anti-Venom / ARV">Anti-Venom / ARV</option>
                  <option value="Maternal Care">Maternal Care</option>
                  <option value="IV Fluids">Emergency IV Fluids</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Urgency</label>
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="All">All Urgency Tiers</option>
                  <option value="P1 Emergency">P1 Emergency Deficit</option>
                  <option value="P2 Scheduled">P2 Scheduled Transfers</option>
                </select>
              </div>
            </div>

            {/* Drug Cards List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredDrugs.map((drug) => {
                const isSelected = drug.id === selectedDrugId;
                const isDeficit = drug.status === 'P1 DEFICIT' || drug.status === 'CRITICAL';
                const totalStock = Math.round(drug.ewmaBurnRate * drug.dsrRemaining);
                return (
                  <div
                    key={drug.id}
                    onClick={() => setSelectedDrugId(drug.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-200 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">{drug.name}</span>
                        <span className="text-[11px] text-slate-500">{drug.category} • {drug.form}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isDeficit
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {drug.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">District Stock</span>
                        <strong className="text-slate-800">{totalStock} Units</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Daily Burn</span>
                        <strong className="text-slate-800">{drug.ewmaBurnRate} {drug.burnUnit}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Days Remaining</span>
                        <strong className={isDeficit ? 'text-rose-600' : 'text-emerald-700'}>
                          {drug.dsrRemaining} Days
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Drug Breakdown Card */}
          {selectedDrug && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs">Facility Stock Distribution ({selectedDrug.name})</h3>
                <span className="text-[11px] text-slate-500 font-mono">Reorder: {selectedDrug.reorderBoundary} Units</span>
              </div>

              <div className="space-y-2">
                {selectedDrug.facilityBreakdown.map((fb, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="font-medium text-slate-800">{fb.facility}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{fb.stock}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          fb.status === 'deficit'
                            ? 'bg-rose-100 text-rose-800'
                            : fb.status === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {fb.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Directives & MILP Surplus-Deficit Matching (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 text-sm">
                    AI Transfer Directives (Surplus PHC → Deficit CHC)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px]">
                    MILP Balanced
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Algorithmic transfer corridors computed to prevent facility stock exhaustion.
                </p>
              </div>

              <select
                value={selectedSubDistrict}
                onChange={(e) => onSelectSubDistrict(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {subDistricts.map((sd) => (
                  <option key={sd} value={sd}>{sd}</option>
                ))}
              </select>
            </div>

            {/* Directive Cards List */}
            <div className="space-y-3.5">
              {directives.map((dir) => {
                const isDispatched = dir.status === 'dispatched' || dir.status === 'delivered';
                return (
                  <div
                    key={dir.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                          {dir.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            dir.urgency.includes('P1')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {dir.urgency}
                        </span>
                        <span className="text-xs text-slate-500">
                          ETA: <strong className="text-slate-800">{dir.eta}</strong> ({dir.distance})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            isDispatched
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {dir.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Donor and Recipient Lockup */}
                    <div className="flex items-center justify-between bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 text-xs">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                          Surplus Donor Facility
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5">{dir.donorName}</span>
                        <span className="text-[11px] text-slate-500">{dir.donorStockInfo}</span>
                      </div>

                      <div className="flex flex-col items-center px-3">
                        <span className="material-symbols-outlined text-slate-400 text-xl" aria-hidden="true">
                          local_shipping
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold mt-0.5">
                          {dir.highway}
                        </span>
                      </div>

                      <div className="flex flex-col text-right">
                        <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider">
                          Deficit Recipient Facility
                        </span>
                        <span className="font-bold text-slate-900 mt-0.5">{dir.recipientName}</span>
                        <span className="text-[11px] text-slate-500">{dir.recipientDeficitInfo}</span>
                      </div>
                    </div>

                    {/* Cargo manifest summary */}
                    <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                      <div>
                        <span className="font-semibold text-slate-700">Cargo: </span>
                        <span>{dir.manifest.map(m => `${m.quantity} ${m.name}`).join(', ')}</span>
                      </div>
                      <div className="text-slate-500 font-mono text-[10px]">
                        Driver: {dir.driverName || 'Depot Courier'}
                      </div>
                    </div>

                    {/* Interactive Actions for this Directive */}
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onOpenTrackGps(dir)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm text-sky-600" aria-hidden="true">sensors</span>
                        <span>Live GPS Telemetry</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenSignDispatch(dir)}
                        className={`text-xs font-semibold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer ${
                          isDispatched
                            ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                            : 'bg-sky-600 hover:bg-sky-700 text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm" aria-hidden="true">draw</span>
                        <span>{isDispatched ? 'Dispatched (Track)' : 'Approve & Sign Transfer'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Train Model Modal */}
      {selectedDrug && (
        <TrainModelModal
          isOpen={showTrainModal}
          onClose={() => setShowTrainModal(false)}
          drugId={selectedDrug.id}
          drugName={selectedDrug.name}
          currentStock={Math.round(selectedDrug.ewmaBurnRate * selectedDrug.dsrRemaining)}
          onModelTrained={handleModelTrained}
        />
      )}
    </div>
  );
};
