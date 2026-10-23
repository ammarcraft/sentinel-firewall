import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  X, 
  Flame, 
  Clock
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

export default function IdsAlertToast({ 
  alert, 
  onDismiss, 
  onAutoMitigate 
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!alert) return;
    soundEffects.playAlertSiren();

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [alert]);

  if (!alert) return null;

  const alertTime = alert.timestamp ? new Date(alert.timestamp).getTime() : now;
  const secondsAgo = Math.max(0, Math.floor((now - alertTime) / 1000));

  return (
    <div className="fixed top-20 right-4 lg:right-8 z-50 max-w-lg w-full animate-bounce-short">
      {/* Red Alert Notification Toast */}
      <div className="bg-[#13070b]/95 border-2 border-rose-500 rounded-xl p-4 shadow-neon-red backdrop-blur-xl relative overflow-hidden">
        
        {/* Animated Warning Stripe along top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-amber-400 to-rose-600 animate-pulse" />

        {/* Ambient alert background glow */}
        <div className="absolute -right-12 -top-12 w-36 h-36 bg-rose-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3">
          {/* Pulsing Alert Icon */}
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(239,68,68,0.5)] shrink-0 animate-pulse">
            <Flame className="w-6 h-6 text-rose-400" />
          </div>

          <div className="flex-1">
            {/* Severity Tag & Timestamp */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-600/80 tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                CRITICAL ALERT // CVSS 9.8
              </span>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {secondsAgo}s ago
              </span>
            </div>

            {/* Required Notification Title */}
            <h3 className="text-sm font-bold text-white font-mono leading-snug tracking-tight">
              Critical Alert: Potential Port Scan / DDoS Detected from IP {alert.ip || '192.168.1.105'}
            </h3>

            {/* Forensics / Telemetry Snippet */}
            <div className="mt-2.5 p-2 rounded-lg bg-black/60 border border-rose-950/80 text-[11px] font-mono space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">VECTOR:</span>
                <span className="text-rose-400 font-semibold">SYN Flood & Multi-Port Scan (21-8080)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SIGNATURE:</span>
                <span className="text-slate-200">ET-SCAN-NMAP-SYN-BURST-v2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">DETECTION:</span>
                <span className="text-amber-400 font-medium">&gt; 1,840 probes/sec threshold breach</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <button
                onClick={() => onAutoMitigate(alert.ip || '192.168.1.105')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-neon-red transition cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Auto-Drop IP (Enact Rule)</span>
              </button>

              <button
                onClick={onDismiss}
                className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-mono text-xs rounded-lg border border-slate-700 transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-rose-950/50 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
