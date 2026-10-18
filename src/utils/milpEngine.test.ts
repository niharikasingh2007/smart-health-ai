import { describe, it, expect } from 'vitest';
import { solveMilpTransshipment } from './milpEngine';
import { INITIAL_DIRECTIVES } from '../data/mockData';

describe('MILP Transshipment Optimization Engine', () => {
  it('converges within 100ms budget', () => {
    const result = solveMilpTransshipment(419, INITIAL_DIRECTIVES);
    expect(result.solverCycle).toBe(419);
    expect(parseFloat(result.convergenceTime)).toBeLessThan(0.1);
    expect(result.iterations).toBeGreaterThan(0);
    expect(result.directives.length).toBe(INITIAL_DIRECTIVES.length);
  });

  it('calculates aggregate efficiency gain and distance', () => {
    const result = solveMilpTransshipment(420, INITIAL_DIRECTIVES);
    expect(result.totalDistanceKm).toBeGreaterThan(0);
    expect(result.efficiencyGainPct).toBeGreaterThan(0);
    expect(result.totalTransferredUnits).toBeGreaterThan(0);
  });
});
