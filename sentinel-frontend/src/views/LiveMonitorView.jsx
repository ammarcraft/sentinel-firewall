import React from 'react';
import LiveTrafficTerminal from '../components/LiveTrafficTerminal';
import AnalyticsPanel from '../components/AnalyticsPanel';

export default function LiveMonitorView({
  isDarkMode,
  logs = [],
  filteredLogs = [],
  totalPkts = 0,
  isTerminalPaused,
  setIsTerminalPaused,
  autoScroll,
  setAutoScroll,
  logFilter,
  setLogFilter,
  logGrep,
  setLogGrep,
  isAttackActive,
  terminalBoxRef,
  throughput,
  packetRate,
  allowPkts,
  dropPkts,
  sparkPoints = [],
  onClearLogs
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[640px]">
      <div className="xl:col-span-7 flex flex-col">
        <LiveTrafficTerminal
          isDarkMode={isDarkMode}
          logs={logs}
          filteredLogs={filteredLogs}
          totalPkts={totalPkts}
          isTerminalPaused={isTerminalPaused}
          setIsTerminalPaused={setIsTerminalPaused}
          autoScroll={autoScroll}
          setAutoScroll={setAutoScroll}
          logFilter={logFilter}
          setLogFilter={setLogFilter}
          logGrep={logGrep}
          setLogGrep={setLogGrep}
          isAttackActive={isAttackActive}
          terminalBoxRef={terminalBoxRef}
          onClearLogs={onClearLogs}
        />
      </div>

      <div className="xl:col-span-5 flex flex-col">
        <AnalyticsPanel
          isDarkMode={isDarkMode}
          logs={logs}
          throughput={throughput}
          packetRate={packetRate}
          allowPkts={allowPkts}
          dropPkts={dropPkts}
          sparkPoints={sparkPoints}
          isAttackActive={isAttackActive}
        />
      </div>
    </div>
  );
}
