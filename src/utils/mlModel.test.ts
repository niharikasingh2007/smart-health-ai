import { describe, it, expect } from 'vitest';
import { generateMockHistoricalData, calculateEWMA, trainForecastModel } from './mlModel';

describe('Machine Learning & Forecast Engine', () => {
  it('generates 90 days of synthetic historical mock telemetry', () => {
    const data = generateMockHistoricalData('drug-1');
    expect(data.length).toBe(90);
    expect(data[0].day).toBe(1);
    expect(data[89].day).toBe(90);
    expect(data[85].outbreakCovariate).toBeGreaterThan(0); // Outbreak active in last 10 days
  });

  it('generates historical data for multiple essential drugs', () => {
    const drugs = ['drug-1', 'drug-2', 'drug-3', 'drug-4'];
    drugs.forEach(id => {
      const data = generateMockHistoricalData(id);
      expect(data.length).toBe(90);
      expect(data.every(d => d.consumption >= 0)).toBe(true);
      expect(data.every(d => d.stockLevel >= 0)).toBe(true);
    });
  });

  it('correctly calculates Exponentially Weighted Moving Average (EWMA)', () => {
    const series = [10, 20, 30, 40, 50];
    const alpha = 0.5;
    const smoothed = calculateEWMA(series, alpha);
    expect(smoothed.length).toBe(5);
    expect(smoothed[0]).toBe(10);
    // S_1 = 0.5 * 20 + 0.5 * 10 = 15
    expect(smoothed[1]).toBe(15);
    // S_2 = 0.5 * 30 + 0.5 * 15 = 22.5
    expect(smoothed[2]).toBe(22.5);
  });

  it('handles empty series for EWMA calculation gracefully', () => {
    const smoothed = calculateEWMA([], 0.3);
    expect(smoothed).toEqual([]);
  });

  it('trains forecasting model on mock dataset and converges with valid metrics', () => {
    const data = generateMockHistoricalData('drug-1');
    const result = trainForecastModel(data, 50);

    expect(result.parameters.alpha).toBeGreaterThanOrEqual(0.15);
    expect(result.parameters.alpha).toBeLessThanOrEqual(0.45);
    expect(result.metrics.epochs).toBeGreaterThan(0);
    expect(result.metrics.mse).toBeGreaterThan(0);
    expect(result.metrics.rSquared).toBeGreaterThan(0.7);

    // 7-day forecast array assertions
    expect(result.forecast.forecast.length).toBe(7);
    expect(result.forecast.upperConfidenceCone.length).toBe(7);
    expect(result.forecast.lowerConfidenceCone.length).toBe(7);

    // Upper cone must be greater than or equal to forecast
    for (let i = 0; i < 7; i++) {
      expect(result.forecast.upperConfidenceCone[i]).toBeGreaterThanOrEqual(result.forecast.forecast[i]);
      expect(result.forecast.lowerConfidenceCone[i]).toBeLessThanOrEqual(result.forecast.forecast[i]);
    }
  });

  it('reports epoch loss callback during training', () => {
    const data = generateMockHistoricalData('drug-2');
    const epochHistory: { epoch: number; loss: number }[] = [];
    
    const result = trainForecastModel(data, 200, (epoch, loss) => {
      epochHistory.push({ epoch, loss });
    });

    expect(epochHistory.length).toBeGreaterThan(0);
    expect(result.metrics.sampleCount).toBe(90);
    expect(result.forecast.predicted7dDemand).toBeGreaterThan(0);
  });
});
