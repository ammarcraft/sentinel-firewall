import React from 'react';
import { Play, Pause } from 'lucide-react';

export default function LiveTrafficTerminal({
  isDarkMode,
  filteredLogs,
  totalPkts,
  isTerminalPaused,
  setIsTerminalPaused,
  autoScroll,
  setAutoScroll,
  logFilter,
  setLogFilter,
  logGrep,
  setLogGrep,
  isAttackActive,
  terminalBoxRef
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
          <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
          <h3 className="font-semibold text-sm">Live Traffic Terminal</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 mr-2">
            Packets: <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{totalPkts}</strong>
          </span>
          <button
            onClick={() => setIsTerminalPaused(!isTerminalPaused)}
            className={`p-1.5 rounded text-xs transition cursor-pointer border ${
              isTerminalPaused
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-700'
                : isDarkMode
                  ? 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-slate-700 border-gray-300 hover:bg-gray-50'
            }`}
            title={isTerminalPaused ? 'Resume Stream' : 'Pause Stream'}
          >
            {isTerminalPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded text-xs transition cursor-pointer border ${
              autoScroll
                ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-700'
                : isDarkMode
                  ? 'bg-slate-900 text-slate-400 border-slate-700'
                  : 'bg-white text-slate-400 border-gray-300'
            }`}
            title={autoScroll ? 'Auto-scroll Enabled' : 'Auto-scroll Disabled'}
          >
            <span className="font-mono text-[10px] font-bold">SCRL</span>
          </button>
        </div>
      </div>

      {/* Filter and Grep Controls */}
      <div
        className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDarkMode ? 'bg-slate-850 border-slate-700' : 'bg-slate-50 border-gray-200'
        }`}
      >
        <div
          className={`flex rounded-md p-0.5 border ${
            isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-100 border-gray-200'
          }`}
        >
          <button
            onClick={() => setLogFilter('ALL')}
            className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
              logFilter === 'ALL'
                ? isDarkMode
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-900 shadow-sm'
                : isDarkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setLogFilter('ALLOWED')}
            className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
              logFilter === 'ALLOWED'
                ? 'bg-green-600 text-white'
                : isDarkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ALLOWED
          </button>
          <button
            onClick={() => setLogFilter('DROPPED')}
            className={`px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
              logFilter === 'DROPPED'
                ? 'bg-red-600 text-white'
                : isDarkMode
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            DROPPED
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="grep IP / port..."
            value={logGrep}
            onChange={(e) => setLogGrep(e.target.value)}
            className={`rounded-md px-2.5 py-1 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 w-36 transition font-mono ${
              isDarkMode
                ? 'bg-slate-900 border-slate-700 text-slate-100'
                : 'bg-white border-gray-300 text-slate-900'
            }`}
          />
        </div>
      </div>

      {/* Terminal Window (Strictly Monospace, auto-scrolls internally) */}
      <div className="p-3 flex-1 flex flex-col">
        <div
          ref={terminalBoxRef}
          className="bg-slate-950 text-slate-200 border border-slate-800 rounded-lg p-3.5 font-mono text-xs flex-1 overflow-y-auto custom-scrollbar space-y-1 select-text min-h-[460px] max-h-[580px]"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              {isTerminalPaused
                ? '[FEED PAUSED - CLICK PLAY TO RESUME]'
                : '[AWAITING NETWORK FRAMES (2000ms CADENCE)...]'}
            </div>
          ) : (
            filteredLogs.map((pkt) => {
              const isDrop = pkt.action === 'DROP';
              return (
                <div
                  key={pkt.id}
                  className={`flex flex-wrap items-baseline gap-x-2 py-0.5 px-1.5 rounded ${
                    isDrop ? 'bg-red-950/25 hover:bg-red-950/40' : 'bg-green-950/20 hover:bg-green-950/35'
                  }`}
                >
                  <span className="text-slate-500 text-[11px]">[{pkt.time}]</span>
                  <span
                    className={`font-bold px-1 rounded text-[11px] ${
                      isDrop ? 'text-red-400 bg-red-950/60' : 'text-green-400 bg-green-950/60'
                    }`}
                  >
                    {isDrop ? '[DROP]' : '[ALLOW]'}
                  </span>
                  <span className="text-blue-400 font-semibold">{pkt.proto}</span>
                  <span className="text-slate-300">
                    <strong
                      className={
                        pkt.srcIp === '192.168.1.105' ? 'text-red-400 font-bold underline' : 'text-slate-200'
                      }
                    >
                      {pkt.srcIp}:{pkt.srcPort}
                    </strong>
                    <span className="text-slate-500 mx-1">➔</span>
                    <span>
                      {pkt.dstIp}:{pkt.dstPort}
                    </span>
                  </span>
                  <span className="text-slate-500 text-[11px]">len={pkt.len}B</span>
                  <span className="text-slate-500 text-[11px]">ttl={pkt.ttl}</span>
                  <span className="text-slate-400 text-[11px] ml-auto">{pkt.rule}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Terminal Footer */}
      <div
        className={`p-2.5 border-t flex items-center justify-between text-xs text-slate-500 ${
          isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-600" />
          <span>Interface eth0 (Local Promiscuous)</span>
        </div>
        <div>Interval: {isAttackActive ? '900ms (Active Attack)' : '2000ms (Normal)'}</div>
      </div>
    </section>
  );
}
