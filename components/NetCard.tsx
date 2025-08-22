
import React from 'react';
import { Net, Profile } from '../types';
import { formatTime, formatTimeZone, formatSchedule } from '../lib/time';
import { Icon } from './Icon';
import { NetTypeBadge } from './NetTypeBadge';

interface NetCardProps {
  net: Net;
  sessionCount?: number;
  isActive?: boolean;
  profile: Profile | null;
  canManageSessions?: boolean;
  canEditNet?: boolean;
  isOwnerOrAdmin?: boolean;
  hasRoster?: boolean;
  onViewDetails: () => void;
  onStartSession?: () => void;
  onEndSession?: () => void;
  onEditNet?: () => void;
  onDeleteNet?: () => void;
  onEditRoster?: () => void;
}

export const NetCard: React.FC<NetCardProps> = ({ net, sessionCount, isActive, canManageSessions = false, canEditNet = false, isOwnerOrAdmin = false, hasRoster = false, onStartSession, onEndSession, onEditNet, onDeleteNet, onViewDetails, onEditRoster }) => {
  const showActionFooter = onStartSession && onEditNet && onDeleteNet && onEditRoster && (canManageSessions || canEditNet || isOwnerOrAdmin);

  return (
    <div className="bg-light-card dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden flex flex-col transition-transform hover:scale-[1.02] focus-within:ring-2 focus-within:ring-brand-primary">
      <div className="p-5 flex-grow cursor-pointer" onClick={onViewDetails} role="button" tabIndex={0} onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') onViewDetails()}}>
        <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-1">{net.name}</h2>
            <div className="flex items-center gap-2">
                <NetTypeBadge type={net.net_type} />
                {isActive && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-500/20 text-green-300">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span>Active</span>
                    </div>
                )}
            </div>
        </div>
        
        <div className="mb-4">
            {net.description && (
                <p className="text-sm mt-2 dark:text-dark-text-secondary truncate" title={net.description}>
                    {net.description}
                </p>
            )}
        </div>
        
        <div className="text-sm space-y-2 text-gray-600 dark:text-dark-text-secondary">
            <p><span className="font-semibold text-light-text dark:text-dark-text">Net Control:</span> {net.primary_nco} ({net.primary_nco_callsign})</p>
            <p><span className="font-semibold text-light-text dark:text-dark-text">Schedule:</span> {formatSchedule(net.schedule)} at {formatTime(net.time)} {formatTimeZone(net.time_zone)}</p>
            {typeof sessionCount === 'number' && <p><span className="font-semibold text-light-text dark:text-dark-text">Sessions:</span> {sessionCount}</p>}
        </div>
      </div>

      {showActionFooter && (
          <div className="bg-dark-800/50 dark:bg-dark-700/50 px-5 py-3 flex justify-between items-center">
            {canManageSessions ? (
              isActive && onEndSession ? (
                <button
                  onClick={onEndSession}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  <Icon className="text-base">stop</Icon>
                  End Session
                </button>
              ) : (
                <button 
                  onClick={onStartSession} 
                  disabled={isActive}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  <Icon className="text-base">play_arrow</Icon>
                  Start Session
                </button>
              )
            ) : <div /> /* Spacer */}
            <div className="flex items-center gap-1">
                {hasRoster && canEditNet && (
                    <button onClick={onEditRoster} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors" aria-label="Edit Roster">
                        <Icon className="text-xl">groups</Icon>
                    </button>
                )}
                {canEditNet && (
                  <button onClick={onEditNet} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors" aria-label="Edit NET">
                      <Icon className="text-xl">settings</Icon>
                  </button>
                )}
                {isOwnerOrAdmin && (
                  <button onClick={onDeleteNet} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors" aria-label="Delete NET">
                      <Icon className="text-xl">delete</Icon>
                  </button>
                )}
            </div>
          </div>
      )}
    </div>
  );
};
