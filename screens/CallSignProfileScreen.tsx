
import React, { useMemo, useState } from 'react';
import { Net, NetSession, CheckIn, AwardedBadge, Badge as BadgeType } from '../types';
import { Icon } from '../components/Icon';
import { Badge } from '../components/Badge';
import { NetTypeBadge } from '../components/NetTypeBadge';
import { formatTime, formatTimeZone } from '../lib/time';

interface CallsignProfileScreenProps {
  callsign: string;
  allNets: Net[];
  allSessions: NetSession[];
  allCheckIns: CheckIn[];
  allBadges: BadgeType[];
  awardedBadges: AwardedBadge[];
  onViewSession: (sessionId: string) => void;
  onViewNetDetails: (netId: string) => void;
  onBack: () => void;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
  <div className="bg-dark-700/50 p-4 rounded-lg flex items-center gap-4">
    <div className="p-3 bg-brand-dark/20 rounded-full">
      <Icon className="text-brand-accent text-2xl">{icon}</Icon>
    </div>
    <div>
      <div className="text-sm text-dark-text-secondary">{label}</div>
      <div className="text-2xl font-bold text-dark-text">{value}</div>
    </div>
  </div>
);

const CallsignProfileScreen: React.FC<CallsignProfileScreenProps> = ({
  callsign,
  allNets,
  allSessions,
  allCheckIns,
  allBadges,
  awardedBadges,
  onViewSession,
  onViewNetDetails,
  onBack,
}) => {
  const [expandedNets, setExpandedNets] = useState<Record<string, boolean>>({});

  const operatorCheckIns = useMemo(
    () => allCheckIns
      .filter(ci => ci.call_sign === callsign)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [allCheckIns, callsign]
  );

  const operatorBadges = useMemo(
    () => awardedBadges
        .filter(ab => ab.call_sign === callsign)
        .map(ab => allBadges.find(b => b.id === ab.badge_id))
        .filter((b): b is BadgeType => !!b)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [awardedBadges, callsign, allBadges]
  );
  
  const sessionsById = useMemo(() => new Map(allSessions.map(s => [s.id, s])), [allSessions]);
  const netsById = useMemo(() => new Map(allNets.map(n => [n.id, n])), [allNets]);

  const detailedNetParticipation = useMemo(() => {
    const participationMap = new Map<string, { net: Net; sessions: Map<string, CheckIn> }>();

    for (const checkIn of operatorCheckIns) {
      const session = sessionsById.get(checkIn.session_id);
      if (!session) continue;

      const net = netsById.get(session.net_id);
      if (!net) continue;

      if (!participationMap.has(net.id)) {
        participationMap.set(net.id, {
          net: net,
          sessions: new Map<string, CheckIn>()
        });
      }
      participationMap.get(net.id)!.sessions.set(session.id, checkIn);
    }

    const result = Array.from(participationMap.values()).map(data => ({
      net: data.net,
      checkInCount: data.sessions.size,
      sessions: Array.from(data.sessions.entries()).map(([sessionId, checkIn]) => ({
        session: sessionsById.get(sessionId)!,
        checkIn: checkIn
      })).sort((a, b) => new Date(b.session.start_time).getTime() - new Date(a.session.start_time).getTime())
    }));
    
    return result.sort((a, b) => b.checkInCount - a.checkInCount);
  }, [operatorCheckIns, sessionsById, netsById]);

  const toggleNetExpansion = (netId: string) => {
    setExpandedNets(prev => ({ ...prev, [netId]: !prev[netId] }));
  };

  const firstCheckIn = operatorCheckIns[operatorCheckIns.length - 1];
  const lastCheckIn = operatorCheckIns[0];

  if (operatorCheckIns.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{callsign}</h1>
        <p className="text-dark-text-secondary">This callsign has not checked into any nets yet.</p>
        <button onClick={onBack} className="mt-8 flex mx-auto items-center gap-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text transition-colors">
          <Icon className="text-xl">arrow_back</Icon>
          <span>Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text transition-colors mb-4">
          <Icon className="text-xl">arrow_back</Icon>
          <span>Back</span>
        </button>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">{callsign}</h1>
                <p className="text-dark-text-secondary mt-1">{operatorCheckIns[0]?.name}</p>
            </div>
            <a href={`https://www.qrz.com/db/${callsign}`} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-dark-700 rounded-lg shadow-md hover:bg-dark-600 transition-colors">
                View on QRZ.com
                <Icon className="text-base">open_in_new</Icon>
            </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Check-ins" value={operatorCheckIns.length} icon="tag" />
        <StatCard label="First Check-in" value={firstCheckIn ? new Date(firstCheckIn.timestamp).toLocaleDateString() : 'N/A'} icon="event_available" />
        <StatCard label="Last Check-in" value={lastCheckIn ? new Date(lastCheckIn.timestamp).toLocaleDateString() : 'N/A'} icon="history" />
      </div>

      <div className="bg-dark-800 shadow-lg rounded-lg p-6">
        <h3 className="text-xl font-bold text-dark-text mb-4">Awarded Badges</h3>
        {operatorBadges.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-6">
                {operatorBadges.map(badge => (
                    <Badge key={badge.id} badge={badge} variant="profile" />
                ))}
            </div>
        ) : (
            <p className="text-dark-text-secondary">No badges earned yet.</p>
        )}
      </div>

      <div className="bg-dark-800 shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 border-b border-dark-700">
            <h3 className="text-xl font-bold text-dark-text">Check-In Activity</h3>
        </div>
        {detailedNetParticipation.length > 0 ? (
            <ul className="divide-y divide-dark-700">
                {detailedNetParticipation.map(({ net, checkInCount, sessions }) => (
                    <li key={net.id}>
                        <div className="p-6 hover:bg-dark-700/30 transition-colors">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-grow space-y-2">
                                    <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
                                        <button onClick={() => onViewNetDetails(net.id)} className="text-lg font-bold text-dark-text hover:text-brand-accent hover:underline">
                                            {net.name}
                                        </button>
                                        <NetTypeBadge type={net.net_type} />
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-dark-text-secondary">
                                        <span>
                                            <Icon className="text-base mr-1.5 align-middle">calendar_month</Icon>
                                            {net.schedule} at {formatTime(net.time)} {formatTimeZone(net.time_zone)}
                                        </span>
                                        <span>
                                            <Icon className="text-base mr-1.5 align-middle">tag</Icon>
                                            {checkInCount} check-in{checkInCount > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    className="flex-shrink-0 p-2 rounded-full hover:bg-dark-600"
                                    onClick={() => toggleNetExpansion(net.id)}
                                    aria-expanded={expandedNets[net.id]}
                                    aria-label={`Show sessions for ${net.name}`}
                                >
                                    <Icon className="text-2xl text-dark-text-secondary transition-transform" style={{ transform: expandedNets[net.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</Icon>
                                </button>
                            </div>
                        </div>
                        {expandedNets[net.id] && (
                            <div className="px-6 pb-4 pt-2 border-t border-dark-700 bg-dark-700/30">
                                <div className="mt-4 flow-root">
                                    <div className="-mx-6 -my-2">
                                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                            <div className="divide-y divide-dark-600">
                                                {sessions.map(({ session, checkIn }) => (
                                                    <div key={session.id} className="py-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
                                                        <div className="sm:col-span-2">
                                                            <button 
                                                                onClick={() => onViewSession(session.id)} 
                                                                className="text-sm font-semibold text-dark-text hover:text-brand-accent hover:underline focus:outline-none"
                                                                title={`View session from ${new Date(session.start_time).toLocaleDateString()}`}
                                                            >
                                                                {new Date(checkIn.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                            </button>
                                                        </div>
                                                        <div className="sm:col-span-1">
                                                            <p className="text-sm text-dark-text-secondary">
                                                                {new Date(checkIn.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            {checkIn.notes ? (
                                                                <p className="text-sm text-dark-text-secondary italic">"{checkIn.notes}"</p>
                                                            ) : (
                                                                <p className="text-sm text-dark-text-secondary/50">-</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        ) : (
          <p className="text-dark-text-secondary text-center py-10">No check-in history found.</p>
        )}
      </div>
    </div>
  );
};

export default CallsignProfileScreen;
