import React from 'react';
import {
  Download,
  ChevronDown,
  AlertTriangle,
  Flame,
  Bot,
  Sparkles,
  Sun,
  Moon,
  FileSpreadsheet,
  FileText,
  Folder,
  Zap,
  Radio,
  Globe,
  Wifi
} from 'lucide-react';

export default function Navbar({
  isDarkMode,
  setIsDarkMode,
  activeView,
  trafficMode = 'simulation',
  setTrafficMode,
  snifferStatus,
  isAttackActive,
  onToggleAttack,
  onOpenAttackConsole,
  onOpenAiAnalyst,
  exportOpen,
  setExportOpen,
  onExport
}) {
  return (
    <header
      className={`h-16 border-b px-6 flex items-center justify-between shrink-0 transition-colors z-10 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
      }`}
    >
      {/* Current View Breadcrumb / Title */}
      <div>
        <h2 className="text-sm font-bold tracking-tight">
          {activeView === 'monitor'
            ? 'Live Monitor & Threat Telemetry'
            : activeView === 'rules'
              ? 'Firewall Policy & Filtering Rules Engine'
              : activeView === 'geo'
                ? 'IP Geolocation & Threat Trajectory Radar'
                : 'Intrusion Detection System (IDS) & Threat Intelligence'}
        </h2>
        <p className={`text-[11px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {activeView === 'monitor'
            ? 'Continuous network packet inspection and stateful analytics'
            : activeView === 'rules'
              ? 'Deterministic packet filtering configuration applied to Linux Netfilter / iptables chains'
              : activeView === 'geo'
                ? 'Ingress node geolocation mapping, ASN intelligence, and cross-border packet vectors'
                : 'Heuristic anomaly detection, threat signature analysis & automated mitigation'}
        </p>
      </div>

      {/* Top Navbar Actions */}
      <div className="flex items-center gap-2.5">
        {/* Mode Toggle: Simulation Mode vs Live Network Mode */}
        {setTrafficMode && (
          <div
            className={`flex items-center p-0.5 rounded-lg border transition ${
              isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-gray-300'
            }`}
          >
            <button
              onClick={() => setTrafficMode('simulation')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                trafficMode === 'simulation'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Simulation Mode: Run test vectors & jury attack demonstrations"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulation</span>
            </button>
            <button
              onClick={() => setTrafficMode('live')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                trafficMode === 'live'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isDarkMode
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Live Network Mode: Capture live host network interface traffic via backend bridge"
            >
              <Radio className={`w-3.5 h-3.5 ${trafficMode === 'live' ? 'animate-pulse' : ''}`} />
              <span>Live Network</span>
            </button>
          </div>
        )}

        {/* Live Interface Indicator Pill (Visible in Live Network Mode) */}
        {trafficMode === 'live' && (
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border ${
              snifferStatus?.connected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                snifferStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>
              {snifferStatus?.connected
                ? `Bridge: ${snifferStatus.interface || 'Host Sockets'}`
                : 'Bridge: Connecting...'}
            </span>
          </div>
        )}

        {/* Live Attack Simulation Console Trigger */}
        <button
          onClick={onOpenAttackConsole || onToggleAttack}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
            isAttackActive
              ? 'bg-red-600 hover:bg-red-700 text-white border-red-700 shadow-sm animate-pulse'
              : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/80'
          }`}
          title="Open Live Attack Simulation Console"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{isAttackActive ? 'Attack Active' : 'Attack Console'}</span>
        </button>

        {/* Sentinel AI Analyst Trigger */}
        {onOpenAiAnalyst && (
          <button
            onClick={onOpenAiAnalyst}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-750 text-blue-400 border-slate-700'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
            }`}
            title="Open Sentinel AI Analyst & Forensic Chatbot"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Analyst</span>
            {isAttackActive && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>
        )}

        {/* Light/Dark Mode Toggle Switch */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Light/Dark Theme"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition cursor-pointer ${
            isDarkMode
              ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
              : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          <span>{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>

        {/* Export Reports Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className={`border text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                : 'bg-white hover:bg-gray-50 border-gray-300 text-slate-700'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {exportOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setExportOpen(false)} />
              <div
                className={`absolute right-0 mt-1 w-64 rounded-md shadow-lg border p-1 z-50 text-xs ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                  <span>Report Formats</span>
                  <span className="text-[10px] text-green-600 font-normal">Direct Disk Save</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => onExport('CSV')}
                    className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 cursor-pointer transition ${
                      isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-50 text-slate-700'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Packet Logs (.csv)</div>
                      <div className="text-[10px] text-slate-400">All captured packets & active rules</div>
                    </div>
                  </button>
                  <button
                    onClick={() => onExport('PDF')}
                    className={`w-full text-left px-3 py-2 rounded flex items-center gap-2.5 cursor-pointer transition ${
                      isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-gray-50 text-slate-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">Security Summary (.pdf)</div>
                      <div className="text-[10px] text-slate-400">Firewall audit & threat metrics</div>
                    </div>
                  </button>
                </div>
                <div className="mt-1 pt-2 px-3 py-2 text-[10px] border-t border-gray-100 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/50 rounded-b">
                  <div className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                    <Folder className="w-3.5 h-3.5 text-blue-600" />
                    <span>Saved to local folder:</span>
                  </div>
                  <div className="font-mono text-[9px] text-slate-500 dark:text-slate-400 select-all break-all">
                    Reports\
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
