import React, { useState, useCallback } from 'react';
import { TacticalDomain, OptimizationDirective, EssentialDrug, FacilityRecord, AuthUser } from './types/healthGrid';
import { 
  INITIAL_DRUGS, 
  INITIAL_DIRECTIVES, 
  DISTRICT_FACILITIES, 
  COLD_CHAIN_UNITS, 
  STAFF_ROSTER, 
  INITIAL_NOTIFICATIONS 
} from './data/mockData';
import { solveMilpTransshipment } from './utils/milpEngine';
import { logSecurityEvent } from './utils/security';
import { SlimHeader } from './components/SlimHeader';
import { PublicLanding } from './components/PublicLanding';
import { FacilityDirectoryView } from './components/FacilityDirectoryView';
import { UserDataEntryPortal } from './components/UserDataEntryPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { SupplyRedistribution } from './components/domains/SupplyRedistribution';
import { OverviewTriage } from './components/domains/OverviewTriage';
import { ColdChainEquipment } from './components/domains/ColdChainEquipment';
import { StaffRosterDeputation } from './components/domains/StaffRosterDeputation';
import { LoginModal } from './components/LoginModal';
import { ChatbotWidget } from './components/ChatbotWidget';
import { BroadcastModal } from './components/BroadcastModal';
import { SignDispatchModal } from './components/SignDispatchModal';
import { TrackGpsModal } from './components/TrackGpsModal';
import { TrainModelModal } from './components/TrainModelModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [currentDomain, setCurrentDomain] = useState<TacticalDomain>('public-landing');
  
  // Data State
  const [drugs, setDrugs] = useState<EssentialDrug[]>(INITIAL_DRUGS);
  const [directives, setDirectives] = useState<OptimizationDirective[]>(INITIAL_DIRECTIVES);
  const [facilities, setFacilities] = useState<FacilityRecord[]>(DISTRICT_FACILITIES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState('Karjat & Pen (Cluster 1)');
  const [language, setLanguage] = useState<string>('en');
  
  // Operational Counters
  const [activeTransferCount, setActiveTransferCount] = useState<number>(6);
  const [solverCycle, setSolverCycle] = useState<number>(419);
  const [convergenceTime, setConvergenceTime] = useState<string>('0.042s');
  const [isSolving, setIsSolving] = useState<boolean>(false);

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState<boolean>(false);
  const [isTrainModelOpen, setIsTrainModelOpen] = useState<boolean>(false);
  const [activeSigningDirective, setActiveSigningDirective] = useState<OptimizationDirective | null>(null);
  const [activeGpsDirective, setActiveGpsDirective] = useState<OptimizationDirective | null>(null);

  // Login handler
  const handleLoginSuccess = useCallback((user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentDomain('admin-dashboard');
    } else {
      setCurrentDomain('user-data-entry');
    }
  }, []);

  // Logout handler
  const handleLogout = useCallback(async () => {
    if (currentUser) {
      await logSecurityEvent('USER_LOGOUT', currentUser.name, `Logged out from role: ${currentUser.role}`);
    }
    setCurrentUser(null);
    setCurrentDomain('public-landing');
  }, [currentUser]);

  // MILP Solver Trigger
  const handleRerunMilp = useCallback(() => {
    setIsSolving(true);
    setTimeout(() => {
      const nextCycle = solverCycle + 1;
      const result = solveMilpTransshipment(nextCycle, directives);
      setDirectives(result.directives);
      setSolverCycle(result.solverCycle);
      setConvergenceTime(result.convergenceTime);
      setIsSolving(false);
      logSecurityEvent(
        'RERUN_MILP_SOLVER',
        currentUser?.name || 'Administrator',
        `Cycle #${result.solverCycle} converged in ${result.convergenceTime}`
      );
    }, 800);
  }, [solverCycle, directives, currentUser]);

  // Update Facility from Staff Portal
  const handleUpdateFacility = useCallback((updatedFacility: FacilityRecord) => {
    setFacilities(prev => prev.map(f => f.id === updatedFacility.id ? updatedFacility : f));
  }, []);

  // Update Drug Stock from Staff Portal
  const handleUpdateDrugStock = useCallback((drugId: string, facilityName: string, newStock: number) => {
    setDrugs(prev => prev.map(drug => {
      if (drug.id === drugId) {
        const updatedBreakdown = drug.facilityBreakdown.map(fb => {
          if (fb.facility.toLowerCase().includes(facilityName.toLowerCase().replace(/phc|chc|\(.*\)/gi, '').trim())) {
            return {
              ...fb,
              stock: `${newStock} Units`,
              status: newStock === 0 ? 'deficit' as const : newStock < drug.reorderBoundary ? 'warning' as const : 'safe' as const
            };
          }
          return fb;
        });

        // Recalculate DSR remaining
        const dsr = parseFloat((newStock / (drug.ewmaBurnRate || 1)).toFixed(1));
        const status = newStock === 0 ? 'P1 DEFICIT' : dsr < 2 ? 'CRITICAL' : 'OPTIMAL';

        return {
          ...drug,
          facilityBreakdown: updatedBreakdown,
          dsrRemaining: dsr,
          status: status as any
        };
      }
      return drug;
    }));
  }, []);

  // Sign & Dispatch Directive Action
  const handleAuthorizeDirective = useCallback((directiveId: string) => {
    setDirectives(prev => prev.map(dir => {
      if (dir.id === directiveId) {
        return {
          ...dir,
          status: 'dispatched',
          isSigned: true,
        };
      }
      return dir;
    }));
    setActiveTransferCount(prev => prev + 1);
  }, []);

  // Issue Deputation Order Action
  const handleIssueDeputation = useCallback((directiveId: string) => {
    setDirectives(prev => prev.map(dir => {
      if (dir.id === directiveId) {
        return {
          ...dir,
          status: 'reallocated',
        };
      }
      return dir;
    }));
  }, []);

  // Broadcast Alert Sent handler
  const handleBroadcastSent = useCallback((message: string, urgency: string) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: `Emergency District Broadcast [${urgency.toUpperCase()}]`,
      message: message,
      time: 'Just now',
      category: 'epidemic' as const,
      urgency: 'critical' as const,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Inter',sans-serif] flex flex-col">
      {/* Slim, Minimalist Header */}
      <SlimHeader
        currentDomain={currentDomain}
        onSelectDomain={setCurrentDomain}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 outline-none">
        {/* PUBLIC LANDING VIEW */}
        {currentDomain === 'public-landing' && (
          <PublicLanding
            facilities={facilities}
            drugs={drugs}
            onOpenLogin={() => setIsLoginOpen(true)}
            onSelectFacility={() => setCurrentDomain('facility-directory')}
          />
        )}

        {/* PUBLIC FACILITY DIRECTORY VIEW */}
        {currentDomain === 'facility-directory' && (
          <FacilityDirectoryView
            facilities={facilities}
          />
        )}

        {/* STAFF DATA ENTRY PORTAL */}
        {currentDomain === 'user-data-entry' && currentUser && (
          <UserDataEntryPortal
            currentUser={currentUser}
            facilities={facilities}
            drugs={drugs}
            onUpdateFacility={handleUpdateFacility}
            onUpdateDrugStock={handleUpdateDrugStock}
          />
        )}

        {/* ADMIN COMMAND DASHBOARD */}
        {currentDomain === 'admin-dashboard' && currentUser && (
          <AdminDashboard
            currentUser={currentUser}
            facilities={facilities}
            drugs={drugs}
            directives={directives}
            onOpenTrainModel={() => setIsTrainModelOpen(true)}
            onNavigateToSupply={() => setCurrentDomain('supply-redistribution')}
            onDispatchDirective={handleAuthorizeDirective}
            onIssueDeputation={handleIssueDeputation}
          />
        )}

        {/* SUPPLY & REDISTRIBUTION ENGINE */}
        {currentDomain === 'supply-redistribution' && (
          <SupplyRedistribution
            drugs={drugs}
            directives={directives}
            onOpenSignDispatch={(directive) => setActiveSigningDirective(directive)}
            onOpenTrackGps={(directive) => setActiveGpsDirective(directive)}
            onIssueDeputation={handleIssueDeputation}
            onRerunMilp={handleRerunMilp}
            isSolving={isSolving}
            selectedSubDistrict={selectedSubDistrict}
            onSelectSubDistrict={setSelectedSubDistrict}
            activeTransferCount={activeTransferCount}
          />
        )}

        {/* OVERVIEW & TRIAGE DOMAIN */}
        {currentDomain === 'overview-triage' && (
          <OverviewTriage
            facilities={facilities}
            onNavigateToSupply={() => setCurrentDomain('supply-redistribution')}
          />
        )}

        {/* COLD CHAIN & THERMAL TELEMETRY */}
        {currentDomain === 'cold-chain-equipment' && (
          <ColdChainEquipment
            units={COLD_CHAIN_UNITS}
          />
        )}

        {/* STAFF ROSTER & CLINICAL DEPUTATION */}
        {currentDomain === 'staff-roster-deputation' && (
          <StaffRosterDeputation
            staffList={STAFF_ROSTER}
          />
        )}
      </main>

      {/* Floating Interactive AI Assistant Chatbot */}
      <ChatbotWidget
        drugs={drugs}
        facilities={facilities}
        onNavigateDomain={(domain) => setCurrentDomain(domain)}
      />

      {/* Login Modal with Prominent Demo Credentials */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Emergency Broadcast Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onBroadcastSent={handleBroadcastSent}
      />

      {/* Train Forecast Model on Mock Data Modal */}
      <TrainModelModal
        isOpen={isTrainModelOpen}
        onClose={() => setIsTrainModelOpen(false)}
        drugId={drugs[0]?.id || 'drug-1'}
        drugName={drugs[0]?.name || 'Anti-Rabies Vaccine (ARV)'}
        currentStock={100}
        onModelTrained={(result) => {
          const newNotif = {
            id: `notif-${Date.now()}`,
            title: `AI Model Trained on Mock Data`,
            message: `Forecasting calibrated on 90-day telemetry. R² = ${result.metrics.rSquared}, MAPE = ${result.metrics.mape}%`,
            time: 'Just now',
            category: 'supply' as const,
            urgency: 'info' as const,
            read: false,
          };
          setNotifications(prev => [newNotif, ...prev]);
        }}
      />

      {/* Digital Signature & Dispatch Modal */}
      <SignDispatchModal
        directive={activeSigningDirective}
        isOpen={!!activeSigningDirective}
        onClose={() => setActiveSigningDirective(null)}
        onAuthorized={handleAuthorizeDirective}
      />

      {/* Live Vehicle Fleet GPS Telemetry Modal */}
      <TrackGpsModal
        directive={activeGpsDirective}
        isOpen={!!activeGpsDirective}
        onClose={() => setActiveGpsDirective(null)}
      />
    </div>
  );
}
