import React, { useState } from 'react';
import { Net, NetSession, CheckIn, Profile, NetConfigType } from '../types';
import { formatTime } from '../lib/time';
import { Icon } from '../components/Icon';

interface NetDetailScreenProps {
    net: Net;
    sessions: NetSession[];
    checkIns: CheckIn[];
    profile: Profile | null;
    onStartSession: () => void;
    onEndSession: (sessionId: string, netId: string) => void;
    onEditNet: () => void;
    onDeleteNet: () => void;
    onViewSession: (sessionId: string) => void;
    onBack: () => void;
    onDeleteSession: (sessionId: string) => void;
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

const NetDetailScreen: React.FC<NetDetailScreenProps> = ({ net, sessions, checkIns, profile, onStartSession, onEndSession, onEditNet, onDeleteNet, onViewSession, onBack, onDeleteSession }) => {
    const [isRepeaterListVisible, setIsRepeaterListVisible] = useState(false);
    const activeSession = sessions.find(s => s.end_time === null);
    const canManage = profile && (profile.role === 'admin' || net.created_by === profile.id);

    const handleEndSessionClick = () => {
        if (activeSession && window.confirm('Are you sure you want to end this net session?')) {
            onEndSession(activeSession.id, net.id);
        }
    };

    const renderConfigBadge = () => {
        switch (net.net_config_type) {
            case NetConfigType.LINKED_REPEATER:
                return (
                    <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300">
                        <Icon className="text-base">link</Icon>
                        <span>Linked System</span>
                    </div>
                );
            case NetConfigType.SINGLE_REPEATER:
                 return (
                    <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300">
                        <Icon className="text-base">cell_tower</Icon>
                        <span>Single Repeater</span>
                    </div>
                );
            case NetConfigType.GROUP:
                 return (
                    <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300">
                        <Icon className="text-base">wifi_tethering</Icon>
                        <span>Group/Simplex</span>
                    </div>
                );
            default: return null;
        }
    }

    const renderTechnicalDetails = () => {
        switch (net.net_config_type) {
            case NetConfigType.SINGLE_REPEATER:
                const repeater = net.repeaters[0];
                if (!repeater) return null;
                return (
                    <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                        <DetailItem label="Primary NCO" value={`${net.primary_nco} (${net.primary_nco_callsign})`} />
                        <DetailItem label="Repeater Name" value={repeater.name} />
                        <DetailItem label="Frequency" value={repeater.frequency ? `${repeater.frequency} MHz` : undefined} />
                        <DetailItem label="Tone" value={repeater.tone ? `${repeater.tone} Hz` : undefined} />
                        <DetailItem label="Offset" value={repeater.tone_offset && repeater.tone_offset !== 'none' ? repeater.tone_offset : undefined} />
                    </dl>
                );
            case NetConfigType.LINKED_REPEATER:
                return (
                    <>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                           <DetailItem label="Primary NCO" value={`${net.primary_nco} (${net.primary_nco_callsign})`} />
                        </dl>
                        <div className="border-t border-dark-700/50 my-4"></div>
                         <button 
                            className="flex justify-between items-center w-full text-left py-2"
                            onClick={() => setIsRepeaterListVisible(!isRepeaterListVisible)}
                            aria-expanded={isRepeaterListVisible}
                        >
                            <h3 className="text-md font-semibold text-dark-text-secondary uppercase tracking-wider">Linked Repeaters ({net.repeaters.length})</h3>
                            {isRepeaterListVisible ? <Icon className="text-xl">expand_less</Icon> : <Icon className="text-xl">expand_more</Icon>}
                        </button>
                        {isRepeaterListVisible && (
                             <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                                {net.repeaters.map(r => (
                                    <li key={r.id} className="text-sm text-dark-text">
                                        <span className="font-semibold">{r.name}:</span> {r.frequency}MHz, Tone: {r.tone_offset !== 'none' ? `${r.tone_offset === 'plus' ? '+' : '-'} ` : ''}{r.tone ? `${r.tone}Hz` : ''}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                );
             case NetConfigType.GROUP:
                return (
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6">
                        <DetailItem label="Primary NCO" value={`${net.primary_nco} (${net.primary_nco_callsign})`} />
                        <DetailItem label="Frequency" value={net.frequency ? `${net.frequency} MHz` : undefined} />
                        <DetailItem label="Band" value={net.band} />
                        <DetailItem label="Mode" value={net.mode} />
                    </dl>
                );
            default:
                return null;
        }
    }

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text transition-colors">
                <Icon className="text-xl">arrow_back</Icon>
                <span>Back to {profile ? 'NETs List' : 'NET Directory'}</span>
            </button>

            <div className="bg-dark-800 shadow-lg rounded-lg p-5 sm:p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                            <h1 className="text-3xl font-bold text-dark-text">{net.name}</h1>
                            {net.website_url && (
                                <a href={net.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-brand-secondary hover:text-brand-primary mt-2 sm:mt-0">
                                    <Icon className="text-base">open_in_new</Icon>
                                    <span>Visit Website</span>
                                </a>
                            )}
                        </div>
                         <div className="flex items-center gap-4 mt-2">
                            <p className="text-dark-text-secondary">
                                {net.net_type} Net &bull; Every {net.schedule} at {formatTime(net.time)} {net.time_zone}
                            </p>
                            {renderConfigBadge()}
                        </div>
                        {net.description && (
                            <p className="mt-4 text-dark-text-secondary max-w-2xl">{net.description}</p>
                        )}
                    </div>
                    {canManage && (
                        <div className="flex items-center gap-2 flex-shrink-0 mt-4 md:mt-0">
                            <button onClick={onEditNet} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors" aria-label="Edit NET">
                               <Icon className="text-xl">settings</Icon>
                            </button>
                            <button onClick={onDeleteNet} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors" aria-label="Delete NET">
                               <Icon className="text-xl">delete</Icon>
                            </button>
                            {activeSession ? (
                                <button
                                    onClick={handleEndSessionClick}
                                    className="flex items-center gap-2 ml-2 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    <Icon className="text-base">stop</Icon>
                                    End Session
                                </button>
                            ) : (
                                <button
                                    onClick={onStartSession}
                                    disabled={!!activeSession}
                                    className="flex items-center gap-2 ml-2 px-4 py-2 text-sm font-bold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                                >
                                    <Icon className="text-base">play_arrow</Icon>
                                    Start New Session
                                </button>
                            )}
                        </div>
                    )}
                </div>
                 
                <div className="mt-6 pt-4 border-t border-dark-700">
                    <h2 className="text-lg font-medium text-dark-text mb-4">Technical Details</h2>
                    {renderTechnicalDetails()}
                </div>
            </div>

            <div className="bg-dark-800 shadow-lg rounded-lg overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-dark-700">
                    <h3 className="text-xl font-bold text-dark-text">Session History</h3>
                    <p className="text-sm text-dark-text-secondary">Total Sessions: {sessions.length}</p>
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
                                   <div className="group flex items-center justify-between p-5 hover:bg-dark-700/30 transition-colors">
                                        <button onClick={() => onViewSession(session.id)} className="flex-grow text-left cursor-pointer focus:outline-none">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                                <div>
                                                    <p className="font-bold text-dark-text">{startTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                    <p className="text-sm text-dark-text-secondary">
                                                        Started at {startTime.toLocaleTimeString()} by {session.primary_nco_callsign}
                                                    </p>
                                                </div>
                                                <div className="text-right mt-2 sm:mt-0">
                                                    <p className="font-semibold text-dark-text">{sessionCheckIns.length} Check-ins</p>
                                                    <p className={`text-sm ${endTime ? 'text-dark-text-secondary' : 'text-green-400 animate-pulse'}`}>
                                                        {formatDuration(startTime, endTime)}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                        {canManage && (
                                            <div className="pl-4">
                                                <button 
                                                    onClick={() => onDeleteSession(session.id)}
                                                    className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                                    aria-label="Delete Session"
                                                >
                                                    <Icon className="text-xl">delete</Icon>
                                                </button>
                                            </div>
                                        )}
                                    </div>
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