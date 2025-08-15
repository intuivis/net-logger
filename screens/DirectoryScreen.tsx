import React, { useState, useMemo } from 'react';
import { Net, NetSession, NetType, NetConfigType, DayOfWeek, NET_CONFIG_TYPE_LABELS, CheckIn, Profile } from '../types';
import { NetCard } from '../components/NetCard';
import { NetTable } from '../components/NetTable';
import { Icon } from '../components/Icon';
import { NET_TYPE_OPTIONS, NET_CONFIG_TYPE_OPTIONS, DAY_OF_WEEK_OPTIONS } from '../constants';
import LiveNetsSection from '../components/LiveNetsSection';

interface DirectoryScreenProps {
  nets: Net[];
  sessions: NetSession[];
  onViewNetDetails: (netId: string) => void;
  activeSessions: NetSession[];
  checkIns: CheckIn[];
  profile: Profile | null;
  onViewSession: (sessionId: string) => void;
}

const DirectoryScreen: React.FC<DirectoryScreenProps> = ({ nets, sessions, onViewNetDetails, activeSessions, checkIns, profile, onViewSession }) => {
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [netTypeFilter, setNetTypeFilter] = useState<NetType | 'all'>('all');
  const [configTypeFilter, setConfigTypeFilter] = useState<NetConfigType | 'all'>('all');
  const [dayFilter, setDayFilter] = useState<DayOfWeek | 'all'>('all');

  const activeSessionNetIds = useMemo(() => new Set(sessions.filter(s => s.end_time === null).map(s => s.net_id)), [sessions]);

  const filteredNets = useMemo(() => {
    return nets.filter(net => {
      const typeMatch = netTypeFilter === 'all' || net.net_type === netTypeFilter;
      const configMatch = configTypeFilter === 'all' || net.net_config_type === configTypeFilter;
      const dayMatch = dayFilter === 'all' || net.schedule === dayFilter;
      return typeMatch && configMatch && dayMatch;
    });
  }, [nets, netTypeFilter, configTypeFilter, dayFilter]);
  
  const toggleButtonBaseClass = "p-1.5 rounded-md transition-colors";
  const toggleButtonActiveClass = "bg-dark-800 text-dark-text";
  const toggleButtonInactiveClass = "text-dark-text-secondary hover:bg-dark-800/50 hover:text-dark-text";

  return (
    <div className="space-y-8">
      <LiveNetsSection
        activeSessions={activeSessions}
        nets={nets}
        checkIns={checkIns}
        onViewSession={onViewSession}
        profile={profile}
      />
        
      <div>
        <h1 className="text-3xl font-bold tracking-tight">NET Directory</h1>
        <p className="text-dark-text-secondary mt-1">Browse and all available NETs in this community.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-4 bg-dark-800 rounded-lg">
        <div className="flex items-center gap-4 flex-wrap">
          <select
            aria-label="Filter by NET type"
            value={netTypeFilter}
            onChange={e => setNetTypeFilter(e.target.value as NetType | 'all')}
            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-10"
          >
            <option value="all">All NET Types</option>
            {NET_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select
            aria-label="Filter by Configuration type"
            value={configTypeFilter}
            onChange={e => setConfigTypeFilter(e.target.value as NetConfigType | 'all')}
            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-10"
          >
            <option value="all">All Configurations</option>
            {NET_CONFIG_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{NET_CONFIG_TYPE_LABELS[opt]}</option>)}
          </select>
          <select
            aria-label="Filter by Day of Week"
            value={dayFilter}
            onChange={e => setDayFilter(e.target.value as DayOfWeek | 'all')}
            className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-10"
          >
            <option value="all">All Days</option>
            {DAY_OF_WEEK_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="flex items-center p-1 bg-dark-700 rounded-lg">
            <button onClick={() => setViewMode('card')} className={`${toggleButtonBaseClass} ${viewMode === 'card' ? toggleButtonActiveClass : toggleButtonInactiveClass}`} aria-label="Card View">
                <Icon className="text-xl">grid_view</Icon>
            </button>
            <button onClick={() => setViewMode('table')} className={`${toggleButtonBaseClass} ${viewMode === 'table' ? toggleButtonActiveClass : toggleButtonInactiveClass}`} aria-label="Table View">
                <Icon className="text-xl">list</Icon>
            </button>
        </div>
      </div>

      <div>
        {filteredNets.length === 0 ? (
           <div className="text-center py-20 px-4 border-2 border-dashed border-dark-700 rounded-lg">
              <h2 className="text-2xl font-bold text-dark-text-secondary">No NETs Found</h2>
              <p className="mt-2 text-dark-text-secondary">
                No NETs match the current filters. Try adjusting your selections.
              </p>
           </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNets.map(net => (
              <NetCard
                key={net.id}
                net={net}
                isActive={activeSessionNetIds.has(net.id)}
                profile={null}
                onViewDetails={() => onViewNetDetails(net.id)}
              />
            ))}
          </div>
        ) : (
          <NetTable 
            nets={filteredNets}
            activeSessionNetIds={activeSessionNetIds}
            onViewDetails={onViewNetDetails}
          />
        )}
      </div>
    </div>
  );
};

export default DirectoryScreen;