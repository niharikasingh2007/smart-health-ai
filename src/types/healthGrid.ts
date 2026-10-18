export type TacticalDomain = 
  | 'public-landing'
  | 'facility-directory'
  | 'admin-dashboard'
  | 'user-data-entry'
  | 'supply-redistribution'
  | 'overview-triage'
  | 'facility-matrix'
  | 'cold-chain-equipment'
  | 'staff-roster-deputation';

export type UserRole = 'public' | 'admin' | 'staff';

export interface AuthUser {
  email: string;
  name: string;
  role: 'admin' | 'staff';
  designation: string;
  facilityName?: string;
  avatarUrl?: string;
}

export type DrugCategory = 
  | 'All' 
  | 'Antibiotics' 
  | 'Vaccines/EPI' 
  | 'Maternal Care' 
  | 'Anti-Venom / ARV' 
  | 'IV Fluids';

export type UrgencyTier = 'All' | 'P1 Emergency' | 'P2 Scheduled';

export interface EssentialDrug {
  id: string;
  name: string;
  form: string;
  category: DrugCategory;
  tempSpec?: string;
  note?: string;
  facilityBreakdown: {
    facility: string;
    stock: string;
    status: 'deficit' | 'warning' | 'surplus' | 'balanced' | 'safe';
  }[];
  ewmaBurnRate: number;
  burnUnit: string;
  dsrRemaining: number;
  stockoutRisk7d: number;
  status: 'P1 DEFICIT' | 'CRITICAL' | 'BATCH ROUTED' | 'MONITORING' | 'COLD-BOX REQ' | 'OPTIMAL';
  historicalCurve: number[];
  forecastCurve: number[];
  reorderBoundary: number;
  predictedDemand7d: string;
  deficitInitiation: string;
  redistributionPayoff: string;
}

export interface OptimizationDirective {
  id: string;
  code: string;
  urgency: 'P1 Emergency' | 'Scheduled Batch P2' | 'Staff Deputation';
  urgencyType: 'p1' | 'p2' | 'staff';
  eta: string;
  donorName: string;
  donorStockInfo: string;
  recipientName: string;
  recipientDeficitInfo: string;
  routeType: string;
  distance: string;
  highway: string;
  manifest: {
    name: string;
    quantity: string;
    icon?: string;
  }[];
  driverName?: string;
  driverPhone?: string;
  officerName?: string;
  officerReg?: string;
  status: 'pending_signature' | 'dispatched' | 'in_transit' | 'reallocated' | 'delivered';
  isSigned?: boolean;
}

export interface FacilityRecord {
  id: string;
  name: string;
  type: 'PHC' | 'CHC' | 'SDH' | 'DH';
  taluka: string;
  bedOccupancy: number;
  totalBeds: number;
  doctorsOnDuty: number;
  staffNurses: number;
  coldChainHealth: number;
  criticalStockouts: number;
  activeTriageQueue: number;
  status: 'normal' | 'elevated' | 'critical';
  lastSync: string;
  latitude: number;
  longitude: number;
  opdHours?: string;
  availableServices?: string[];
  contactNumber?: string;
}

export type Language = 'en' | 'hi' | 'mr';

export interface ColdChainUnit {
  id: string;
  facility: string;
  taluka: string;
  equipmentType: 'Ice-Lined Refrigerator (ILR)' | 'Deep Freezer (DF)' | 'Solar Direct Drive (SDD)';
  model: string;
  currentTemp: number;
  minTemp24h: number;
  maxTemp24h: number;
  powerSource: 'Grid + Solar Hybrid' | 'Grid (Auto Gen-Set)' | 'Solar Direct Drive';
  status: 'optimal' | 'warning' | 'breach';
  activeAntigens: string[];
  batteryPct?: number;
  lastPing: string;
}

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  specialty: string;
  registrationNumber: string;
  baseFacility: string;
  taluka: string;
  currentAssignment: string;
  deputationStatus: 'Base Post' | 'Deputed' | 'On-Call' | 'Relief Scheduled';
  contact: string;
  yearsExperience: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  category: 'supply' | 'cold-chain' | 'epidemic' | 'staff';
  urgency: 'critical' | 'warning' | 'info';
  read: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestions?: string[];
}
