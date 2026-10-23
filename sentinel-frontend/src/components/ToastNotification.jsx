import React from 'react';
import { CheckCircle, Folder } from 'lucide-react';

export default function ToastNotification({
  isDarkMode,
  toast,
  onClose
}) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-lg border p-4 shadow-xl flex items-start gap-3 text-xs max-w-md ${
        isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-gray-200 text-slate-800'
      }`}
    >
      <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="font-semibold text-slate-900 dark:text-white">{toast.title}</div>
        <div className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          {toast.desc}
        </div>
        {toast.filename && (
          <div
            className={`mt-2 p-2 rounded text-[10px] border flex flex-col gap-1 ${
              isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-200 text-slate-700'
            }`}
          >
            <span className="font-semibold text-blue-600 flex items-center gap-1">
              <Folder className="w-3.5 h-3.5" /> File Path:
            </span>
            <span className="font-mono select-all break-all text-[9.5px]">
              {toast.fullPath || `Reports\\${toast.filename}`}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}
