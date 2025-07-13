import React, { useState, useMemo } from 'react';
import { Net, NetSession, CheckIn, Profile, NetType } from '../types';
import { NetCard } from '../components/NetCard';
import { NET_TYPE_OPTIONS } from '../constants';
import { NetTable } from '../components/NetTable';
import { Icon } from '../components/Icon';

interface HomeScreenProps {
  activeSessions: NetSession[];
  nets: Net[];
  checkIns: CheckIn[];
  profile: Profile | null;
  onViewSession: (sessionId: string) => void;
  onViewNetDetails: (netId: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ activeSessions, nets, checkIns, onViewSession, onViewNetDetails, profile }) => {
  const activeSessionNetIds = new Set(activeSessions.map(s => s.net_id));

  const [directoryViewMode, setDirectoryViewMode] = useState<'card' | 'table'>('card');
  const [netTypeFilter, setNetTypeFilter] = useState<NetType | 'all'>('all');

  const filteredNets = useMemo(() => {
    return nets.filter(net => netTypeFilter === 'all' || net.net_type === netTypeFilter);
  }, [nets, netTypeFilter]);
  
  const toggleButtonBaseClass = "p-1.5 rounded-md transition-colors";
  const toggleButtonActiveClass = "bg-dark-800 text-dark-text";
  const toggleButtonInactiveClass = "text-dark-text-secondary hover:bg-dark-800/50 hover:text-dark-text";

  return (
    <div className="space-y-12">
      <div 
        className="relative rounded-xl p-8 md:p-12 lg:p-16 mb-8 overflow-hidden">
         <div className="text-center z-10 relative">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Amateur Radio Net Logger</h1>
            <p className="mt-4 max-w-3xl mx-auto text-lg text-dark-text-secondary">
                A command center for managing community radio communications. Coordinate NETs, track participation, and keep your community connected in real-time.
            </p>
         </div>
      </div>

      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Active NETs</h2>
          <p className="text-dark-text-secondary mt-1">
            {activeSessions.length > 0 ? 'Live sessions happening right now. Click to view!' : 'No nets are currently active.'}
          </p>
        </div>

        {activeSessions.length === 0 && profile ? (
          <div className="text-center py-20 px-4 border-2 border-dashed border-dark-700 rounded-lg">
            <h3 className="text-xl font-bold text-dark-text-secondary">No Active NETs</h3>
            <p className="mt-2 text-dark-text-secondary">There are currently no active net sessions.</p>
            <p className="mt-1 text-dark-text-secondary">Go to "Manage NETs" to start one.</p>
          </div>
        ) : activeSessions.length > 0 ? (
          <div className="space-y-4">
            {activeSessions.map((session) => {
              const net = nets.find(n => n.id === session.net_id);
              if (!net) return null;
              const sessionCheckIns = checkIns.filter(ci => ci.session_id === session.id);

              return (
                <button 
                  key={session.id}
                  onClick={() => onViewSession(session.id)}
                  className="w-full text-left bg-dark-800 p-5 rounded-lg shadow-lg hover:bg-dark-700/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-dark-900"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                      <h3 className="text-xl font-bold text-brand-accent">{net.name}</h3>
                      <p className="text-dark-text-secondary mt-1">
                        <span className="font-semibold text-dark-text">Net Control:</span> {session.primary_nco} ({session.primary_nco_callsign})
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:text-right">
                      <p className="font-semibold text-dark-text">{sessionCheckIns.length} Check-ins</p>
                      <p className="text-sm text-green-400 animate-pulse font-semibold">
                        Live
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div>
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">NET Directory</h2>
              <p className="text-dark-text-secondary mt-1">Browse all available NETs in the community.</p>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
              <select
                id="net-type-filter"
                aria-label="Filter by NET type"
                value={netTypeFilter}
                onChange={e => setNetTypeFilter(e.target.value as NetType | 'all')}
                className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-10"
              >
                <option value="all">All NET Types</option>
                {NET_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <div className="flex items-center p-1 bg-dark-700 rounded-lg">
                  <button onClick={() => setDirectoryViewMode('card')} className={`${toggleButtonBaseClass} ${directoryViewMode === 'card' ? toggleButtonActiveClass : toggleButtonInactiveClass}`} aria-label="Card View">
                      <Icon className="text-xl">grid_view</Icon>
                  </button>
                  <button onClick={() => setDirectoryViewMode('table')} className={`${toggleButtonBaseClass} ${directoryViewMode === 'table' ? toggleButtonActiveClass : toggleButtonInactiveClass}`} aria-label="Table View">
                      <Icon className="text-xl">list</Icon>
                  </button>
              </div>
            </div>
        </div>

        {filteredNets.length === 0 ? (
           <div className="text-center py-20 px-4 border-2 border-dashed border-dark-700 rounded-lg">
              <h2 className="text-2xl font-bold text-dark-text-secondary">No NETs Found</h2>
              <p className="mt-2 text-dark-text-secondary">
                {netTypeFilter === 'all'
                    ? 'No NETs have been configured in the system yet.'
                    : `No NETs match the filter "${netTypeFilter}".`
                }
              </p>
              {profile && netTypeFilter === 'all' && (
                <p className="mt-1 text-dark-text-secondary">Go to "Manage NETs" to create one.</p>
              )}
           </div>
        ) : directoryViewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNets.map(net => (
              <NetCard
                key={net.id}
                net={net}
                isActive={activeSessionNetIds.has(net.id)}
                profile={profile}
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

export default HomeScreen;