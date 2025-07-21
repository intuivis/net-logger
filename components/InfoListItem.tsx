import React from 'react';

interface InfoListItemProps {
  badge: React.ReactNode;
  children: React.ReactNode;
}

export const InfoListItem: React.FC<InfoListItemProps> = ({ badge, children }) => {
  return (
    <li className="flex flex-col sm:flex-row sm:items-center px-4 py-4 gap-4 hover:bg-dark-700/30 transition-colors">
      <div className="flex-shrink-0 w-40 flex">
        {badge}
      </div>
      <div className="flex-1 sm:px-1">
        {children}
      </div>
    </li>
  );
};
