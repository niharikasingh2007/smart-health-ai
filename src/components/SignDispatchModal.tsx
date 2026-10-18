import React, { useState, useEffect } from 'react';
import { OptimizationDirective } from '../types/healthGrid';
import { validateSecurePin, logSecurityEvent } from '../utils/security';

interface SignDispatchModalProps {
  directive: OptimizationDirective | null;
  isOpen: boolean;
  onClose: () => void;
  onAuthorized: (directiveId: string) => void;
}

export const SignDispatchModal: React.FC<SignDispatchModalProps> = ({
  directive,
  isOpen,
  onClose,
  onAuthorized
}) => {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    setPin('');
    setPinError(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !directive) return null;

  const handleAuthorize = async () => {
    if (attempts >= 3) {
      setPinError('Too many failed authorization attempts. System locked for 60 seconds.');
      return;
    }

    if (!validateSecurePin(pin)) {
      setPinError('Invalid PIN format. Enter 4 to 6 numeric digits (Demo PIN: 1234).');
      setAttempts(prev => prev + 1);
      return;
    }

    setIsSigning(true);
    setPinError(null);

    await logSecurityEvent(
      'DMO_SIGN_AND_DISPATCH',
      'Dr. Rajesh Sharma (CMO)',
      `Authorized transshipment directive ${directive.code} (${directive.donorName} -> ${directive.recipientName})`
    );

    setTimeout(() => {
      setIsSigning(false);
      onAuthorized(directive.id);
      onClose();
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sign-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn"
    >
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col text-slate-900">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-xl" aria-hidden="true">draw</span>
            </div>
            <div>
              <h2 id="sign-modal-title" className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">
                DMO Digital Dispatch Authorization: {directive.code}
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Cryptographic Transshipment Waybill Signing
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close digital authorization dialog"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">Routing Route</span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px]">
                {directive.urgency}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-900 font-semibold text-sm">
              <span>{directive.donorName}</span>
              <span className="material-symbols-outlined text-slate-400 text-base" aria-hidden="true">arrow_forward</span>
              <span className="text-sky-700">{directive.recipientName}</span>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-200/80 pt-2 flex items-center justify-between">
              <span>Distance: <strong>{directive.distance}</strong> ({directive.eta})</span>
              <span>Corridor: <strong>{directive.highway}</strong></span>
            </div>
          </div>

          {/* Manifest Table */}
          <div>
            <span className="text-slate-700 font-bold block mb-1.5 text-xs">Pharmaceutical Cargo Manifest</span>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                  <tr>
                    <th scope="col" className="p-2.5">Drug Description</th>
                    <th scope="col" className="p-2.5 text-right">Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {directive.manifest.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-medium text-slate-800">{item.name}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="auth-pin-input" className="block text-slate-700 font-semibold text-xs">
                Enter DMO Security Authorization PIN
              </label>
              <button
                type="button"
                onClick={() => setPin('1234')}
                className="text-sky-600 hover:text-sky-800 text-[11px] font-medium underline cursor-pointer"
              >
                Use Demo PIN (1234)
              </button>
            </div>
            <input
              id="auth-pin-input"
              type="password"
              maxLength={6}
              value={pin}
              onChange={e => {
                setPin(e.target.value);
                setPinError(null);
              }}
              placeholder="••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-center text-lg tracking-widest text-slate-900 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            {pinError && (
              <p role="alert" className="text-rose-600 text-[11px] font-semibold mt-1">
                {pinError}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Signs digital transit pass under GoM Health Protocol.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAuthorize}
              disabled={isSigning || pin.length < 4}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSigning ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin" aria-hidden="true">refresh</span>
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base" aria-hidden="true">check</span>
                  <span>Sign &amp; Dispatch Waybill</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
