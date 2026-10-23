import React from 'react';
import RuleManager from '../components/RuleManager';

export default function PolicyRulesView(props) {
  return (
    <div className="w-full">
      <RuleManager {...props} />
    </div>
  );
}
