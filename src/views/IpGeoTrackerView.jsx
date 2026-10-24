import React from 'react';
import IpGeoTracker from '../components/IpGeoTracker';

export default function IpGeoTrackerView({
  isDarkMode,
  logs = [],
  threatEvents = [],
  rules = [],
  onAutoBlock,
  onOpenAiQuery
}) {
  return (
    <div className="space-y-6">
      <IpGeoTracker
        isDarkMode={isDarkMode}
        logs={logs}
        threatEvents={threatEvents}
        rules={rules}
        onAutoBlock={onAutoBlock}
        onOpenAiQuery={onOpenAiQuery}
      />
    </div>
  );
}
