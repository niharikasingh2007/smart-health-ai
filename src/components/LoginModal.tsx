import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types/healthGrid';
import { sanitizeInput, logSecurityEvent } from '../utils/security';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFillAdmin = () => {
    setEmail('admin@health.gov.in');
    setPassword('admin123');
    setErrorMessage(null);
  };

  const handleFillStaff = () => {
    setEmail('phc.user@health.gov.in');
    setPassword('user123');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const cleanEmail = sanitizeInput(email).trim().toLowerCase();
    const cleanPass = password.trim();

    await new Promise(r => setTimeout(r, 400));

    if (cleanEmail === 'admin@health.gov.in' && cleanPass === 'admin123') {
      const user: AuthUser = {
        email: 'admin@health.gov.in',
        name: 'Dr. Rajesh Sharma',
        role: 'admin',
        designation: 'District Medical Officer (DMO / Chief Administrator)',
        avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYw-U-9gIutuwwx6dN3943NPb9eknpf_ppU5CQFZ0oN6DI2mUEHfCcEF4Lqgr3Jr3E8Tz-Z7z4VjXnmHguu6e_ycHn_YILAWAn3-T2bpTFWNmiv4iieV94snc5g0gkifPZjZDC8i1MawJhxlLRZI-UH7zfEN3WCY4P0E6VjFkmD_BqQXQ9H4qZXZngwmK-pM9CkRePV2bxw7NY5JmykPvAA6IXHZuZWVYFj3Yz7jSutVcKtamw9CO8'
      };
      await logSecurityEvent('USER_LOGIN_SUCCESS', user.name, `Role: ADMIN, Email: ${user.email}`);
      setIsLoading(false);
      onLoginSuccess(user);
      onClose();
      return;
    }

    if (cleanEmail === 'phc.user@health.gov.in' && cleanPass === 'user123') {
      const user: AuthUser = {
        email: 'phc.user@health.gov.in',
        name: 'Sister Sunita Shinde',
        role: 'staff',
        designation: 'Senior Staff Nurse & Data In-Charge',
        facilityName: 'PHC Neral (Karjat Taluka)',
        avatarUrl: 'https://images.unsplash.com/photo-1594824813583-16a69ef4c344?w=150&auto=format&fit=crop&q=80'
      };
      await logSecurityEvent('USER_LOGIN_SUCCESS', user.name, `Role: STAFF, Facility: ${user.facilityName}`);
      setIsLoading(false);
      onLoginSuccess(user);
      onClose();
      return;
    }

    setIsLoading(false);
    setErrorMessage('Invalid credentials. Please verify your email and password or use the demo quick-fill buttons below.');
    await logSecurityEvent('USER_LOGIN_FAILED', cleanEmail || 'Unknown', 'Failed login attempt');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn"
    >
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700">
              <span className="material-symbols-outlined text-2xl" aria-hidden="true">lock</span>
            </div>
            <div>
              <h2 id="login-modal-title" className="font-bold text-slate-900 text-base leading-tight">
                Healthcare Portal Login
              </h2>
              <span className="text-xs text-slate-500">
                District Health Surveillance & Operations
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close login dialog"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Mock Demo Credentials Announcement Box */}
        <div className="p-6 pb-2">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs space-y-2.5">
            <div className="flex items-center justify-between text-sky-900 font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-sky-600" aria-hidden="true">vpn_key</span>
                Mock Demo Credentials for Testing
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-sky-200 text-sky-800 rounded font-bold">1-Click Test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="bg-white p-2.5 rounded-lg border border-sky-100 flex flex-col justify-between shadow-2xs">
                <div>
                  <span className="font-bold text-slate-800 text-[11px] block">Admin (DMO / Officer)</span>
                  <div className="text-[10px] text-slate-600 font-mono mt-0.5">admin@health.gov.in</div>
                  <div className="text-[10px] text-slate-600 font-mono">admin123</div>
                </div>
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="mt-2 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 py-1 px-2 rounded text-center transition-colors"
                >
                  Auto-Fill Admin &rarr;
                </button>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-sky-100 flex flex-col justify-between shadow-2xs">
                <div>
                  <span className="font-bold text-slate-800 text-[11px] block">PHC/CHC Staff Member</span>
                  <div className="text-[10px] text-slate-600 font-mono mt-0.5">phc.user@health.gov.in</div>
                  <div className="text-[10px] text-slate-600 font-mono">user123</div>
                </div>
                <button
                  type="button"
                  onClick={handleFillStaff}
                  className="mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-1 px-2 rounded text-center transition-colors"
                >
                  Auto-Fill Staff &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4 text-xs">
          {errorMessage && (
            <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-start gap-2">
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5 text-rose-600" aria-hidden="true">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="login-email" className="block text-slate-700 font-semibold mb-1">
              Government Official Email ID
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@health.gov.in"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-slate-700 font-semibold mb-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm text-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin" aria-hidden="true">refresh</span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base" aria-hidden="true">login</span>
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-xs text-slate-500">
          Protected NIC Health Gov Gateway • SSL 256-bit Encrypted
        </div>
      </div>
    </div>
  );
};
