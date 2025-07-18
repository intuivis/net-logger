
import React from 'react';
import { Icon } from './Icon';

export const NCOBadge: React.FC = () => {
  return (
    <div
      className="inline-flex items-center justify-center p-1 rounded-full bg-blue-500/10 text-blue-300"
      title="Net Control Operator for this session"
    >
      <Icon className="w-4 h-4 text-base">shield</Icon>
    </div>
  );
};
