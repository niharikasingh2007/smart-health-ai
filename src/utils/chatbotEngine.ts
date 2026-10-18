import { EssentialDrug, FacilityRecord } from '../types/healthGrid';

export interface BotResponse {
  answer: string;
  recommendedAction?: {
    label: string;
    actionType: 'navigate_data_entry' | 'navigate_supply' | 'navigate_facilities';
  };
  relatedQuestions?: string[];
}

export function processHealthcareQuery(
  rawQuery: string,
  drugs: EssentialDrug[],
  facilities: FacilityRecord[]
): BotResponse {
  const q = rawQuery.toLowerCase().trim();

  // 1. Paracetamol availability
  if (q.includes('paracetamol')) {
    const pcm = drugs.find(d => d.name.toLowerCase().includes('paracetamol'));
    const surplusNode = pcm?.facilityBreakdown.find(f => f.status === 'surplus');
    const deficitNode = pcm?.facilityBreakdown.find(f => f.status === 'deficit');
    return {
      answer: `Paracetamol 500mg tablets are currently stocked at CHC Pen with a surplus buffer of ${surplusNode?.stock || '3,400 tabs'}. PHC Kashele is running low (${deficitNode?.stock || '120 tabs remaining'}). An emergency transfer of 1,000 tabs is already scheduled under batch TR-892.`,
      recommendedAction: {
        label: 'View Medicine Inventory',
        actionType: 'navigate_supply'
      },
      relatedQuestions: [
        'Which PHC has available paracetamol?',
        'Where is ARV anti-rabies vaccine available?',
        'How do I update bed counts?'
      ]
    };
  }

  // 2. Anti-Rabies Vaccine (ARV) availability
  if (q.includes('rabies') || q.includes('arv') || q.includes('dog bite')) {
    const arv = drugs.find(d => d.name.toLowerCase().includes('anti-rabies'));
    const depot = arv?.facilityBreakdown.find(f => f.facility.includes('Depot') || f.status === 'safe');
    return {
      answer: `Anti-Rabies Vaccine (ARV) 0.5ml vials are stocked at District Central Depot Alibag (${depot?.stock || '420 Vials in cold chain'}). Due to the canine bite cluster in Karjat/Neral, an immediate emergency bike dispatch of 20 Vials (Directive TR-904) has been routed to PHC Neral.`,
      recommendedAction: {
        label: 'Track Vaccine Courier',
        actionType: 'navigate_supply'
      },
      relatedQuestions: [
        'Which hospital has vacant emergency beds?',
        'Where is blood pressure test available?'
      ]
    };
  }

  // 3. How to update bed counts
  if (q.includes('update bed') || q.includes('change bed') || q.includes('how do i update')) {
    return {
      answer: `To update bed availability:
1. Log in with your PHC/CHC Staff credentials (phc.user@health.gov.in).
2. Go to the "Staff Data Entry Portal" tab in the top navigation.
3. Select your facility and use the (+) and (-) stepper buttons to adjust available General, Maternity, or Emergency beds.
4. Click "Save & Sync Facility Report" to update the district dashboard instantly.`,
      recommendedAction: {
        label: 'Open Staff Data Entry Portal',
        actionType: 'navigate_data_entry'
      },
      relatedQuestions: [
        'Which hospital has vacant emergency beds?',
        'Which PHC has available paracetamol?'
      ]
    };
  }

  // 4. Blood pressure or diagnostic tests
  if (q.includes('blood pressure') || q.includes('bp') || q.includes('test') || q.includes('diagnostic')) {
    return {
      answer: `Free Blood Pressure (BP) check-ups, Blood Sugar (RBS), Hemoglobin testing, and primary lab diagnostics are available at all 16 Primary Health Centres (PHCs) and Community Health Centres (CHCs) in Raigad District, including PHC Neral, PHC Kashele, CHC Karjat, and CHC Pen. OPD hours are Monday through Saturday, 8:00 AM – 2:00 PM and 4:00 PM – 6:00 PM.`,
      recommendedAction: {
        label: 'Explore Facility Directory',
        actionType: 'navigate_facilities'
      },
      relatedQuestions: [
        'Which hospital has vacant emergency beds?',
        'Where is ARV anti-rabies vaccine available?'
      ]
    };
  }

  // 5. Vacant / available beds
  if (q.includes('vacant bed') || q.includes('bed') || q.includes('emergency bed') || q.includes('icu')) {
    const vacantFacilities = facilities
      .filter(f => f.bedOccupancy < 75)
      .map(f => `${f.name} (${f.totalBeds - Math.round(f.bedOccupancy * f.totalBeds / 100)} vacant beds, ${f.bedOccupancy}% occupied)`)
      .slice(0, 3);

    return {
      answer: `The facilities with the highest vacant bed availability right now are:
• ${vacantFacilities.join('\n• ')}
District Central Hospital Alibag currently maintains 60 vacant inpatient beds and 12 emergency ICU beds ready for triage.`,
      recommendedAction: {
        label: 'Check Facility Bed Status',
        actionType: 'navigate_facilities'
      },
      relatedQuestions: [
        'How do I update bed counts?',
        'Which PHC has available paracetamol?'
      ]
    };
  }

  // 6. Amoxicillin or antibiotics
  if (q.includes('amoxicillin') || q.includes('antibiotic')) {
    return {
      answer: `Amoxicillin 500mg capsules are stocked with healthy supply at CHC Alibag (2,100 caps). 500 capsules are currently being batch-transferred to PHC Kashele via route TR-892 to replenish their 1.4-day buffer.`,
      relatedQuestions: [
        'Which PHC has available paracetamol?',
        'Where is ARV anti-rabies vaccine available?'
      ]
    };
  }

  // 7. Generic fallback
  return {
    answer: `I can help you check medicine inventory, find bed availability, locate diagnostic tests, or explain how to submit daily staff reports. Try asking:
• "Which PHC has available paracetamol?"
• "Where is blood pressure test available?"
• "How do I update bed counts?"
• "Which hospital has vacant emergency beds?"`,
    relatedQuestions: [
      'Which PHC has available paracetamol?',
      'Where is blood pressure test available?',
      'How do I update bed counts?'
    ]
  };
}
