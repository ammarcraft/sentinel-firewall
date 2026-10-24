import React from 'react';
import {
  Shield,
  Activity,
  SlidersHorizontal,
  LogOut,
  Cpu,
  Wifi
} from 'lucide-react';

export default function Sidebar({
  isDarkMode,
  activeView,
  setActiveView,
  isAttackActive,
  totalPkts,
  rulesCount,
  onLogout,
  currentUser = 'Administrator'
}) {
  return (
    <aside
      className={`w-64 border-r flex flex-col shrink-0 transition-colors z-20 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-gray-200 text-slate-800'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 px-5 border-b flex items-center gap-3 ${
          isDarkMode ? 'border-slate-800' : 'border-gray-200'
        }`}
      >
        <div
          className={`p-1.5 rounded-lg border ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}
        >
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight block">Sentinel Firewall</span>
          <span
            className={`text-[11px] flex items-center gap-1.5 font-medium ${
              isAttackActive ? 'text-red-600' : 'text-slate-500'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAttackActive ? 'bg-red-600 animate-pulse' : 'bg-green-600'
              }`}
            />
            {isAttackActive ? 'Attack Active' : 'Status: Normal'}
          </span>
        </div>
      </div>

      {/* Sidebar Nav Items */}
      <div className="p-3 space-y-1.5 flex-1">
        <div className="text-[10px] font-semibold uppercase text-slate-400 px-3 py-1 tracking-wider">
          Views
        </div>

        {/* View 1: Live Monitor */}
        <button
          onClick={() => setActiveView('monitor')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
            activeView === 'monitor'
              ? isDarkMode
                ? 'bg-slate-800 text-blue-400 border-slate-700'
                : 'bg-blue-50 text-blue-700 border-blue-200'
              : isDarkMode
                ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4" />
            <span>Live Monitor</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-gray-100 text-slate-600'
            }`}
          >
            {totalPkts} pkts
          </span>
        </button>

        {/* View 2: Policy & Rules */}
        <button
          onClick={() => setActiveView('rules')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
            activeView === 'rules'
              ? isDarkMode
                ? 'bg-slate-800 text-blue-400 border-slate-700'
                : 'bg-blue-50 text-blue-700 border-blue-200'
              : isDarkMode
                ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Policy & Rules</span>
          </div>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-gray-100 text-slate-600'
            }`}
          >
            {rulesCount} rules
          </span>
        </button>

        {/* System Summary Widget in Sidebar */}
        <div className="pt-6">
          <div className="text-[10px] font-semibold uppercase text-slate-400 px-3 py-1 tracking-wider mb-2">
            Engine Health
          </div>
          <div
            className={`p-3 rounded-lg border text-xs space-y-2.5 ${
              isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" /> CPU Load
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                {isAttackActive ? '48.2%' : '14.1%'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-green-600" /> Memory
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                2.1 GB / 16 GB
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Kernel Driver</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                Netfilter v1.8
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / User Profile & Logout */}
      <div
        className={`p-3 border-t flex items-center justify-between ${
          isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-gray-200 bg-gray-50/50'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            {currentUser ? currentUser.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold block truncate">{currentUser || 'Administrator'}</span>
            <span className="text-[10px] text-slate-400 block">SecOps Console</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className={`p-1.5 rounded transition cursor-pointer ${
            isDarkMode
              ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800'
              : 'text-slate-500 hover:text-red-600 hover:bg-gray-100'
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
