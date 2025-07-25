

import React from 'react';
import { Net, NetSession, Profile, PermissionKey, RosterMember } from '../types';
import { NetCard } from '../components/NetCard';
import { Icon } from '../components/Icon';

interface ManageNetsScreenProps {
  nets: Net[];
  sessions: NetSession[];
  rosterMembers: RosterMember[];
  profile: Profile | null;
  hasPermission: (net: Net, permission: PermissionKey) => boolean;
  onStartSession: (netId: string) => void;
  onEditNet: (netId: string) => void;
  onDeleteNet: (netId: string) => void;
  onAddNet: () => void;
  onViewDetails: (netId: string) => void;
  onEditRoster: (netId: string) => void;
}

const ManageNetsScreen: React.FC<ManageNetsScreenProps> = ({
  nets,
  sessions,
  rosterMembers,
  profile,
  hasPermission,
  onStartSession,
  onEditNet,
  onDeleteNet,
  onAddNet,
  onViewDetails,
  onEditRoster,
}) => {
  const activeSessionNetIds = new Set(sessions.filter(s => s.end_time === null).map(s => s.net_id));
  
  // Admins and approved NCOs can create nets.
  const canCreateNet = profile?.role === 'admin' || profile?.is_approved;

  const AddNetButton = () => (
     <button
        onClick={onAddNet}
        disabled={!canCreateNet}
        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg shadow-md hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-dark-900 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        title={canCreateNet ? "Create a new NET" : "Your account must be approved to create a NET."}
      >
        <Icon className="text-xl">add</Icon>
        <span>Create NET</span>
      </button>
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage NETs
          </h1>
          <p className="text-dark-text-secondary mt-1">
            Create, edit, and start sessions for NETs you own or have been given permission to manage.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {canCreateNet && <AddNetButton />}
        </div>
      </div>
      
      {nets.length === 0 ? (
        <div className="text-center py-16 px-4 border-2 border-dashed border-dark-700 rounded-lg">
            <h2 className="text-xl font-semibold text-dark-text-secondary">No NETs Found</h2>
            <p className="mt-2 text-dark-text-secondary">You don't own or have permission to manage any NETs. Get started by creating one!</p>
            <div className="mt-6 flex justify-center">
              <AddNetButton />
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nets.map((net) => {
            const hasRoster = rosterMembers.some(rm => rm.net_id === net.id);
            return (
              <NetCard
                key={net.id}
                net={net}
                sessionCount={sessions.filter(s => s.net_id === net.id).length}
                isActive={activeSessionNetIds.has(net.id)}
                profile={profile}
                canStartSession={hasPermission(net, 'manageSessions')}
                canEditNet={hasPermission(net, 'editNet')}
                isOwnerOrAdmin={profile?.role === 'admin' || net.created_by === profile?.id}
                hasRoster={hasRoster}
                onStartSession={() => onStartSession(net.id)}
                onEditNet={() => onEditNet(net.id)}
                onDeleteNet={() => onDeleteNet(net.id)}
                onViewDetails={() => onViewDetails(net.id)}
                onEditRoster={() => onEditRoster(net.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageNetsScreen;