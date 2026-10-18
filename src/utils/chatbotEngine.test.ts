import { describe, it, expect } from 'vitest';
import { processHealthcareQuery } from './chatbotEngine';
import { INITIAL_DRUGS, DISTRICT_FACILITIES } from '../data/mockData';

describe('Healthcare AI Assistant Chatbot Engine', () => {
  it('correctly answers queries regarding Paracetamol availability', () => {
    const res = processHealthcareQuery('Which PHC has available paracetamol?', INITIAL_DRUGS, DISTRICT_FACILITIES);
    expect(res.answer.toLowerCase()).toContain('paracetamol');
    expect(res.answer).toContain('CHC Pen');
  });

  it('correctly answers queries regarding ARV rabies vaccine availability', () => {
    const res = processHealthcareQuery('Where is ARV anti-rabies vaccine available?', INITIAL_DRUGS, DISTRICT_FACILITIES);
    expect(res.answer.toLowerCase()).toContain('rabies');
    expect(res.answer).toContain('Alibag');
  });

  it('provides step-by-step instructions for updating bed counts', () => {
    const res = processHealthcareQuery('How do I update bed counts?', INITIAL_DRUGS, DISTRICT_FACILITIES);
    expect(res.answer).toContain('Staff Data Entry Portal');
    expect(res.answer).toContain('phc.user@health.gov.in');
  });

  it('provides locations for blood pressure and diagnostic tests', () => {
    const res = processHealthcareQuery('Where is blood pressure test available?', INITIAL_DRUGS, DISTRICT_FACILITIES);
    expect(res.answer).toContain('Blood Pressure');
    expect(res.answer).toContain('PHC');
  });
});
