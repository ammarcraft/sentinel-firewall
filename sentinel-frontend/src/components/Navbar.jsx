import React from 'react';
import {
  Menu,
  Activity,
  Flame,
  Bot,
  Sun,
  Moon,
  Zap,
  Radio,
  Globe
} from 'lucide-react';

export default function Navbar({
  isDarkMode,
  setIsDarkMode,
  activeView,
  onToggleSidebar,
  trafficMode = 'live',
  setTrafficMode,
  snifferStatus,
  isAttackActive = false,
  onToggleAttack,
  onOpenAttackConsole,
  onOpenAiAnalyst
}) {
  return (
    <header
      className={`h-16 border-b px-6 flex items-center justify-between shrink-0 transition-colors z-20 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
      }`}
    >
      {/* Left Section: Optional Sidebar Toggle & View Title */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                : 'bg-gray-100 hover:bg-gray-200 text-slate-700 border-gray-300'
            }`}
            title="Toggle Sidebar Layout"
          >
            <Menu className="w-4 h-4" />
            <span className="text-xs font-semibold">Menu</span>
          </button>
        )}

        {/* Current View Breadcrumb / Title */}
        <div>
          <h2 className="text-sm font-bold tracking-tight">
            {activeView === 'monitor'
              ? 'Live Monitor & Threat Telemetry'
              : activeView === 'rules'
                ? 'Firewall Policy & Filtering Rules Engine'
                : activeView === 'geo'
                  ? 'IP Geolocation & Threat Trajectory Radar'
                  : 'Intrusion Detection System (IDS) & Threat Feed'}
          </h2>
          <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {activeView === 'monitor'
              ? 'Real-world network packet inspection & wire telemetry'
              : activeView === 'rules'
                ? 'Deterministic packet filtering applied to Netfilter / iptables'
                : activeView === 'geo'
                  ? 'Real-time ingress geolocation mapping & cross-border threat tracking'
                  : 'Heuristic anomaly detection & automated MITRE threat mitigation'}
          </p>
        </div>
      </div>

      {/* Right Section: Mode Switcher, Attack Console, AI Copilot & Theme */}
      <div className="flex items-center gap-2.5">
        {/* Mode Toggle: Simulation vs Live Network */}
        {setTrafficMode && (
          <div
            className={`flex items-center p-0.5 rounded-lg border transition ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-gray-300'
            }`}
          >
            <button
              onClick={() => setTrafficMode('live')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                trafficMode === 'live'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Live Network Mode: Captures actual host OS socket packets"
            >
              <Radio className={`w-3.5 h-3.5 ${trafficMode === 'live' ? 'animate-pulse' : ''}`} />
              <span className="hidden md:inline">Live Network</span>
              <span className="md:hidden">Live</span>
            </button>

            <button
              onClick={() => setTrafficMode('simulation')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                trafficMode === 'simulation'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Simulation Mode: Run test vectors for presentations"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Simulation</span>
              <span className="md:hidden">Sim</span>
            </button>
          </div>
        )}

        {/* Live Attack Simulation Console Trigger */}
        <button
          onClick={onOpenAttackConsole || onToggleAttack}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
            isAttackActive
              ? 'bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-sm animate-pulse'
              : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/80'
          }`}
          title="Open Attack Simulation Console"
        >
          <Flame className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isAttackActive ? 'Attack Active' : 'Attack Console'}</span>
        </button>

        {/* Sentinel AI Copilot Trigger */}
        {onOpenAiAnalyst && (
          <button
            onClick={onOpenAiAnalyst}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-750 text-blue-400 border-slate-700'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
            }`}
            title="Open Sentinel AI Copilot & Forensics"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Copilot</span>
            {isAttackActive && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
          </button>
        )}

        {/* Light/Dark Mode Switch */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Light/Dark Theme"
          className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
            isDarkMode
              ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
              : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          <span className="hidden md:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </header>
  );
}
