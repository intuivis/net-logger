
import React, { useMemo } from 'react';
import { Net, NetSession, CheckIn, AwardedBadge, Repeater } from '../types';
import { Icon } from '../components/Icon';
import { Badge } from '../components/Badge';
import { getBadgeById } from '../lib/badges';

interface CallsignProfileScreenProps {
  callsign: string;
  allNets: Net[];
  allSessions: NetSession[];
  allCheckIns: CheckIn[];
  awardedBadges: AwardedBadge[];
  onViewSession: (sessionId: string) => void;
  onBack: () => void;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: string }> = ({ label, value, icon }) => (
  <div className="bg-dark-700/50 p-4 rounded-lg flex items-center gap-4">
    <div className="p-3 bg-brand-primary/20 rounded-full">
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
  awardedBadges,
  onViewSession,
  onBack,
}) => {
  const operatorCheckIns = useMemo(
    () => allCheckIns
      .filter(ci => ci.call_sign === callsign)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [allCheckIns, callsign]
  );

  const operatorBadges = useMemo(
    () => awardedBadges
        .filter(ab => ab.call_sign === callsign)
        .map(ab => getBadgeById(ab.badge_id))
        .filter((b): b is Exclude<typeof b, undefined> => !!b)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [awardedBadges, callsign]
  );
  
  const sessionsById = useMemo(() => new Map(allSessions.map(s => [s.id, s])), [allSessions]);
  const netsById = useMemo(() => new Map(allNets.map(n => [n.id, n])), [allNets]);

  const netParticipation = useMemo(() => {
    const counts = new Map<string, number>();
    
    operatorCheckIns.forEach(checkIn => {
        const session = sessionsById.get(checkIn.session_id);
        if (session) {
            const netId = session.net_id;
            counts.set(netId, (counts.get(netId) || 0) + 1);
        }
    });

    const participation = Array.from(counts.entries()).map(([netId, count]) => {
        const net = netsById.get(netId);
        return {
            net,
            count
        };
    }).filter((item): item is { net: Net, count: number } => item.net !== undefined);
    
    return participation.sort((a, b) => b.count - a.count);

  }, [operatorCheckIns, sessionsById, netsById]);

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
        <h3 className="text-xl font-bold text-dark-text mb-4">Awarded Badges ({operatorBadges.length})</h3>
        {operatorBadges.length > 0 ? (
            <div className="flex flex-wrap gap-4">
                {operatorBadges.map(badge => (
                    <Badge key={badge.id} badge={badge} />
                ))}
            </div>
        ) : (
            <p className="text-dark-text-secondary">No badges earned yet.</p>
        )}
      </div>

      <div className="bg-dark-800 shadow-lg rounded-lg p-6">
        <h3 className="text-xl font-bold text-dark-text mb-4">NET Participation ({netParticipation.length})</h3>
        {netParticipation.length > 0 ? (
          <ul className="space-y-3">
            {netParticipation.map(({ net, count }) => (
              <li key={net.id} className="flex justify-between items-center bg-dark-700/50 p-3 rounded-md">
                <span className="text-dark-text font-semibold">{net.name}</span>
                <span className="text-sm text-dark-text-secondary font-mono bg-dark-900/50 px-2 py-0.5 rounded">{count} check-in{count > 1 ? 's' : ''}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-dark-text-secondary">No NET-specific check-ins logged.</p>
        )}
      </div>

      <div className="bg-dark-800 shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 border-b border-dark-700">
          <h3 className="text-xl font-bold text-dark-text">Check-in History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-dark-700/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">NET Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">NCO</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {operatorCheckIns.map(checkIn => {
                const session = sessionsById.get(checkIn.session_id);
                const net = session ? netsById.get(session.net_id) : null;
                return (
                  <tr key={checkIn.id} className="hover:bg-dark-700/30">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{new Date(checkIn.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-dark-text">
                      <button onClick={() => onViewSession(checkIn.session_id)} className="hover:underline" title="View Session Log">
                        {net?.name || 'Unknown Net'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{session?.primary_nco_callsign || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary truncate max-w-xs" title={checkIn.notes || ''}>{checkIn.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CallsignProfileScreen;
