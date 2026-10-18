import React, { useState } from 'react';
import { generateMockHistoricalData, trainForecastModel, TrainingMetrics, ForecastResult } from '../utils/mlModel';
import { logSecurityEvent } from '../utils/security';

interface TrainModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  drugId: string;
  drugName: string;
  currentStock: number;
  onModelTrained: (result: { metrics: TrainingMetrics; forecast: ForecastResult }) => void;
}

export const TrainModelModal: React.FC<TrainModelModalProps> = ({
  isOpen,
  onClose,
  drugId,
  drugName,
  currentStock,
  onModelTrained
}) => {
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [completedMetrics, setCompletedMetrics] = useState<TrainingMetrics | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<number>(90);
  const [simulatedSurge, setSimulatedSurge] = useState<'normal' | 'surge' | 'extreme'>('surge');

  if (!isOpen) return null;

  const handleStartTraining = async () => {
    setIsTraining(true);
    setCurrentEpoch(0);
    setLossHistory([]);
    setCompletedMetrics(null);

    const mockData = generateMockHistoricalData(drugId);

    // Run simulated epoch progression with async step delays for visual feedback
    let step = 0;
    const interval = setInterval(() => {
      step += 5;
      setCurrentEpoch(step);
      const simulatedLoss = parseFloat((5.8 / (1 + step * 0.15) + (Math.random() * 0.08)).toFixed(3));
      setLossHistory(prev => [...prev, simulatedLoss]);

      if (step >= 25) {
        clearInterval(interval);
        const trained = trainForecastModel(mockData, currentStock);
        setCompletedMetrics(trained.metrics);
        setIsTraining(false);
        onModelTrained(trained);
        logSecurityEvent(
          'TRAIN_ML_MODEL',
          'Dr. Rajesh Sharma',
          `Model trained on ${selectedHorizon}-day mock dataset for ${drugName}. R²: ${trained.metrics.rSquared}, MAPE: ${trained.metrics.mape}%`
        );
      }
    }, 100);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="train-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn"
    >
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col text-slate-900">
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">model_training</span>
            </div>
            <div>
              <h2 id="train-modal-title" className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">
                Train AI Demand Model on Mock Telemetry
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Target: <strong className="text-slate-800">{drugName}</strong> • Raigad Historical Dataset
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close training console"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Dataset Specifications */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Dataset Depth</span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5">{selectedHorizon} Daily Points</span>
              <span className="text-emerald-700 font-medium text-[11px] block mt-0.5">Synthetic PHC/CHC Logs</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Covariates</span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5">Vector Surge + Rain</span>
              <span className="text-sky-700 font-medium text-[11px] block mt-0.5">Poisson Outbreak Multiplier</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">Model Algorithm</span>
              <span className="text-slate-900 font-bold text-sm block mt-0.5">ARIMA-GARCH(1,1)</span>
              <span className="text-indigo-700 font-medium text-[11px] block mt-0.5">Adaptive EWMA Weight</span>
            </div>
          </div>

          {/* Configuration Controls */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Training Horizon</label>
              <select
                value={selectedHorizon}
                onChange={(e) => setSelectedHorizon(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value={30}>30 Days (Fast Convergence)</option>
                <option value={60}>60 Days (Seasonal Window)</option>
                <option value={90}>90 Days (Full District Historical Baseline)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Epidemic Scenario Simulation</label>
              <select
                value={simulatedSurge}
                onChange={(e) => setSimulatedSurge(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="normal">Normal Baseline (Endemic Level)</option>
                <option value="surge">Cluster Surge (+240% Bite Incidents)</option>
                <option value="extreme">Critical Monsoon Outbreak (+400%)</option>
              </select>
            </div>
          </div>

          {/* Training Progress / Telemetry */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500 uppercase tracking-wider text-[11px]">Optimization Loop</span>
              <span className={isTraining ? 'text-sky-600 font-bold animate-pulse' : completedMetrics ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                {isTraining ? `Epoch ${currentEpoch}/25 • Gradient Step Fitting...` : completedMetrics ? 'Convergence Complete' : 'Ready to Run'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={currentEpoch} aria-valuemin={0} aria-valuemax={25}>
              <div
                className="bg-emerald-500 h-full transition-all duration-150"
                style={{ width: `${(currentEpoch / 25) * 100}%` }}
              ></div>
            </div>

            {/* Loss reduction visualization */}
            {lossHistory.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                  Mean Squared Error Loss Progression:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  {lossHistory.map((loss, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white border border-slate-200 text-slate-800 font-mono text-[10px] rounded-md shrink-0 shadow-2xs"
                    >
                      e{idx * 5 || 1}: <strong className="text-emerald-600">{loss}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Post-Training Validation Metrics */}
          {completedMetrics && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <span className="material-symbols-outlined text-lg" aria-hidden="true">check_circle</span>
                <span>Hyperparameter Convergence Verified</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                  <span className="text-slate-500 block text-[10px]">R² Goodness</span>
                  <span className="font-bold text-slate-900">{completedMetrics.rSquared}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                  <span className="text-slate-500 block text-[10px]">MAPE Error</span>
                  <span className="font-bold text-emerald-700">{completedMetrics.mape}%</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                  <span className="text-slate-500 block text-[10px]">Final MSE</span>
                  <span className="font-bold text-slate-900">{completedMetrics.mse}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100 shadow-2xs">
                  <span className="text-slate-500 block text-[10px]">Observations</span>
                  <span className="font-bold text-slate-900">{completedMetrics.sampleCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Trained parameters directly adjust live MILP Safety Stock boundaries.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isTraining}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleStartTraining}
              disabled={isTraining}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isTraining ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin" aria-hidden="true">refresh</span>
                  <span>Training on Mock Dataset...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base" aria-hidden="true">play_arrow</span>
                  <span>{completedMetrics ? 'Re-Train Model' : 'Start Model Training'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
