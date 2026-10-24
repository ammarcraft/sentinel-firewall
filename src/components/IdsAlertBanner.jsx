import React from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

export default function IdsAlertBanner({
  isDarkMode,
  criticalAlert,
  onAutoBlock,
  onDismiss,
  onViewIds
}) {
  if (!criticalAlert) return null;

  return (
    <div
      className={`border-b px-6 py-3 transition-colors ${
        isDarkMode ? 'bg-red-950/60 border-red-900/80 text-red-100' : 'bg-red-50 border-red-200 text-red-900'
      }`}
    >
      <div className="max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-red-600 text-white">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wide">{criticalAlert.title}</div>
            <div className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
              Vector: {criticalAlert.vector} • Threshold: {criticalAlert.rate}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onViewIds && (
            <button
              onClick={onViewIds}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-md transition cursor-pointer border ${
                isDarkMode
                  ? 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                  : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              View in IDS Feed
            </button>
          )}
          <button
            onClick={() => onAutoBlock(criticalAlert.ip)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Auto-Block IP (Add DROP Rule)</span>
          </button>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
