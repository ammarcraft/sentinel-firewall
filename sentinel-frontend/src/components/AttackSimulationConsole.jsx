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
    name: 'TCP SYN Flood (DDoS)',
    category: 'Denial of Service',
    attackerIp: '192.168.1.105',
    targetPort: '443',
    protocol: 'TCP [SYN]',
    severity: 'CRITICAL',
    defaultPps: 2850,
    packetSize: 64,
    description:
      'Transmits high-velocity TCP connection initiation frames without completing handshakes, aiming to exhaust kernel TCP socket state buffers.',
    mitreTechnique: 'T1498.001 - Direct Network Flood'
  },
  {
    id: 'port-scan',
    name: 'Horizontal Port Reconnaissance',
    category: 'Reconnaissance',
    attackerIp: '192.168.1.105',
    targetPort: 'MULTI',
    scanPorts: [21, 22, 23, 25, 80, 135, 443, 445, 1433, 3389, 8080],
    protocol: 'TCP [SYN]',
    severity: 'HIGH',
    defaultPps: 1420,
    packetSize: 64,
    description:
      'Rapidly probes critical enterprise listening services (SSH, RDP, SMB, MSSQL) to discover open socket listeners and unpatched CVE attack surfaces.',
    mitreTechnique: 'T1046 - Network Service Discovery'
  },
  {
    id: 'http-flood',
    name: 'HTTP Layer 7 GET Flood',
    category: 'Application Exhaustion',
    attackerIp: '45.154.255.89',
    targetPort: '8080',
    protocol: 'TCP [HTTP]',
    severity: 'CRITICAL',
    defaultPps: 3200,
    packetSize: 1240,
    description:
      'Saturates web server application pools with randomized HTTP requests, depleting reverse-proxy worker threads and database connection pools.',
    mitreTechnique: 'T1499 - Endpoint Denial of Service'
  },
  {
    id: 'brute-force',
    name: 'SSH / RDP Credential Brute-Force',
    category: 'Credential Access',
    attackerIp: '185.220.101.5',
    targetPort: '22',
    protocol: 'TCP [ACK]',
    severity: 'HIGH',
    defaultPps: 640,
    packetSize: 256,
    description:
      'Automated high-frequency dictionary attack against privileged administrative remote management portals over encrypted tunnels.',
    mitreTechnique: 'T1110.001 - Password Guessing'
  },
  {
    id: 'dns-amplify',
    name: 'DNS Amplification Reflection Flood',
    category: 'Bandwidth Saturation',
    attackerIp: '194.26.29.112',
    targetPort: '53',
    protocol: 'UDP [DNS]',
    severity: 'MEDIUM',
    defaultPps: 2100,
    packetSize: 512,
    description:
      'Reflects recursive lookup queries off open external resolvers with spoofed source headers to generate asymmetrical bandwidth floods.',
    mitreTechnique: 'T1498.002 - Reflection Amplification'
  }
];

export default function AttackSimulationConsole({
  isOpen,
  onClose,
  isDarkMode,
  isAttackActive,
  activeScenario,
  onStartAttack,
  onStopAttack
}) {
  const [selectedId, setSelectedId] = useState(activeScenario?.id || 'syn-flood');
  const [intensity, setIntensity] = useState('high'); // 'moderate' | 'high' | 'aggressive'
  const [customIp, setCustomIp] = useState('');
  const [customPort, setCustomPort] = useState('');

  if (!isOpen) return null;

  const currentScenario =
    ATTACK_SCENARIOS.find((s) => s.id === selectedId) || ATTACK_SCENARIOS[0];

  const handleLaunch = () => {
    const config = {
      ...currentScenario,
      attackerIp: customIp.trim() || currentScenario.attackerIp,
      targetPort: customPort.trim() || currentScenario.targetPort,
      intensity,
      rateMultiplier: intensity === 'aggressive' ? 1.8 : intensity === 'moderate' ? 0.6 : 1.0
    };
    onStartAttack(config);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-gray-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-slate-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isAttackActive
                  ? 'bg-red-600 text-white border-red-500 animate-pulse'
                  : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800'
              }`}
            >
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Live Attack Simulation Console</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isAttackActive
                      ? 'bg-red-600 text-white border-red-700 animate-pulse'
                      : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {isAttackActive ? 'TRANSMITTING MALICIOUS FRAMES' : 'IDLE / STANDBY'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Simulate authentic cyber-threat vectors to validate real-time packet dropping, IDS signature triggers & telemetry spikes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                : 'bg-white text-slate-500 hover:text-slate-900 border-gray-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar flex-1">
          {/* Active Attack Status Banner (If running) */}
          {isAttackActive && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                isDarkMode
                  ? 'bg-red-950/40 border-red-800 text-red-200'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-red-600 animate-pulse shrink-0" />
                <div>
                  <div className="font-bold text-xs">
                    Active Scenario:{' '}
                    <span className="underline">{activeScenario?.name || 'Live DDoS Flood'}</span>
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5 font-mono">
                    Target: {activeScenario?.attackerIp} ➔ Port {activeScenario?.targetPort} •{' '}
                    {activeScenario?.protocol} • Rate: ~{activeScenario?.defaultPps || 2480} pps
                  </div>
                </div>
              </div>

              <button
                onClick={onStopAttack}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Halt Attack</span>
              </button>
            </div>
          )}

          {/* Scenario Selector Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Select Threat Scenario Vector
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {ATTACK_SCENARIOS.map((scenario) => {
                const isSelected = selectedId === scenario.id;
                const isRunningThis = isAttackActive && activeScenario?.id === scenario.id;

                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(scenario.id);
                      setCustomIp('');
                      setCustomPort('');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-slate-800/90 border-red-500 shadow-md ring-1 ring-red-500/50'
                          : 'bg-red-50/50 border-red-500 shadow-sm ring-1 ring-red-500/30'
                        : isDarkMode
                          ? 'bg-slate-850 border-slate-700/80 hover:bg-slate-800'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Crosshair
                          className={`w-4 h-4 ${
                            isSelected ? 'text-red-500' : 'text-slate-400'
                          }`}
                        />
                        <span className="font-bold text-xs">{scenario.name}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          scenario.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800'
                            : scenario.severity === 'HIGH'
                              ? 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/60 dark:text-orange-400 dark:border-orange-800'
                              : 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                        }`}
                      >
                        {scenario.severity}
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {scenario.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t pt-2 border-gray-100 dark:border-slate-700/60">
                      <span>Port {scenario.targetPort}</span>
                      <span>{scenario.protocol}</span>
                      <span>~{scenario.defaultPps} pps</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scenario Configuration Details */}
          <div
            className={`p-4 rounded-xl border space-y-4 ${
              isDarkMode ? 'bg-slate-850/60 border-slate-700' : 'bg-slate-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-500" />
                Parameters & Transmission Tuning
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                MITRE: {currentScenario.mitreTechnique}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Simulated Attacker IP
                </label>
                <input
                  type="text"
                  placeholder={currentScenario.attackerIp}
                  value={customIp}
                  onChange={(e) => setCustomIp(e.target.value)}
                  className={`w-full rounded-lg px-3 py-1.5 text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-slate-100'
                      : 'bg-white border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Target Destination Port
                </label>
                <input
                  type="text"
                  placeholder={String(currentScenario.targetPort)}
                  value={customPort}
                  onChange={(e) => setCustomPort(e.target.value)}
                  className={`w-full rounded-lg px-3 py-1.5 text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDarkMode
                      ? 'bg-slate-900 border-slate-700 text-slate-100'
                      : 'bg-white border-gray-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Packet Flood Intensity
                </label>
                <div
                  className={`grid grid-cols-3 p-0.5 rounded-lg border text-center ${
                    isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'
                  }`}
                >
                  {['moderate', 'high', 'aggressive'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setIntensity(level)}
                      className={`py-1 text-[10px] font-bold uppercase rounded transition cursor-pointer ${
                        intensity === level
                          ? level === 'aggressive'
                            ? 'bg-red-600 text-white'
                            : level === 'high'
                              ? 'bg-orange-600 text-white'
                              : 'bg-blue-600 text-white'
                          : isDarkMode
                            ? 'text-slate-400 hover:text-white'
                            : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {level === 'moderate' ? 'Mod' : level === 'high' ? 'High' : 'Aggro'}
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
            isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" />
            <span>Wire Telemetry will reflect immediate spike upon launch</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Close
            </button>

            {isAttackActive ? (
              <button
                type="button"
                onClick={() => {
                  onStopAttack();
                  onClose();
                }}
                className="bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Current Attack</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  handleLaunch();
                  onClose();
                }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 shadow-md active:scale-95"
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
