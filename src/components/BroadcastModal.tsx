import React, { useState, useEffect } from 'react';
import { sanitizeInput, logSecurityEvent } from '../utils/security';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastSent: (message: string, urgency: string) => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose, onBroadcastSent }) => {
  const [urgency, setUrgency] = useState<'p1' | 'p2' | 'p3'>('p1');
  const [channels, setChannels] = useState<{ sms: boolean; whatsapp: boolean; voice: boolean }>({
    sms: true,
    whatsapp: true,
    voice: false
  });
  const [targetZone, setTargetZone] = useState('Karjat & Pen Belt (Cluster 1)');
  const [message, setMessage] = useState(
    'URGENT ADVISORY: Canine Bite Outbreak detected in Karjat-Neral corridor. Emergency ARV replenishment route TR-904 dispatched under cold-box courier. Direct all acute Category III bite cases to PHC Neral / CHC Karjat.'
  );
  const [isSending, setIsSending] = useState(false);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async () => {
    setIsSending(true);
    const sanitizedMsg = sanitizeInput(message);
    await logSecurityEvent('EMERGENCY_BROADCAST', 'Dr. Rajesh Sharma (CMO)', `Broadcast to ${targetZone} [${urgency.toUpperCase()}]`);

    setTimeout(() => {
      setIsSending(false);
      onBroadcastSent(sanitizedMsg, urgency);
      onClose();
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="broadcast-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn"
    >
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col text-slate-900">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-2xs">
              <span className="material-symbols-outlined text-xl animate-pulse" aria-hidden="true">campaign</span>
            </div>
            <div>
              <h2 id="broadcast-modal-title" className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">
                District Emergency Broadcast Console
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Integrated NIC SMS Gateway, WhatsApp Health Alert &amp; Telephony
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close broadcast dialog"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Target Zone & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="target-zone-select" className="block text-slate-700 font-semibold mb-1 text-[11px]">
                Target Geographic Corridor
              </label>
              <select
                id="target-zone-select"
                value={targetZone}
                onChange={e => setTargetZone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option>Karjat &amp; Pen Belt (Cluster 1)</option>
                <option>Alibag Coastal PHC Corridor</option>
                <option>Mangaon &amp; Roha Sub-District</option>
                <option>Panvel Urban Outskirts (High Density)</option>
                <option>All 16 District Health Facilities</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">Urgency Classification</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUrgency('p1')}
                  className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    urgency === 'p1'
                      ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  P1 Critical
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('p2')}
                  className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    urgency === 'p2'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  P2 Warning
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('p3')}
                  className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    urgency === 'p3'
                      ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  P3 Routine
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5 text-[11px]">Authorized Dispatch Channels</label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.sms}
                  onChange={e => setChannels({ ...channels, sms: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="font-semibold text-slate-800">NIC SMS Gateway</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.whatsapp}
                  onChange={e => setChannels({ ...channels, whatsapp: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-800">WhatsApp Alert</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={channels.voice}
                  onChange={e => setChannels({ ...channels, voice: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="font-semibold text-slate-800">IVR Voice Blast</span>
              </label>
            </div>
          </div>

          {/* Message Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="broadcast-message-area" className="block text-slate-700 font-semibold text-[11px]">
                Broadcast Telemetry &amp; Clinical Advisory
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                {message.length}/280 characters
              </span>
            </div>
            <textarea
              id="broadcast-message-area"
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Recipient preview */}
          <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600 text-lg" aria-hidden="true">group</span>
              <div>
                <span className="text-slate-700 font-semibold block text-[11px]">Audience Scope</span>
                <span className="text-slate-500 text-[10px]">
                  All Medical Officers, Staff Nurses, and Taluka Health Officers in {targetZone}
                </span>
              </div>
            </div>
            <span className="text-sky-700 font-bold font-mono text-xs">48 Officers</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Emergency advisory logged with cryptographic audit stamp.
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
              onClick={handleSend}
              disabled={isSending || message.trim().length === 0}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin" aria-hidden="true">refresh</span>
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base" aria-hidden="true">send</span>
                  <span>Send Urgent Broadcast</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
