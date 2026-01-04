

import React from 'react';
import { Net, NetSession, CheckIn, Profile, NetConfigType, Repeater, PermissionKey } from '../types';
import { formatTime, formatRepeaterCondensed, formatTimeZone, formatSchedule } from '../lib/time';
import { Icon } from '../components/Icon';
import { NetTypeBadge } from '../components/NetTypeBadge';
import { NetActivityChart } from '../components/NetActivityChart';
import Button from '../components/Button';

interface NetDetailScreenProps {
    net: Net;
    sessions: NetSession[];
    checkIns: CheckIn[];
    profile: Profile | null;
    hasPermission: (net: Net, permission: PermissionKey) => boolean;
    onStartSession: () => void;
    onEndSessionRequest: (sessionId: string, netId: string) => void;
    onEditNet: () => void;
    onDeleteNet: () => void;
    onViewSession: (sessionId: string) => void;
    onBack: () => void;
    onVerifyPasscodeRequest: () => void;
    onEditRoster: () => void;
}

const formatDuration = (start: Date, end: Date | null): string => {
    if (!end) return 'Active';
    const diffMs = end.getTime() - start.getTime();
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
}

const DetailItem: React.FC<{label: string, value: string | null | undefined}> = ({ label, value }) => (
    <div>
        <dt className="text-sm font-medium text-dark-text-secondary">{label}</dt>
        <dd className="mt-1 text-sm text-dark-text font-semibold">{value || '-'}</dd>
    </div>
);

const RepeaterDetails: React.FC<{repeater: Repeater}> = ({repeater}) => (
    <div className="bg-dark-700/50 p-4 rounded-lg">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
                <dt className="text-sm font-medium text-dark-text-secondary">Repeater</dt>
                <dd className="mt-1 text-md text-dark-text font-semibold">{repeater.name} {repeater.owner_callsign ? `(${repeater.owner_callsign})` : ''}</dd>
            </div>
            <div>
                <dt className="text-sm font-medium text-dark-text-secondary">Location</dt>
                <dd className="mt-1 text-md text-dark-text font-semibold">
                    {repeater.county && <span>{repeater.county}</span>}
                    {repeater.county && repeater.grid_square && ', '}
                    {repeater.grid_square && <span>{repeater.grid_square}</span>}
                </dd>
            </div>
            <div>
                <dt className="text-sm font-medium text-dark-text-secondary">Frequency &amp; Offset</dt>
                <dd className="mt-1 text-md text-dark-text font-semibold">{repeater.downlink_freq ? `${repeater.downlink_freq} MHz` : '-'} {repeater.offset ? `(${repeater.offset} MHz)` : ''}</dd>
            </div>
             <div>
                <dt className="text-sm font-medium text-dark-text-secondary">Tones (Uplink / Downlink)</dt>
                <dd className="mt-1 text-md text-dark-text font-semibold">{repeater.uplink_tone || '-'} / {repeater.downlink_tone || '-'}</dd>
            </div>
            {repeater.website_url && (
                <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-dark-text-secondary">Website</dt>
                    <dd className="mt-1">
                        <a href={repeater.website_url} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:underline break-all">
                            {repeater.website_url}
                        </a>
                    </dd>
                </div>
            )}
        </dl>
    </div>
);


const NetDetailScreen: React.FC<NetDetailScreenProps> = ({ net, sessions, checkIns, profile, hasPermission, onStartSession, onEndSessionRequest, onEditNet, onDeleteNet, onViewSession, onBack, onVerifyPasscodeRequest, onEditRoster }) => {
    const [isRepeaterListVisible, setIsRepeaterListVisible] = React.useState(false);
    const activeSession = sessions.find(s => s.end_time === null);
    
    const canEditNet = hasPermission(net, 'editNet');
    const canManageSessions = hasPermission(net, 'manageSessions');
    const isOwnerOrAdmin = profile && (profile.role === 'admin' || net.created_by === profile.id);

    const handleEndSessionClick = () => {
        if (activeSession) {
            onEndSessionRequest(activeSession.id, net.id);
        }
    };

    const renderTechnicalDetails = () => {
        switch (net.net_config_type) {
            case NetConfigType.SINGLE_REPEATER:
                const repeater = net.repeaters[0];
                if (!repeater) return null;
                return (
                    <div className="space-y-4">
                        <RepeaterDetails repeater={repeater} />
                    </div>
                );
            case NetConfigType.LINKED_REPEATER:
                return (
                    <>
                         <button 
                            className="flex justify-between items-center w-full text-left py-2"
                            onClick={() => setIsRepeaterListVisible(!isRepeaterListVisible)}
                            aria-expanded={isRepeaterListVisible}
                        >
                            <h3 className="text-md font-semibold text-dark-text uppercase tracking-wider">Linked Repeaters ({net.repeaters.length})</h3>
                            {isRepeaterListVisible ? <Icon className="text-xl">expand_less</Icon> : <Icon className="text-xl">expand_more</Icon>}
                        </button>
                        {isRepeaterListVisible && (
                             <ul className="mt-2 space-y-2">
                                {net.repeaters.map(r => (
                                    <li key={r.id} className="text-sm text-dark-text-secondary bg-dark-700/30 p-3 rounded-md flex items-center justify-between">
                                        <span>{formatRepeaterCondensed(r)}</span>
                                        {r.website_url && (
                                            <a href={r.website_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:text-brand-accent rounded-full hover:bg-white/10" aria-label={`Visit website for ${r.name}`}>
                                                <Icon className="text-base">open_in_new</Icon>
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                );
             case NetConfigType.GROUP:
                return (
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-10">
                        <DetailItem label="Net Control" value={`${net.primary_nco} (${net.primary_nco_callsign})`} />
                        <DetailItem label="Frequency" value={net.frequency ? `${net.frequency} MHz` : undefined} />
                        <DetailItem label="Band" value={net.band} />
                        <DetailItem label="Mode" value={net.mode} />
                    </dl>
                );
            default:
                return null;
        }
    }
    
    const showManagementButtons = canEditNet || canManageSessions || (profile && !isOwnerOrAdmin && net.passcode);

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-md font-semibold text-dark-text-secondary hover:text-dark-text transition-colors">
                <Icon className="text-xl">arrow_back</Icon>
                <span>Back to {profile ? 'NETs List' : 'NET Directory'}</span>
            </button>

            <div className="bg-dark-800 shadow-lg rounded-lg p-5 sm:p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                            <h1 className="text-3xl font-bold text-dark-text">{net.name}</h1>
                             {/* Responsive Badge */}
                            <div className="block sm:hidden">
                                <NetTypeBadge type={net.net_type} size="sm" />
                            </div>
                            <div className="hidden sm:block">
                                <NetTypeBadge type={net.net_type} size="base" />
                            </div>
                        </div>
                         <div className="flex items-center gap-4 mt-2">
                            <p className="font-bold text-dark-text">
                                {net.primary_nco} ({net.primary_nco_callsign}) &bull; {formatSchedule(net.schedule)} at {formatTime(net.time)} {formatTimeZone(net.time_zone)}
                            </p>
                        </div>
                        {net.description && (
                            <p className="mt-4 text-dark-text-secondary max-w-3xl">{net.description}</p>
                        )}
                        {net.website_url && (
                            <a href={net.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-medium text-sm text-dark-text-secondary text-dark-text mt-3 sm:mt-1">
                                <span>Visit Website</span><Icon className="text-dark-text text-sm">open_in_new</Icon>
                            </a>
                        )}
                    </div>
                    {showManagementButtons && (
                        <div className="flex items-center gap-2 flex-shrink-0 mt-4 md:mt-0">
                            {profile && !isOwnerOrAdmin && net.passcode && (
                                <Button onClick={onVerifyPasscodeRequest} variant="secondary" aria-label="Use Passcode">
                                    <Icon className="text-xl">key</Icon>
                                    Use Passcode
                                </Button>
                            )}
                            <div className="flex items-center gap-1">
                                {canEditNet && (
                                <button onClick={onEditRoster} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors" aria-label="Edit Roster">
                                    <Icon className="text-xl">groups</Icon>
                                </button>
                                )}
                                {canEditNet && <button onClick={onEditNet} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors" aria-label="Edit NET">
                                <Icon className="text-xl">settings</Icon>
                                </button>}
                                {isOwnerOrAdmin && <button onClick={onDeleteNet} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors" aria-label="Delete NET">
                                <Icon className="text-xl">delete</Icon>
                                </button>}
                            </div>
                            {canManageSessions && (
                                activeSession ? (
                                    <Button
                                        onClick={handleEndSessionClick}
                                        variant="destructive"
                                        className="ml-2"
                                    >
                                        <Icon className="text-base">stop</Icon>
                                        End Session
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={onStartSession}
                                        disabled={!!activeSession}
                                        variant="success"
                                        className="ml-2"
                                    >
                                        <Icon className="text-base">play_arrow</Icon>
                                        Start New Session
                                    </Button>
                                )
                            )}
                        </div>
                    )}
                </div>
                 
                <div className="mt-6 pt-4 border-t border-dark-700">
                    {renderTechnicalDetails()}
                </div>
            </div>

            <NetActivityChart sessions={sessions} checkIns={checkIns} />

            <div className="bg-dark-800 shadow-lg rounded-lg overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-dark-700">
                    <h3 className="text-xl font-bold text-dark-text">Session History</h3>
                    <p className="text-sm text-dark-text-secondary">Review past sessions for this NET.</p>
                </div>
                
                {sessions.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <h2 className="text-lg font-semibold text-dark-text-secondary">No Sessions Logged</h2>
                        <p className="mt-1 text-dark-text-secondary">Start a new session to begin logging check-ins.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-dark-700">
                        {sessions.map(session => {
                            const sessionCheckIns = checkIns.filter(ci => ci.session_id === session.id);
                            const startTime = new Date(session.start_time);
                            const endTime = session.end_time ? new Date(session.end_time) : null;
                            
                            return (
                                <li key={session.id}>
                                   <button onClick={() => onViewSession(session.id)} className="w-full text-left p-5 hover:bg-dark-700/30 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary">
                                        <div className="flex w-full items-start justify-between gap-4">
                                            {/* Left Side */}
                                            <div className="text-left flex-shrink-0">
                                                <p className="font-bold text-dark-text">
                                                    <span className="hidden sm:inline">
                                                        {startTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                    <span className="sm:hidden">
                                                        {startTime.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                </p>
                                                <p className="text-sm text-dark-text-secondary">
                                                    Started at {startTime.toLocaleTimeString()} by {session.primary_nco_callsign}
                                                </p>
                                            </div>
                                            {/* Right Side */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-semibold text-dark-text">{sessionCheckIns.length} Check-ins</p>
                                                <p className={`text-sm ${endTime ? 'text-dark-text-secondary' : 'text-green-400 animate-pulse'}`}>
                                                    {formatDuration(startTime, endTime)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default NetDetailScreen;
