import React, { useState } from 'react';
import { TacticalDomain, AuthUser } from '../types/healthGrid';

interface SlimHeaderProps {
  currentDomain: TacticalDomain;
  onSelectDomain: (domain: TacticalDomain) => void;
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
}

export const SlimHeader: React.FC<SlimHeaderProps> = ({
  currentDomain,
  onSelectDomain,
  currentUser,
  onOpenLogin,
  onLogout,
  language = 'en',
  onLanguageChange
}) => {
  const [currentLang, setCurrentLang] = useState(language);

  const handleLang = (lang: string) => {
    setCurrentLang(lang);
    if (onLanguageChange) onLanguageChange(lang);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs h-12 w-full">
      <div className="h-full max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Brand Lockup */}
        <div 
          onClick={() => onSelectDomain('public-landing')}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">local_hospital</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight leading-none">
              AegisHealth
            </span>
            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100 hidden md:inline-block">
              PHC / CHC
            </span>
          </div>
        </div>

        {/* Center / Navigation Tabs */}
        <nav aria-label="Main Navigation" className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => onSelectDomain('public-landing')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              currentDomain === 'public-landing'
                ? 'bg-slate-100 text-sky-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {currentLang === 'hi' ? 'सार्वजनिक दृश्य' : currentLang === 'mr' ? 'सार्वजनिक विहंगावलोकन' : 'Public Overview'}
          </button>

          <button
            type="button"
            onClick={() => onSelectDomain('facility-directory')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              currentDomain === 'facility-directory'
                ? 'bg-slate-100 text-sky-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {currentLang === 'hi' ? 'अस्पताल निर्देशिका' : currentLang === 'mr' ? 'आरोग्य केंद्र सूची' : 'Facility Directory'}
          </button>

          {/* Admin Role-Restricted Tabs */}
          {currentUser?.role === 'admin' && (
            <>
              <button
                type="button"
                onClick={() => onSelectDomain('admin-dashboard')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                  currentDomain === 'admin-dashboard'
                    ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-sm text-sky-600" aria-hidden="true">dashboard</span>
                <span>{currentLang === 'hi' ? 'प्रशासन' : currentLang === 'mr' ? 'प्रशासन डॅशबोर्ड' : 'Admin Command'}</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectDomain('supply-redistribution')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                  currentDomain === 'supply-redistribution'
                    ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-sm text-sky-600" aria-hidden="true">swap_horiz</span>
                <span>{currentLang === 'hi' ? 'दवा पुनर्वितरण' : currentLang === 'mr' ? 'औषध पुनर्वितरण' : 'Stock Redistribution'}</span>
              </button>
            </>
          )}

          {/* Staff Role-Restricted Tab */}
          {currentUser?.role === 'staff' && (
            <button
              type="button"
              onClick={() => onSelectDomain('user-data-entry')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${
                currentDomain === 'user-data-entry'
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-sm text-emerald-600" aria-hidden="true">edit_calendar</span>
              <span>{currentLang === 'hi' ? 'दैनिक डेटा प्रविष्टि' : currentLang === 'mr' ? 'कर्मचारी दैनंदिन नोंद' : 'Staff Daily Entry'}</span>
            </button>
          )}
        </nav>

        {/* Right Section: Language Selector + Auth Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[10px] font-bold text-slate-600">
            <button
              type="button"
              onClick={() => handleLang('en')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${currentLang === 'en' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
              title="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleLang('hi')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${currentLang === 'hi' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
              title="हिंदी"
            >
              हिं
            </button>
            <button
              type="button"
              onClick={() => handleLang('mr')}
              className={`px-1.5 py-0.5 rounded cursor-pointer ${currentLang === 'mr' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'}`}
              title="मराठी"
            >
              मरा
            </button>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 pl-1">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-slate-300"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">
                    {currentUser.name[0]}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 hidden md:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1 px-2.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">logout</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold py-1 px-3 rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">login</span>
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
