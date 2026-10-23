import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  FileDown, 
  ChevronDown, 
  User, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Activity, 
  Radio, 
  FileText, 
  FileSpreadsheet, 
  Flame
} from 'lucide-react';
import { soundEffects } from '../utils/audio';

export default function Navbar({ 
  user, 
  onLogout, 
  isAttackActive, 
  onSimulateAttack,
  onNotify
}) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEffects.getIsMuted());

  const handleToggleSound = () => {
    const next = soundEffects.toggleMute();
    setIsMuted(next);
  };

  const handleExport = (format) => {
    setIsExportOpen(false);
    soundEffects.playSuccess();
    if (onNotify) {
      onNotify({
        type: 'export',
        title: `Export Initiated (${format})`,
        message: `SOC report bundle generated: AEGIS_INCIDENT_REPORT_${Date.now()}.${format.toLowerCase()}`
      });
    }
  };

  return (
    <header className="bg-[#0b111e]/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-[1920px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & System Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border transition-all duration-300 ${
              isAttackActive 
                ? 'bg-rose-950/70 border-rose-500 shadow-neon-red animate-pulse' 
                : 'bg-emerald-950/60 border-emerald-500/40 shadow-neon-green'
            }`}>
              {isAttackActive ? (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              ) : (
                <Shield className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white font-mono text-base">
                  AEGIS-FIREWALL
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  IDS v4.19
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex h-2 w-2 relative">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isAttackActive ? 'bg-rose-400' : 'bg-emerald-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    isAttackActive ? 'bg-rose-500' : 'bg-emerald-500'
                  }`} />
                </span>
                <span className={isAttackActive ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                  {isAttackActive ? 'DEFCON 1 // ACTIVE INCIDENT' : 'KERNEL ENGINE ACTIVE'}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Telemetry Pill */}
          <div className="hidden xl:flex items-center gap-4 pl-4 border-l border-slate-800 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>LATENCY: <strong className="text-slate-200">0.82ms</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>ETH0 PROMISCUOUS: <strong className="text-emerald-400">ARMED</strong></span>
            </div>
          </div>
        </div>

        {/* Center/Actions: Attack Simulator Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSimulateAttack}
            className={`px-3.5 py-2 rounded-lg font-mono text-xs font-bold flex items-center gap-2 border transition-all duration-200 cursor-pointer ${
              isAttackActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-neon-red animate-pulse'
                : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border-rose-700/60 hover:border-rose-500'
            }`}
          >
            <Flame className={`w-4 h-4 ${isAttackActive ? 'animate-bounce' : 'text-rose-400'}`} />
            <span>{isAttackActive ? 'ATTACK IN PROGRESS (CLICK TO RE-TRIGGER)' : 'SIMULATE ATTACK'}</span>
          </button>
        </div>

        {/* Right Section: Export Dropdown + Audio Toggle + User Profile */}
        <div className="flex items-center gap-3">
          
          {/* Audio Feedback Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Audio SFX' : 'Mute Audio SFX'}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Export Reports (CSV/PDF) Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-750 hover:border-slate-600 text-slate-200 px-3.5 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-cyan-400" />
              <span>Export Reports</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
            </button>

            {isExportOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsExportOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-64 bg-[#0b111e] border border-slate-750 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase text-slate-500 font-semibold border-b border-slate-800">
                    SOC Telemetry & Audit Dossier
                  </div>
                  <div className="mt-1 space-y-1">
                    <button
                      onClick={() => handleExport('CSV')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-emerald-300 hover:bg-slate-800/80 rounded-lg transition text-left cursor-pointer font-mono"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-medium">Export Packet Logs (.CSV)</div>
                        <div className="text-[10px] text-slate-500">Raw network captures & rule hits</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleExport('PDF')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-lg transition text-left cursor-pointer font-mono"
                    >
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="font-medium">Export IDS Audit Dossier (.PDF)</div>
                        <div className="text-[10px] text-slate-500">Executive summary & forensics</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Badge (Role: Admin) */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-cyan-500 p-0.5">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-300" />
              </div>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {user?.name || 'Cmdr. Alex Vance'}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  Role: {user?.role || 'Admin'}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Logout & Lock Terminal"
              className="p-2 ml-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
