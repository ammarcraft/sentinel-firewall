import React, { useState } from 'react';
import {
  Flame,
  ShieldAlert,
  X,
  Play,
  Square,
  Activity,
  Zap,
  Server,
  Crosshair,
  AlertTriangle,
  Radio,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const ATTACK_SCENARIOS = [
  {
    id: 'syn-flood',
    name: 'TCP SYN Flood (DDoS Attack)',
    category: 'Denial of Service',
    attackerIp: '192.168.1.105',
    targetPort: '443',
    protocol: 'TCP [SYN]',
    severity: 'CRITICAL',
    defaultPps: 2850,
    packetSize: 64,
    description:
      'Transmits high-velocity TCP connection initiation frames without completing handshakes, aiming to exhaust kernel TCP socket state buffers and validate firewall DROP rules.',
    mitreTechnique: 'T1498.001 - Direct Network Flood'
  }
];

export default function AttackSimulationConsole({
  isOpen,
  onClose,
  isDarkMode = false,
  isAttackActive = false,
  activeScenario = ATTACK_SCENARIOS[0],
  onStartAttack,
  onStopAttack
}) {
  const [attackerIp, setAttackerIp] = useState(activeScenario?.attackerIp || '192.168.1.105');
  const [targetPort, setTargetPort] = useState(activeScenario?.targetPort || '443');
  const [intensity, setIntensity] = useState('high'); // 'moderate' | 'high' | 'aggressive'

  if (!isOpen) return null;

  const currentScenario = ATTACK_SCENARIOS[0];

  const handleLaunch = () => {
    if (onStartAttack) {
      onStartAttack({
        ...currentScenario,
        attackerIp: attackerIp.trim() || '192.168.1.105',
        targetPort: targetPort.trim() || '443',
        intensity
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm transition-opacity">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">Live Attack Simulation Console</h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isAttackActive
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                      : isDarkMode
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-gray-100 text-slate-600 border-gray-300'
                  }`}
                >
                  {isAttackActive ? 'TRANSMITTING MALICIOUS FRAMES' : 'IDLE / STANDBY'}
                </span>
              </div>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-0.5`}>
                Simulate authentic cyber-threat vector to validate real-time packet dropping & IDS triggers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-xs">
          {/* Active Attack Vector Card */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Primary Threat Scenario
              </span>
              <span className="text-[10px] font-mono text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                {currentScenario.severity}
              </span>
            </div>

            <div
              className={`p-4 rounded-xl border transition ${
                isAttackActive
                  ? 'border-red-500/60 bg-red-950/20 shadow-md'
                  : isDarkMode
                    ? 'border-slate-800 bg-slate-950/50'
                    : 'border-gray-200 bg-slate-50/70'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span className="font-bold text-sm">{currentScenario.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{currentScenario.category}</span>
              </div>

              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">
                {currentScenario.description}
              </p>

              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/40 text-[11px] font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">Default Target</span>
                  <span className="font-semibold text-slate-200">Port {targetPort} (HTTPS)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Protocol Frame</span>
                  <span className="font-semibold text-slate-200">{currentScenario.protocol}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">MITRE Technique</span>
                  <span className="font-semibold text-slate-200">{currentScenario.mitreTechnique}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Parameters & Transmission Tuning */}
          <div
            className={`p-4 rounded-xl border ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Transmission Parameters & Tuning</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Layer 4 SYN Ingress Flood</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Attacker IP */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Simulated Attacker IP
                </label>
                <input
                  type="text"
                  value={attackerIp}
                  onChange={(e) => setAttackerIp(e.target.value)}
                  placeholder="192.168.1.105"
                  className={`w-full px-3 py-2 rounded-lg border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-red-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              {/* Target Port */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Target Destination Port
                </label>
                <input
                  type="text"
                  value={targetPort}
                  onChange={(e) => setTargetPort(e.target.value)}
                  placeholder="443"
                  className={`w-full px-3 py-2 rounded-lg border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-red-500 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                  Packet Flood Intensity
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'moderate', label: 'MOD' },
                    { id: 'high', label: 'HIGH' },
                    { id: 'aggressive', label: 'AGGRO' }
                  ].map((int) => (
                    <button
                      key={int.id}
                      type="button"
                      onClick={() => setIntensity(int.id)}
                      className={`py-2 rounded-md font-mono text-[10px] font-bold border transition cursor-pointer ${
                        intensity === int.id
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : isDarkMode
                            ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            : 'bg-white border-gray-300 text-slate-600 hover:bg-gray-100'
                      }`}
                    >
                      {int.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`p-4 border-t flex items-center justify-between gap-3 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Wire Telemetry will reflect immediate spike upon launch</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium text-xs border transition cursor-pointer ${
                isDarkMode
                  ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                  : 'border-gray-300 hover:bg-gray-100 text-slate-700'
              }`}
            >
              Close
            </button>

            {isAttackActive ? (
              <button
                onClick={onStopAttack}
                className="px-4 py-2 rounded-lg font-bold text-xs bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/40 flex items-center gap-2 transition cursor-pointer shadow-sm animate-pulse"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Halt Attack Vector</span>
              </button>
            ) : (
              <button
                onClick={handleLaunch}
                className="px-4 py-2 rounded-lg font-bold text-xs bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 transition cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch Attack Scenario</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
