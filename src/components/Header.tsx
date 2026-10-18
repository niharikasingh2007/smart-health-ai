import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../types/healthGrid';

interface HeaderProps {
  onOpenBroadcast: () => void;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBroadcast,
  selectedDistrict,
  onSelectDistrict,
  notifications,
  onMarkNotificationAsRead
}) => {
  const [currentTime, setCurrentTime] = useState('14:32:00 IST | 24-OCT-2024');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };
      const formatted = new Intl.DateTimeFormat('en-IN', options).format(now).toUpperCase();
      setCurrentTime(`${formatted.replace(',', '')} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const districts = [
    'Raigad HQ',
    'Karjat Sub-Division',
    'Alibag Coastal Belt',
    'Pen & Khopoli Cluster',
    'Mahad & Poladpur Ghat'
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050d25]/90 backdrop-blur-xl border-b border-[#3f4850]/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] h-16">
      <div className="h-full w-full px-6 flex items-center justify-between gap-4">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3 shrink-0">
          <img 
            alt="Smart Health Grid Logo" 
            className="h-8 w-auto object-contain" 
            src="https://lh3.googleusercontent.com/aida/AEtjO1Wc3sZwzaKeiKKexJi-RqSUhvKgbnJV6Z5c4OQHMSGEbnScRzUQmIUHsOSKqiGO83gq0Vvc5sOLRkOm46UN_3gxepfdisW0vErTSCgb30Q3lMP0pzzg4tYI0GF09cIaWzp0uCvOK8JowrVTbZE2Az4AvBysHkhpGSA3lhlZ6xd-OgeY6Fh1pqE0AQm4QDoqi8wPnzboF8OWwl-wO2zHRuNu1wXteAfqAPVQcM6K5_zk2iT7kC1UenIOaT4"
          />
          <div className="flex flex-col">
            <span className="font-['Inter'] text-base text-[#dbe1ff] tracking-tight uppercase leading-none font-bold">
              Smart Health Grid
            </span>
            <span className="font-mono text-[9px] text-[#7bd0ff] leading-tight mt-0.5 tracking-wider uppercase">
              District Surveillance & Command Console • Raigad Dist.
            </span>
          </div>
        </div>

        {/* Center Live Telemetry Pill */}
        <div className="hidden xl:flex items-center gap-3 bg-[#131a33] px-3 py-1 rounded border border-[#3f4850]/30 shrink-0">
          <div className="flex items-center gap-1.5" role="status" aria-live="polite">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4edea3] opacity-75" aria-hidden="true"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4edea3]"></span>
            </span>
            <span className="font-mono text-[9px] text-[#4edea3] font-semibold tracking-wider uppercase">
              100% Reporting (42 Edge Sync | 2 Lagging)
            </span>
          </div>
          <div className="h-3 w-px bg-[#3f4850]/40" aria-hidden="true"></div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-[#89929b]" aria-hidden="true">schedule</span>
            <span className="font-mono text-[9px] text-[#bfc7d2] font-medium" aria-label={`Current district time: ${currentTime}`}>
              {currentTime}
            </span>
          </div>
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Broadcast Alert Button */}
          <button 
            type="button"
            onClick={onOpenBroadcast}
            aria-label="Broadcast emergency district alert"
            className="flex items-center gap-1 bg-[#93000a]/40 border border-[#ffb4ab]/50 px-3 py-1.5 rounded hover:bg-[#93000a] hover:text-[#ffdad6] transition-all text-[#ffb4ab] focus-visible:ring-2 focus-visible:ring-[#ffb4ab] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base animate-pulse" aria-hidden="true">campaign</span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">
              Broadcast Alert
            </span>
          </button>

          {/* District Selector */}
          <div className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={showDistrictDropdown}
              aria-label={`Select district region, current: ${selectedDistrict}`}
              onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
              className="flex items-center bg-[#171e37] px-2.5 py-1 rounded border border-[#3f4850]/40 text-[#bfc7d2] hover:text-[#dbe1ff] transition-colors focus-visible:ring-2 focus-visible:ring-[#93ccff]"
            >
              <span className="font-mono text-[9px] uppercase text-[#89929b] mr-1.5">Dist:</span>
              <span className="text-xs text-[#dbe1ff] font-medium mr-1">{selectedDistrict}</span>
              <span className="material-symbols-outlined text-sm text-[#89929b]" aria-hidden="true">arrow_drop_down</span>
            </button>

            {showDistrictDropdown && (
              <div role="listbox" className="absolute right-0 mt-1 w-48 bg-[#050d25] border border-[#3f4850]/60 rounded shadow-xl py-1 z-50">
                {districts.map(d => (
                  <button
                    key={d}
                    type="button"
                    role="option"
                    aria-selected={selectedDistrict === d}
                    onClick={() => {
                      onSelectDistrict(d);
                      setShowDistrictDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                      selectedDistrict === d ? 'bg-[#212942] text-[#93ccff] font-semibold' : 'text-[#bfc7d2] hover:bg-[#171e37]'
                    }`}
                  >
                    <span>{d}</span>
                    {selectedDistrict === d && <span className="material-symbols-outlined text-xs" aria-hidden="true">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button 
              type="button"
              aria-haspopup="dialog"
              aria-expanded={showNotifications}
              aria-label={`Notifications, ${unreadCount} unread`}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center justify-center p-1.5 text-[#bfc7d2] hover:text-[#dbe1ff] cursor-pointer rounded hover:bg-[#171e37] transition-colors focus-visible:ring-2 focus-visible:ring-[#93ccff]"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden="true">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#ffb4ab] text-[#690005] font-mono text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-1 w-80 bg-[#050d25] border border-[#3f4850]/60 rounded shadow-2xl overflow-hidden z-50">
                <div className="bg-[#131a33] px-3 py-2 border-b border-[#3f4850]/40 flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">Tactical Incident Feeds</span>
                  <span className="font-mono text-[10px] text-[#7bd0ff]">{unreadCount} Unread</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#3f4850]/20">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => onMarkNotificationAsRead(n.id)}
                      className={`p-3 cursor-pointer transition-colors ${n.read ? 'bg-[#0a122a]/50 text-[#89929b]' : 'bg-[#171e37]/70 text-[#dbe1ff] hover:bg-[#212942]'}`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-semibold text-[11px] leading-snug">{n.title}</span>
                        <span className="font-mono text-[9px] text-[#89929b] shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-[#bfc7d2] line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-[#131a33] border-t border-[#3f4850]/40 text-center">
                  <span className="font-mono text-[10px] text-[#93ccff]">Real-Time Webhook • AES-256</span>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#3f4850]/30" aria-hidden="true"></div>

          {/* User Profile */}
          <button 
            type="button"
            aria-haspopup="dialog"
            aria-expanded={showProfileModal}
            aria-label="View user profile for Dr. Rajesh Sharma CMO"
            onClick={() => setShowProfileModal(!showProfileModal)}
            className="flex items-center gap-2 pl-1 cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#93ccff] rounded"
          >
            <img 
              alt="Profile avatar for Dr. Rajesh Sharma" 
              className="w-8 h-8 rounded-full object-cover border border-[#3f4850]/50 group-hover:border-[#93ccff] transition-all" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYw-U-9gIutuwwx6dN3943NPb9eknpf_ppU5CQFZ0oN6DI2mUEHfCcEF4Lqgr3Jr3E8Tz-Z7z4VjXnmHguu6e_ycHn_YILAWAn3-T2bpTFWNmiv4iieV94snc5g0gkifPZjZDC8i1MawJhxlLRZI-UH7zfEN3WCY4P0E6VjFkmD_BqQXQ9H4qZXZngwmK-pM9CkRePV2bxw7NY5JmykPvAA6IXHZuZWVYFj3Yz7jSutVcKtamw9CO8"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs text-[#dbe1ff] font-semibold leading-none group-hover:text-[#93ccff] transition-colors">
                Dr. Rajesh Sharma
              </span>
              <span className="font-mono text-[9px] text-[#7bd0ff] leading-tight mt-0.5">
                Chief Medical Officer, DMO
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Profile quick modal */}
      {showProfileModal && (
        <div className="absolute right-6 top-16 w-72 bg-[#050d25] border border-[#3f4850]/60 rounded shadow-2xl p-4 z-50 text-xs">
          <div className="flex items-center gap-3 pb-3 border-b border-[#3f4850]/30">
            <img 
              alt="Dr. Rajesh Sharma" 
              className="w-10 h-10 rounded-full border border-[#93ccff]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYw-U-9gIutuwwx6dN3943NPb9eknpf_ppU5CQFZ0oN6DI2mUEHfCcEF4Lqgr3Jr3E8Tz-Z7z4VjXnmHguu6e_ycHn_YILAWAn3-T2bpTFWNmiv4iieV94snc5g0gkifPZjZDC8i1MawJhxlLRZI-UH7zfEN3WCY4P0E6VjFkmD_BqQXQ9H4qZXZngwmK-pM9CkRePV2bxw7NY5JmykPvAA6IXHZuZWVYFj3Yz7jSutVcKtamw9CO8"
            />
            <div>
              <div className="font-semibold text-white">Dr. Rajesh Sharma</div>
              <div className="text-[10px] text-[#7bd0ff]">District Health Officer (DHO)</div>
              <div className="text-[9px] font-mono text-[#89929b]">MMC Reg #1998/08/3321</div>
            </div>
          </div>
          <div className="py-2.5 space-y-1.5 text-[11px] text-[#bfc7d2]">
            <div className="flex justify-between">
              <span className="text-[#89929b]">District:</span>
              <span className="text-white">Raigad, Maharashtra</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#89929b]">Jurisdiction:</span>
              <span className="text-white">15 Talukas / 64 PHCs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#89929b]">Security Clearance:</span>
              <span className="text-[#4edea3] font-mono">DMO Tier-1 (Full)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowProfileModal(false)}
            className="w-full mt-2 py-1 bg-[#171e37] hover:bg-[#212942] border border-[#3f4850]/40 rounded text-center text-[#dbe1ff] font-medium focus-visible:ring-2 focus-visible:ring-[#93ccff]"
          >
            Dismiss
          </button>
        </div>
      )}
    </header>
  );
};
