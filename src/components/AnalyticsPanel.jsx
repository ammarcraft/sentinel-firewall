import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Wifi
} from 'lucide-react';

export default function AnalyticsPanel({ rules, isAttackActive }) {
  const [throughput, setThroughput] = useState(2.34);
  const [packetRate, setPacketRate] = useState(148200);
  const [radarAngle, setRadarAngle] = useState(0);

  // Sparkline data points (Allowed vs Blocked)
  const [sparkPoints, setSparkPoints] = useState([
    { allow: 80, drop: 5 },
    { allow: 85, drop: 4 },
    { allow: 78, drop: 6 },
    { allow: 92, drop: 3 },
    { allow: 88, drop: 7 },
    { allow: 95, drop: 4 },
    { allow: 82, drop: 5 },
    { allow: 90, drop: 8 },
    { allow: 86, drop: 4 },
    { allow: 94, drop: 5 }
  ]);

  // Dynamic telemetry update loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Dynamic jitter
      const baseThroughput = isAttackActive ? 4.85 : 2.40;
      const jitterT = (Math.random() * 0.4 - 0.2);
      setThroughput(Number((baseThroughput + jitterT).toFixed(2)));

      const basePackets = isAttackActive ? 284000 : 152000;
      const jitterP = Math.floor(Math.random() * 12000 - 6000);
      setPacketRate(basePackets + jitterP);

      // Push new sparkline point
      setSparkPoints((prev) => {
        const nextAllow = Math.floor(70 + Math.random() * 25);
        const nextDrop = isAttackActive 
          ? Math.floor(55 + Math.random() * 40) // Spike in blocked packets during attack
          : Math.floor(2 + Math.random() * 10);
        
        const updated = [...prev.slice(1), { allow: nextAllow, drop: nextDrop }];
        return updated;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isAttackActive]);

  // Radar continuous rotation
  useEffect(() => {
    const radarTimer = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360);
    }, 30);
    return () => clearInterval(radarTimer);
  }, []);

  const totalRules = rules.length;
  const allowRules = rules.filter(r => r.action === 'ALLOW').length;
  const dropRules = rules.filter(r => r.action === 'DROP').length;

  return (
    <div className="bg-[#0b121e]/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full backdrop-blur-sm">
      
      {/* Analytics Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              THREAT & TRAFFIC ANALYTICS
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                isAttackActive 
                  ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-700'
              }`}>
                {isAttackActive ? 'ATTACK DETECTED' : 'NOMINAL FLOW'}
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Real-time Ingress/Egress Inspection Telemetry
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>SAMPLING: ACTIVE</span>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto terminal-scroll">
        
        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Throughput */}
          <div className="bg-[#070d17] border border-slate-800 p-3 rounded-lg relative overflow-hidden">
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Ingress Bandwidth</span>
              <Wifi className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {throughput} <span className="text-xs font-normal text-slate-400">Gbps</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>{isAttackActive ? '+128% Volumetric Spike' : 'Stable Wire-Speed'}</span>
            </div>
          </div>

          {/* Card 2: Packet Rate */}
          <div className="bg-[#070d17] border border-slate-800 p-3 rounded-lg relative overflow-hidden">
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Kernel Packet Rate</span>
              <Cpu className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {(packetRate / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400">pps</span>
            </div>
            <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 mt-1">
              <span>DPDK Zero-Copy Core</span>
            </div>
          </div>

          {/* Card 3: Threat Mitigation */}
          <div className={`border p-3 rounded-lg relative overflow-hidden ${
            isAttackActive 
              ? 'bg-rose-950/20 border-rose-800/80 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
              : 'bg-[#070d17] border-slate-800'
          }`}>
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Mitigation Efficacy</span>
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            </div>
            <div className={`text-lg font-bold font-mono mt-1 ${isAttackActive ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isAttackActive ? '99.82%' : '99.99%'}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              {isAttackActive ? 'IDS Heuristics Intercepting' : '0 Bypasses Detected'}
            </div>
          </div>

          {/* Card 4: Threat Alerts */}
          <div className={`border p-3 rounded-lg relative overflow-hidden ${
            isAttackActive 
              ? 'bg-rose-950/30 border-rose-600 shadow-neon-red animate-pulse'
              : 'bg-[#070d17] border-slate-800'
          }`}>
            <div className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
              <span>Active Threat Level</span>
              <ShieldAlert className={`w-3 h-3 ${isAttackActive ? 'text-rose-400' : 'text-slate-500'}`} />
            </div>
            <div className={`text-lg font-bold font-mono mt-1 ${isAttackActive ? 'text-rose-400' : 'text-slate-200'}`}>
              {isAttackActive ? 'CRITICAL' : 'DEFCON 4'}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              {isAttackActive ? '1 Threat Node Sandboxed' : 'Normal Sentinel Watch'}
            </div>
          </div>
        </div>

        {/* Live SVG Sparkline Chart: Allowed vs Blocked */}
        <div className="bg-[#070d17] border border-slate-800 p-3.5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-semibold">
              Live Flow Trajectory (Allowed vs Blocked)
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-0.5 bg-emerald-400 inline-block" /> Allowed
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-0.5 bg-rose-400 inline-block" /> Blocked
              </span>
            </div>
          </div>

          {/* SVG Sparkline */}
          <div className="h-28 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="allowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="dropGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="25" x2="300" y2="25" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="300" y2="75" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Allowed line */}
              {(() => {
                const points = sparkPoints.map((p, idx) => {
                  const x = (idx / (sparkPoints.length - 1)) * 300;
                  const y = 100 - p.allow;
                  return `${x},${y}`;
                }).join(' ');
                return (
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                );
              })()}

              {/* Blocked / Dropped line */}
              {(() => {
                const points = sparkPoints.map((p, idx) => {
                  const x = (idx / (sparkPoints.length - 1)) * 300;
                  const y = 100 - p.drop;
                  return `${x},${y}`;
                }).join(' ');
                return (
                  <polyline
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Radar & Targeted Ports Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Circular Cyber Threat Radar */}
          <div className="bg-[#070d17] border border-slate-800 p-3 rounded-lg flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-mono uppercase text-slate-400 mb-2 w-full text-left flex justify-between items-center">
              <span>Threat Radar</span>
              <span className="text-[9px] text-cyan-400">360° SWEEP</span>
            </div>

            <div className="relative w-28 h-28 my-1 flex items-center justify-center">
              {/* Concentric rings */}
              <div className="absolute inset-0 rounded-full border border-slate-800" />
              <div className="absolute inset-3 rounded-full border border-slate-800/80" />
              <div className="absolute inset-7 rounded-full border border-slate-800/60" />
              <div className="absolute inset-0 border-t border-b border-slate-800/60" />
              <div className="absolute inset-0 border-l border-r border-slate-800/60" />

              {/* Rotating radar beam */}
              <div 
                className="absolute inset-0 rounded-full origin-center pointer-events-none"
                style={{
                  transform: `rotate(${radarAngle}deg)`,
                  background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.4) 0deg, rgba(6, 182, 212, 0) 60deg, transparent 60deg)'
                }}
              />

              {/* Center point */}
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] z-10" />

              {/* Threat blips */}
              {isAttackActive ? (
                <div 
                  className="absolute top-5 right-6 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-neon-red animate-ping"
                  title="Host 192.168.1.105 (Hostile Probe)"
                />
              ) : (
                <div className="absolute bottom-6 left-7 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-60" />
              )}
            </div>

            <div className="text-[10px] font-mono text-slate-400 mt-1">
              {isAttackActive ? (
                <span className="text-rose-400 font-bold">1 Hostile Blip: 192.168.1.105</span>
              ) : (
                <span>No hostile incursions in perimeter</span>
              )}
            </div>
          </div>

          {/* Top Targeted Ports Progress Bars & Rule summary */}
          <div className="bg-[#070d17] border border-slate-800 p-3 rounded-lg flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400 mb-2 font-semibold flex justify-between">
                <span>Port Threat Vectors</span>
                <span className="text-slate-500 font-normal">{totalRules} Policies ({allowRules}A / {dropRules}D)</span>
              </div>
              <div className="space-y-2 text-[11px] font-mono">
                <div>
                  <div className="flex justify-between text-slate-300 mb-0.5">
                    <span>Port 443 (HTTPS)</span>
                    <span className="text-slate-400">45%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-0.5">
                    <span>Port 80 (HTTP)</span>
                    <span className="text-slate-400">28%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-0.5">
                    <span>Port 22 (SSH Brute)</span>
                    <span className={isAttackActive ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                      {isAttackActive ? '36% (BURST)' : '18%'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isAttackActive ? 'bg-rose-500 shadow-neon-red' : 'bg-amber-500'}`} 
                      style={{ width: isAttackActive ? '36%' : '18%' }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
              <span>FILTER CHAIN:</span>
              <span className="text-emerald-400">FORWARD / INPUT</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
