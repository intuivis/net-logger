

import React, { useMemo, useState } from 'react';
import { Net, NetSession, CheckIn, AwardedBadge, BadgeDefinition, Profile } from '../types';
import { Icon } from '../components/Icon';
import { Badge } from '../components/Badge';
import { NetTypeBadge } from '../components/NetTypeBadge';
import { formatTime, formatTimeZone } from '../lib/time';

interface CallSignProfileScreenProps {
  callsign: string;
  allNets: Net[];
  allSessions: NetSession[];
  allCheckIns: CheckIn[];
  allBadgeDefinitions: BadgeDefinition[];
  awardedBadges: AwardedBadge[];
  onViewSession: (sessionId: string) => void;
  onViewNetDetails: (netId: string) => void;
  onBack: () => void;
  isOwnProfile?: boolean;
  onNavigateToSettings?: () => void;
  profile?: Profile;
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

const CallSignProfileScreen: React.FC<CallSignProfileScreenProps> = ({
  callsign,
  allNets,
  allSessions,
  allCheckIns,
  allBadgeDefinitions,
  awardedBadges,
  onViewSession,
  onViewNetDetails,
  onBack,
  isOwnProfile = false,
  onNavigateToSettings,
  profile,
}) => {
  const [expandedNets, setExpandedNets] = useState<Record<string, boolean>>({});

  const operatorCheckIns = useMemo(
    () => allCheckIns
      .filter(ci => ci.call_sign === callsign)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [allCheckIns, callsign]
  );

  const operatorBadges = useMemo(() => {
    const earnedBadges = awardedBadges
        .filter(ab => ab.call_sign === callsign)
        .map(ab => allBadgeDefinitions.find(def => def.id === ab.badge_id))
        .filter((b): b is BadgeDefinition => !!b);

    const loyaltyBadges = earnedBadges.filter(b => b.category === 'Loyalty');
    const otherBadges = earnedBadges.filter(b => b.category !== 'Loyalty');

    if (loyaltyBadges.length > 0) {
        // Find the loyalty badge with the highest sortOrder
        const highestLoyaltyBadge = loyaltyBadges.sort((a, b) => b.sortOrder - a.sortOrder)[0];
        return [...otherBadges, highestLoyaltyBadge].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return otherBadges.sort((a, b) => a.name.localeCompare(b.name));
  }, [awardedBadges, callsign, allBadgeDefinitions]);
  
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

  const getLoyaltyBadgeForCount = (count: number): BadgeDefinition | null => {
    const loyaltyThresholds = [
      { id: 'platinum_member', threshold: 50 },
      { id: 'gold_member', threshold: 25 },
      { id: 'silver_member', threshold: 10 },
      { id: 'bronze_member', threshold: 5 },
    ];

    for (const { id, threshold } of loyaltyThresholds) {
      if (count >= threshold) {
        return allBadgeDefinitions.find(b => b.id === id) || null;
      }
    }
    return null;
  };

  const toggleNetExpansion = (netId: string) => {
    setExpandedNets(prev => ({ ...prev, [netId]: !prev[netId] }));
  };

  const firstCheckIn = operatorCheckIns[operatorCheckIns.length - 1];
  const lastCheckIn = operatorCheckIns[0];
  
  const displayName = (isOwnProfile && profile?.full_name) 
    ? profile.full_name 
    : (operatorCheckIns[0]?.name || 'Name not yet recorded');

  if (operatorCheckIns.length === 0 && !isOwnProfile) {
    return (
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{callsign}</h1>
        <p className="text-dark-text-secondary">This callsign has not checked into any nets yet.</p>
        <button onClick={onBack} className="mt-8 flex mx-auto items-center gap-2 text-md font-semibold text-dark-text-secondary hover:text-dark-text transition-colors">
          <Icon className="text-xl">arrow_back</Icon>
          <span>Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        {!isOwnProfile && (
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text transition-colors mb-4">
              <Icon className="text-xl">arrow_back</Icon>
              <span>Back</span>
            </button>
        )}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-4xl font-bold tracking-tight">{callsign}</h1>
                <p className="text-dark-text mt-1">{displayName}</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
                 {isOwnProfile && onNavigateToSettings && (
                    <button 
                        onClick={onNavigateToSettings} 
                        className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Account Settings"
                    >
                      <Icon className="text-2xl">settings</Icon>
                    </button>
                )}
                <a href={`https://www.qrz.com/db/${callsign}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg shadow-md hover:bg-brand-secondary transition-colors">
                    View on QRZ.com
                    <Icon className="text-base">open_in_new</Icon>
                </a>
            </div>
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
            <div className="flex flex-wrap items-center gap-4">
                {operatorBadges.map(badge => (
                    <Badge key={badge.id} badge={badge} variant="pill" />
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
                {detailedNetParticipation.map(({ net, checkInCount, sessions }) => {
                    const loyaltyBadge = getLoyaltyBadgeForCount(checkInCount);
                    let displayBadge: BadgeDefinition | null = loyaltyBadge;

                    if (!loyaltyBadge && checkInCount > 0) {
                      displayBadge = allBadgeDefinitions.find(b => b.id === 'first_checkin') || null;
                    }
                    
                    return (
                        <li key={net.id}>
                            <div className="p-6 hover:bg-dark-700/30 transition-colors">
                                <div className="flex justify-between items-center gap-4">
                                    {/* Left Side */}
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-x-2">
                                            <NetTypeBadge type={net.net_type} size="sm" />
                                            <button onClick={() => onViewNetDetails(net.id)} className="text-lg font-bold text-dark-text hover:text-brand-accent hover:underline truncate" title={net.name}>
                                                {net.name}
                                            </button>
                                        </div>
                                        <p className="text-sm text-dark-text mt-1">
                                            <Icon className="text-sm">calendar_month</Icon> {net.schedule} at {formatTime(net.time)} {formatTimeZone(net.time_zone)}
                                        </p>
                                    </div>

                                    {/* Right Side */}
                                    <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4">
                                        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                                            {displayBadge && (
                                                <>
                                                    {/* Mobile view: Icon only */}
                                                    <div className="block sm:hidden">
                                                        <Badge badge={displayBadge} variant="icon" />
                                                    </div>
                                                    {/* Desktop view: Pill */}
                                                    <div className="hidden sm:block">
                                                        <Badge badge={displayBadge} variant="pill" size="sm" />
                                                    </div>
                                                </>
                                            )}
                                            <span className="text-sm text-dark-text-secondary whitespace-nowrap">
                                                <span className="font-semibold text-dark-text">{checkInCount}</span> Check-in{checkInCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <button
                                            className="p-2 rounded-full hover:bg-dark-600"
                                            onClick={() => toggleNetExpansion(net.id)}
                                            aria-expanded={expandedNets[net.id]}
                                            aria-label={`Show sessions for ${net.name}`}
                                        >
                                            <Icon className="text-2xl text-dark-text-secondary transition-transform" style={{ transform: expandedNets[net.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</Icon>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {expandedNets[net.id] && (
                                <div className="border-t border-dark-700 bg-dark-700/30">
                                    <div className="divide-y divide-dark-600">
                                        {sessions.map(({ session, checkIn }) => (
                                            <div key={session.id} className="px-6 py-4">
                                                <div className="flex justify-between items-baseline gap-4 flex-wrap">
                                                    <button 
                                                        onClick={() => onViewSession(session.id)} 
                                                        className="text-sm font-semibold text-dark-text hover:text-brand-accent hover:underline focus:outline-none"
                                                        title={`View session from ${new Date(session.start_time).toLocaleDateString()}`}
                                                    >
                                                        {new Date(checkIn.timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </button>
                                                    <p className="text-sm text-dark-text-secondary flex-shrink-0">
                                                        {new Date(checkIn.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                {checkIn.notes && (
                                                    <p className="text-sm text-dark-text-secondary italic mt-2">"{checkIn.notes}"</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </li>
                    )
                })}
            </ul>
        ) : (
          <p className="text-dark-text-secondary text-center py-10">No check-in history found.</p>
        )}
      </div>
    </div>
  );
};

export default CallSignProfileScreen;