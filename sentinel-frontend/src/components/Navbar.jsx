import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  Activity,
  Radio,
  SlidersHorizontal,
  Globe,
  Flame,
  Bot,
  Sun,
  Moon,
  Zap,
  Shield,
  ChevronDown
} from 'lucide-react';

export default function Navbar({
  isDarkMode,
  setIsDarkMode,
  activeView,
  setActiveView,
  onToggleSidebar,
  totalPkts = 0,
  threatsCount = 0,
  rulesCount = 1,
  geoNodesCount = 6,
  trafficMode = 'live',
  setTrafficMode,
  snifferStatus,
  isAttackActive = false,
  onToggleAttack,
  onOpenAttackConsole,
  onOpenAiAnalyst
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    {
      id: 'monitor',
      label: 'Live Monitor',
      icon: Activity,
      count: `${totalPkts} pkts`,
      badgeColor: 'text-blue-500 bg-blue-500/10'
    },
    {
      id: 'ids',
      label: 'Intrusion Detection (IDS)',
      icon: Radio,
      count: `${threatsCount} threats`,
      badgeColor: threatsCount > 0 ? 'text-red-500 bg-red-500/10' : 'text-slate-400 bg-slate-500/10'
    },
    {
      id: 'rules',
      label: 'Policy & Rules',
      icon: SlidersHorizontal,
      count: `${rulesCount} rules`,
      badgeColor: 'text-indigo-500 bg-indigo-500/10'
    },
    {
      id: 'geo',
      label: 'IP Geo Tracker',
      icon: Globe,
      count: `${geoNodesCount} nodes`,
      badgeColor: 'text-amber-500 bg-amber-500/10'
    }
  ];

  return (
    <header
      className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between shrink-0 transition-colors z-30 relative ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
      }`}
    >
      {/* Left Section: 3-Line Hamburger Menu & View Title */}
      <div className="flex items-center gap-3">
        {/* 3-Line Hamburger Menu Button with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={`p-2 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              isDropdownOpen
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : isDarkMode
                  ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-slate-700 border-gray-300'
            }`}
            title="Toggle Navigation Views Menu"
          >
            {isDropdownOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="hidden sm:inline text-xs font-semibold">Views</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* 3-Line Dropdown Menu Panel */}
          {isDropdownOpen && (
            <div
              className={`absolute top-full left-0 mt-2 w-72 rounded-2xl border p-2 shadow-2xl z-50 transition-all duration-150 animate-in fade-in slide-in-from-top-2 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
              }`}
            >
              <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800 mb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Select SecOps View
                </span>
                <span className="text-[10px] text-blue-500 font-mono font-semibold">4 Active Modules</span>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (setActiveView) setActiveView(item.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                        isActive
                          ? isDarkMode
                            ? 'bg-slate-800 text-blue-400 border-slate-700 shadow-sm'
                            : 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                          : isDarkMode
                            ? 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {onToggleSidebar && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      onToggleSidebar();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg text-center text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    Toggle Sidebar Layout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current View Breadcrumb / Title */}
        <div className="hidden sm:block">
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

      {/* Right Section: Mode Switcher, Attack Console, AI Analyst & Theme */}
      <div className="flex items-center gap-2 sm:gap-2.5">
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

        {/* Sentinel AI Analyst Trigger */}
        {onOpenAiAnalyst && (
          <button
            onClick={onOpenAiAnalyst}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-750 text-blue-400 border-slate-700'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
            }`}
            title="Open Sentinel AI Analyst & Copilot"
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
