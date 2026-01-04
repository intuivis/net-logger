

import React from 'react';
import { Net, NetSession, CheckIn, Profile, View } from '../types';
import { Icon } from './Icon';
import Button from './Button';

interface LiveNetsSectionProps {
  activeSessions: NetSession[];
  nets: Net[];
  checkIns: CheckIn[];
  onViewSession: (sessionId: string) => void;
  profile: Profile | null;
  onSetView: (view: View) => void;
}

const LiveNetsSection: React.FC<LiveNetsSectionProps> = ({ activeSessions, nets, checkIns, onViewSession, profile, onSetView }) => {


  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Live Nets</h2>
        <p className="text-dark-text-secondary mt-1">
          {activeSessions.length > 0 ? 'Live sessions happening right now.' : 'No nets are currently active.'}
        </p>
      </div>

      {activeSessions.length === 0 ? (
        <div className="text-center py-12 px-4 border-2 border-dashed border-dark-700 rounded-lg">
          <Icon className="text-5xl text-dark-text-secondary mx-auto">podcasts</Icon>
          <h3 className="mt-4 text-xl font-bold text-dark-text-secondary">All Quiet on the Airwaves</h3>
          <p className="mt-2 text-dark-text-secondary">There are currently no active Nets in session.</p>
          {profile && (profile.role === 'admin' || profile.is_approved) && (
              <p className="mt-1 text-dark-text-secondary">Go to "Manage Nets" to start one.</p>
          )}
        <Button size="lg" onClick={() => onSetView({ type: 'directory' })} className="mt-8">
        <span>View Net Directory</span>
        </Button>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default LiveNetsSection;
