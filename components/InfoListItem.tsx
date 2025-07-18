import React from 'react';

interface InfoListItemProps {
  badge: React.ReactNode;
  children: React.ReactNode;
}

export const InfoListItem: React.FC<InfoListItemProps> = ({ badge, children }) => {
  return (
    <li className="flex items-center p-6 gap-6 hover:bg-dark-700/30 transition-colors">
      <div className="flex-shrink-0 w-36 flex justify-center">
        {badge}
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </li>
  );
};
