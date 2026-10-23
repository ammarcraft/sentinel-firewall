import React from 'react';
import { Activity, Wifi, Cpu } from 'lucide-react';

export default function AnalyticsPanel({
  isDarkMode,
  throughput,
  packetRate,
  allowPkts,
  dropPkts,
  sparkPoints,
  isAttackActive
}) {
  return (
    <section
      className={`rounded-xl border flex flex-col shadow-sm overflow-hidden transition-colors ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b flex items-center justify-between ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-sm">Telemetry & Analytics Dashboard</h3>
        </div>
        <span
          className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
            isDarkMode
              ? 'bg-slate-900 text-slate-300 border-slate-700'
              : 'bg-gray-100 text-slate-700 border-gray-200'
          }`}
        >
          Live Stream
        </span>
      </div>

      <div className="p-5 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className={`border p-3.5 rounded-lg transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-xs text-slate-500 flex justify-between">
              <span>Ingress Wire</span>
              <Wifi className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-lg font-bold mt-1">
              {throughput} <span className="text-xs font-normal text-slate-500">Gbps</span>
            </div>
            <div className="text-[11px] text-green-600 font-medium mt-0.5">
              {isAttackActive ? '+140% Spike' : 'Nominal Wire-Speed'}
            </div>
          </div>

          <div
            className={`border p-3.5 rounded-lg transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-xs text-slate-500 flex justify-between">
              <span>Packet Rate</span>
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-lg font-bold mt-1">
              {(packetRate / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-500">pps</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Inbound Packets</div>
          </div>

          <div
            className={`border p-3.5 rounded-lg transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-xs text-slate-500">Allowed Packets</div>
            <div className="text-lg font-bold text-green-600 dark:text-green-500 mt-1">
              {allowPkts}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Permitted Ingress</div>
          </div>

          <div
            className={`border p-3.5 rounded-lg transition-colors ${
              isAttackActive
                ? isDarkMode
                  ? 'bg-red-950/40 border-red-800'
                  : 'bg-red-50 border-red-200'
                : isDarkMode
                  ? 'bg-slate-900 border-slate-700'
                  : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-xs text-slate-500">Dropped / Blocked</div>
            <div
              className={`text-lg font-bold mt-1 ${
                isAttackActive ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {dropPkts}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {isAttackActive ? 'Attack Blocked' : 'Rules Enforced'}
            </div>
          </div>
        </div>

        {/* Real-Time SVG Sparkline Chart */}
        <div
          className={`border p-4 rounded-lg transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Traffic Volume (Allowed vs Dropped)
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <span className="w-2 h-0.5 bg-green-600 inline-block" /> Allow
              </span>
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <span className="w-2 h-0.5 bg-red-600 inline-block" /> Drop
              </span>
            </div>
          </div>

          <div className="h-28 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none">
              <line
                x1="0"
                y1="25"
                x2="300"
                y2="25"
                stroke={isDarkMode ? '#334155' : '#e2e8f0'}
                strokeDasharray="3 3"
              />
              <line
                x1="0"
                y1="50"
                x2="300"
                y2="50"
                stroke={isDarkMode ? '#334155' : '#e2e8f0'}
                strokeDasharray="3 3"
              />
              <line
                x1="0"
                y1="75"
                x2="300"
                y2="75"
                stroke={isDarkMode ? '#334155' : '#e2e8f0'}
                strokeDasharray="3 3"
              />

              {(() => {
                const points = sparkPoints
                  .map((p, idx) => {
                    const x = (idx / (sparkPoints.length - 1)) * 300;
                    const y = 100 - p.allow;
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <polyline
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points}
                  />
                );
              })()}

              {(() => {
                const points = sparkPoints
                  .map((p, idx) => {
                    const x = (idx / (sparkPoints.length - 1)) * 300;
                    const y = 100 - p.drop;
                    return `${x},${y}`;
                  })
                  .join(' ');
                return (
                  <polyline
                    fill="none"
                    stroke="#dc2626"
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

        {/* Port Distribution Breakdown */}
        <div
          className={`border p-4 rounded-lg space-y-3 text-xs transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
            <span>Port Traffic Distribution</span>
            <span className="text-slate-500 font-normal">Layer 4 Analysis</span>
          </div>

          <div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
              <span>Port 443 (HTTPS)</span>
              <span className="font-medium">52%</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
              <div className="bg-green-600 h-full rounded-full" style={{ width: '52%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
              <span>Port 80 (HTTP)</span>
              <span className="font-medium">28%</span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '28%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
              <span>Port 22 (SSH)</span>
              <span className={`font-medium ${isAttackActive ? 'text-red-600 font-bold' : ''}`}>
                {isAttackActive ? '38% (Burst)' : '14%'}
              </span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`}>
              <div
                className={`h-full rounded-full ${isAttackActive ? 'bg-red-600' : 'bg-amber-600'}`}
                style={{ width: isAttackActive ? '38%' : '14%' }}
              />
            </div>
          </div>
        </div>

        {/* Kernel Hooks Table */}
        <div
          className={`border p-4 rounded-lg text-xs space-y-1.5 transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Kernel Hooks Status
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>PREROUTING Chain:</span>
            <span className="text-green-600 font-medium">Active</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>INPUT Chain:</span>
            <span className="text-green-600 font-medium">Enforcing</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>FORWARD Chain:</span>
            <span className="text-green-600 font-medium">Stateful Inspection</span>
          </div>
        </div>
      </div>
    </section>
  );
}
