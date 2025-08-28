/**
 * SessionScreen.tsx
 * 
 * This is the primary screen for managing a live NET session. It displays
 * the check-in form, the log of checked-in users, and session details. It
 * handles real-time updates for check-ins and session status.
 */
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import { Net, NetSession, CheckIn, Profile, NetConfigType, AwardedBadge, Badge as BadgeType, Repeater, PermissionKey, RosterMember, CheckInInsertPayload, CheckInStatus, CheckInStatusValue, DayOfWeek, PasscodePermissions, NetType, Schedule } from '../types';
import { Icon } from '../components/Icon';
import { formatRepeaterCondensed } from '../lib/time';
import { supabase } from '../lib/supabaseClient';
import { Badge } from '../components/Badge';
// import { Database } from '../database.types';
import { NCOBadge } from '../components/NCOBadge';
// import JoinNetModal from '../components/JoinNetModal';

// --- PROPS INTERFACE ---
interface SessionScreenProps {
  sessionId: string;
  allNets: Net[];
  allSessions: NetSession[];
  allCheckIns: CheckIn[];
  allBadges: BadgeType[];
  awardedBadges: AwardedBadge[];
  rosterMembers: RosterMember[];
  profile: Profile | null;
  hasPermission: (permission: PermissionKey) => boolean;
  onEndSessionRequest: (sessionId: string, netId: string) => void;
  onAddCheckIn: (sessionId: string, netId: string, checkIn: CheckInInsertPayload) => Promise<void>;
  onEditCheckIn: (sessionId: string, checkIn: CheckIn) => void;
  onUpdateCheckInStatus: (checkIn: CheckIn, netId: string, status: CheckInStatusValue) => Promise<void>;
  onBack: () => void;
  onUpdateSessionNotes: (sessionId: string, notes: string) => Promise<void>;
  onViewCallsignProfile: (callsign: string) => void;
  showAlert: (title: string, message: string) => void;
  handleApiError: (error: any, context?: string) => void;
  onDeleteCheckInRequest: (checkIn: CheckIn) => void;
  onDeleteSession: (sessionId: string, netId: string) => void;
}

// --- SUB-COMPONENTS ---


// The main form for adding new check-ins.
const CheckInForm: React.FC<{
    net: Net,
    onSubmit: (data: CheckInInsertPayload) => Promise<void>,
    isSubmitting: boolean,
    repeaterId: string,
    setRepeaterId: React.Dispatch<React.SetStateAction<string>>
}> = React.memo(({ net, onSubmit, isSubmitting, repeaterId, setRepeaterId }) => {
    const [callSign, setCallSign] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');

    // This effect provides a UX enhancement by automatically looking up the name
    // associated with a callsign from a public database table after the user
    // stops typing for 300ms.
    useEffect(() => {
        const lookup = async () => {
            const trimmedCallsign = callSign.trim().toUpperCase();
            if (trimmedCallsign.length < 3) return;

            const { data, error } = await supabase
                .from('callsigns')
                .select('first_name, last_name')
                .eq('callsign', trimmedCallsign)
                .order('license_id', { ascending: false })
                .limit(1)
                .maybeSingle();
            
            if (error) {
                console.error(error);
                return;
            }

            if (data) {
                const typedData = data as unknown as { first_name: string | null; last_name: string | null; };
                setName(`${typedData.first_name || ''} ${typedData.last_name || ''}`.trim());
            }
        };
        const timer = setTimeout(lookup, 300);
        return () => clearTimeout(timer);
    }, [callSign]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const checkInData: CheckInInsertPayload = {
            call_sign: callSign,
            name,
            location,
            notes,
            repeater_id: repeaterId !== '' ? repeaterId : null,
        };
        try {
            await onSubmit(checkInData);
            // Clear form ONLY on successful submission. If there's an error (like a duplicate),
            // the data remains in the form for the user to correct.
            setCallSign('');
            setName('');
            setLocation('');
            setNotes('');
            // Do NOT reset repeaterId here; it will persist until user changes it
            document.getElementById('callSign')?.focus();
        } catch (error) {
            // Error is handled by the parent component (which shows the alert).
            // We catch it here simply to prevent the form-clearing logic from running on failure.
        }
    };
    
    // Dynamically adjust the form layout based on whether the repeater dropdown is present.
    const isLinkedRepeaterNet = net.net_config_type === NetConfigType.LINKED_REPEATER;
    const gridColsClass = isLinkedRepeaterNet ? 'lg:grid-cols-6' : 'lg:grid-cols-5';


    return (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-dark-800 shadow-lg rounded-lg">
            <div className={`grid grid-cols-1 md:grid-cols-2 ${gridColsClass} gap-4 items-end`}>
                {/* Conditionally render the repeater dropdown only for linked repeater systems. */}
                {isLinkedRepeaterNet && (
                <div className="lg:col-span-1">
                    <FormSelect
                        label="Repeater"
                        id="repeater_id"
                        name="repeater_id"
                        value={repeaterId ?? ''}
                        onChange={(e) => setRepeaterId(e.target.value !== '' ? e.target.value : '')}
                        required={false}
                    >
                        <option value="">Select Repeater...</option>
                        {net.repeaters.map(r => (
                            <option key={r.id} value={r.id}>
                                {formatRepeaterCondensed(r)}
                            </option>
                        ))}
                    </FormSelect>
                </div>
                )}
                <div className="lg:col-span-1">
                    <FormInput label="Call Sign" id="callSign" value={callSign} onChange={e => setCallSign(e.target.value.toUpperCase())} required />
                </div>
                <div className="lg:col-span-1">
                    <FormInput label="Name" id="name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="lg:col-span-1">
                    <FormInput label="Location" id="location" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
                
                <div className="lg:col-span-2">
                    <div className="flex items-end gap-2">
                        <div className="flex-grow">
                            <FormInput label="Notes" id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="flex-shrink-0 px-4 py-2 h-11 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-dark-800 disabled:bg-gray-500 disabled:cursor-wait">
                            {isSubmitting ? 'Checking In...' : 'Check In'}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
});

// --- HELPER FUNCTIONS ---

// Ensures callsigns are consistently formatted for comparisons.
const normalizeCallsign = (callsign: string | null | undefined): string => (callsign || '').trim().toUpperCase();

// Returns CSS classes and icon names based on a check-in's status flag.
const getStatusStyles = (status: CheckInStatusValue) => {
    switch (status) {
        case CheckInStatus.ACKNOWLEDGED: return { row: '', callsign: 'text-brand-accent', icon: 'text-brand-accent' };
        case CheckInStatus.ATTENTION: return { row: 'bg-yellow-500/10', callsign: '', icon: 'text-yellow-400' };
        case CheckInStatus.QUESTION: return { row: 'bg-blue-500/10', callsign: '', icon: 'text-blue-400' };
        case CheckInStatus.NEW:
        default: return { row: 'text-dark-text-secondary', callsign: '', icon: 'text-dark-text-secondary' };
    }
};

const getStatusIcon = (status: CheckInStatusValue): string => {
    switch (status) {
        case CheckInStatus.ACKNOWLEDGED: return 'check_box';
        case CheckInStatus.ATTENTION: return 'asterisk';
        case CheckInStatus.QUESTION: return 'help_outline';
        case CheckInStatus.NEW:
        default: return 'check_box_outline_blank';
    }
};

// --- MAIN COMPONENT ---

const SessionScreen: React.FC<SessionScreenProps> = ({ sessionId, allNets, allSessions, allCheckIns, allBadges, rosterMembers, onAddCheckIn, onEditCheckIn, onUpdateCheckInStatus, onUpdateSessionNotes, ...props }) => {
    // --- STATE MANAGEMENT ---
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<NetSession | null>(null);
    const [net, setNet] = useState<Net | null>(null);
    const [sessionNotes, setSessionNotes] = useState('');
    const [activeTab, setActiveTab] = useState<'log' | 'roster'>('log');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditingEndedSession, setIsEditingEndedSession] = useState(false);
    const [repeaterId, setRepeaterId] = useState<string>('');
    const menuRef = useRef<HTMLDivElement>(null);
    const notesInitialized = useRef(false);

    // --- DERIVED STATE & CONSTANTS (using useMemo for performance) ---
    const sessionCheckIns = useMemo(() => allCheckIns.filter(ci => ci.session_id === sessionId), [allCheckIns, sessionId]);
    const isActive = useMemo(() => session?.end_time === null, [session]);
    const canLogContacts = props.hasPermission('logContacts');
    const canManageSessions = props.hasPermission('manageSessions');
    const canDeleteSessions = props.hasPermission('deleteSessions');

    const isOwnerOrAdmin = useMemo(() => {
        if (!props.profile || !net) return false;
        return props.profile.role === 'admin' || net.created_by === props.profile.id;
    }, [props.profile, net]);

    const hasEditPermissions = useMemo(() => {
        if (isActive) {
            return canLogContacts;
        }
        if (isEditingEndedSession) {
            return isOwnerOrAdmin;
        }
        return false;
    }, [isActive, isEditingEndedSession, canLogContacts, isOwnerOrAdmin]);

    const showTabs = hasEditPermissions && rosterMembers.length > 0;
    const checkedInCallsigns = useMemo(() => new Set(sessionCheckIns.map(ci => normalizeCallsign(ci.call_sign))), [sessionCheckIns]);

    // --- SIDE EFFECTS (useEffect) ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Effect to find the current session and net from the global state passed via props.
    // This is the primary data loading logic for this component.
    useEffect(() => {
        const currentSession = allSessions.find(s => s.id === sessionId);
        const currentNet = currentSession ? allNets.find(n => n.id === currentSession.net_id) : null;

        // A simple check to see if the main app has loaded data yet.
        const parentDataIsLoaded = allNets.length > 0 || allSessions.length > 0;

        if (currentSession && currentNet) {
            setSession(currentSession);
            setNet(currentNet);
            if (!notesInitialized.current) {
                setSessionNotes(currentSession.notes || '');
                notesInitialized.current = true;
            }
            setLoading(false);
        } else if (parentDataIsLoaded) {
            // Data is loaded, but we couldn't find this session. It's likely deleted.
            // Stop loading so the component can render the "not found" message.
            setLoading(false);
        } else {
            // Parent data is not yet loaded, so we should continue to show loading state.
            setLoading(true);
        }
    }, [sessionId, allNets, allSessions]);

    // Effect for auto-saving session notes after a delay.
    useEffect(() => {
        if (loading || !hasEditPermissions || sessionNotes === (session?.notes || '')) {
            return;
        }
        const handler = setTimeout(() => {
            onUpdateSessionNotes(sessionId, sessionNotes);
        }, 1500);
        return () => clearTimeout(handler);
    }, [sessionNotes, sessionId, session, onUpdateSessionNotes, loading, hasEditPermissions]);
    
    // Effect to handle tab state when roster availability changes.
    useEffect(() => {
        if (activeTab === 'roster' && !showTabs) {
            setActiveTab('log');
        }
    }, [showTabs, activeTab]);

    // Effect for the session-specific real-time subscription.
    // This is separated to prevent re-subscribing on every data change.
    useEffect(() => {
        const sessionChannel = supabase.channel(`session-object-${sessionId}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}`}, (payload) => {
                const updatedSession = payload.new as NetSession;
                // The global state in App.tsx will also get this update, but updating
                // the local state provides a slightly faster UI response.
                setSession(prev => prev ? { ...prev, ...updatedSession } : updatedSession);
            })
            .subscribe();

        return () => { supabase.removeChannel(sessionChannel); };
    }, [sessionId]);

    // Effect to update the document title.
    useEffect(() => {
        if (net) {
            document.title = `Session: ${net.name} | NetControl`;
        } else {
            document.title = 'Session | NetControl';
        }
        return () => {
            document.title = 'Amateur Radio Net Logger';
        };
    }, [net]);


    // --- EVENT HANDLERS ---

    const handleAddCheckIn = useCallback(async (checkInData: CheckInInsertPayload) => {
        if (isSubmitting || !net) return;
        setIsSubmitting(true);
        try {
            await onAddCheckIn(sessionId, net.id, checkInData);
        } catch (error) {
            // The parent (App.tsx) handles the error alert and reverts the optimistic UI.
            // Re-throw to inform the form that submission failed.
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, net, sessionId, onAddCheckIn]);
    
    const handleStatusClick = useCallback(async (checkIn: CheckIn) => {
        if (!net || !hasEditPermissions || checkIn.isOptimistic) return;
        const currentStatus = checkIn.status_flag;
        const nextStatus = ((currentStatus + 1) % 4) as CheckInStatusValue;
        onUpdateCheckInStatus(checkIn, net.id, nextStatus);
    }, [net, hasEditPermissions, onUpdateCheckInStatus]);

    const handleDeleteCheckIn = (checkIn: CheckIn) => {
        if (!net) return;
        props.onDeleteCheckInRequest(checkIn);
    };
    

    // --- RENDER LOGIC ---
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-dark-text-secondary space-y-6" aria-live="polite" aria-busy="true">
                <div className="flex justify-center items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-300 animate-bouncedelay [animation-delay:-0.32s]"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300 animate-bouncedelay [animation-delay:-0.16s]"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300 animate-bouncedelay"></div>
                </div>
                <p className="text-lg font-semibold">Loading Session...</p>
            </div>
        );
    }
    if (!session || !net) {
        return <div className="text-center py-20 text-red-500">Error: Could not load session data. The session may have been deleted.</div>;
    }

    const sortedCheckIns = [...sessionCheckIns].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const isLinkedRepeaterNet = net.net_config_type === NetConfigType.LINKED_REPEATER;

    return (
        <div className="space-y-6">
            {/* --- Header Section --- */}
            <button onClick={props.onBack} className="flex items-center gap-2 text-md font-semibold text-dark-text-secondary hover:text-dark-text transition-colors">
                <Icon className="text-xl">arrow_back</Icon>
                <span>Back to {net.name} Details</span>
            </button>

            {isEditingEndedSession && (
                <div className="bg-yellow-900/50 text-yellow-300 p-4 rounded-lg ring-1 ring-inset ring-yellow-400/50">
                    <div className="flex items-center justify-center gap-3">
                        <Icon>edit_note</Icon>
                        <p className="font-semibold">You are editing a historical session. Changes are saved automatically.</p>
                        <button onClick={() => setIsEditingEndedSession(false)} className="ml-4 text-sm font-bold underline hover:text-white flex-shrink-0">Exit Edit Mode</button>
                    </div>
                </div>
            )}

            <div className="bg-dark-800 shadow-lg rounded-lg p-5 sm:p-6">
                <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{net.name}</h1>
                            {isActive && (
                                <div className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full bg-green-500/20 text-green-300">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span>Live</span>
                                </div>
                            )}
                        </div>
                        <p className="text-dark-text-secondary mt-2">
                            Session started at {new Date(session.start_time).toLocaleString()}
                        </p>
                        <p className="text-dark-text font-semibold mt-1">
                            Net Control: {session.primary_nco} ({session.primary_nco_callsign})
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {canManageSessions && isActive && (
                            <button 
                                onClick={() => props.onEndSessionRequest(sessionId, net.id)} 
                                className="px-6 py-2.5 text-sm font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors shadow-md"
                            >
                                End Session
                            </button>
                        )}
                        {!isActive && (isOwnerOrAdmin || canDeleteSessions) && (
                        <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsMenuOpen(prev => !prev)}
                                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                    aria-label="More session actions"
                                >
                                    <Icon>more_vert</Icon>
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-dark-800 border border-dark-700 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2 z-10">
                                        <div className="space-y-1">
                                            {isOwnerOrAdmin && (
                                                <button
                                                    onClick={() => {
                                                        setIsEditingEndedSession(true);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-dark-text-secondary hover:bg-dark-700 hover:text-dark-text transition-colors rounded-md"
                                                >
                                                    <Icon className="text-xl w-5 text-center">edit</Icon>
                                                    <span>Edit Session</span>
                                                </button>
                                            )}
                                            {canDeleteSessions && (
                                                <button
                                                    onClick={() => {
                                                        props.onDeleteSession(sessionId, net.id);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors rounded-md"
                                                >
                                                    <Icon className="text-xl w-5 text-center">delete_forever</Icon>
                                                    <span>Delete Session</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Session Notes Section --- */}
            <div className="bg-dark-800 shadow-lg rounded-lg p-4 sm:p-6">
                <h3 className="text-xl text-dark-text font-bold mb-2">Session Notes</h3>
                <textarea
                    placeholder="Type your session notes here... Notes are saved automatically."
                    rows={4}
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    disabled={!hasEditPermissions}
                    className="text-md block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm disabled:bg-dark-800/50"
                    aria-label="Session Notes"
                />
            </div>
            
            {/* --- Check-In Form Section (only shown if session is active/editable and user has permission) --- */}
                        {hasEditPermissions && (
                                <CheckInForm
                                    net={net}
                                    onSubmit={handleAddCheckIn}
                                    isSubmitting={isSubmitting}
                                    repeaterId={repeaterId}
                                    setRepeaterId={setRepeaterId}
                                />
                        )}
            
            {/* --- Check-In Log / Roster Section --- */}
            <div className="bg-dark-800 shadow-lg rounded-lg">
                <div className="p-5 sm:p-6 border-b border-dark-700 flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h3 className="text-xl text-dark-text font-bold">Check-In Log</h3>
                        <p className="text-md text-dark-text mt-1"><span className="font-bold">{sessionCheckIns.length}</span> Checked-in</p>
                    </div>
                    {/* Tabs are only shown if there's a roster to display */}
                    {showTabs && (
                        <div className="flex items-center gap-1 bg-dark-900/50 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('roster')}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'roster' ? 'bg-dark-700 text-dark-text' : 'text-dark-text-secondary hover:bg-dark-700/50 hover:text-dark-text'}`}
                            >
                                Roster
                            </button>
                            <button
                                onClick={() => setActiveTab('log')}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'log' ? 'bg-dark-700 text-dark-text' : 'text-dark-text-secondary hover:bg-dark-700/50 hover:text-dark-text'}`}
                            >
                                Live Log
                            </button>
                        </div>
                    )}
                </div>

                {/* --- Live Log Table --- */}
                {activeTab === 'log' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-700">
                        <thead className="bg-dark-700/50">
                                <tr>
                                    <th scope="col" className="w-12 px-2 py-3 text-center"><span className="sr-only">Status</span></th>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Time</th>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Call Sign</th>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Awards</th>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Location</th>
                                    {/* Conditionally render the Repeater column */}
                                    {isLinkedRepeaterNet && <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Repeater</th>}
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Notes</th>
                                    <th scope="col" className="relative px-4 py-2"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700">
                                {sortedCheckIns.length === 0 ? (
                                    <tr><td colSpan={isLinkedRepeaterNet ? 9 : 8} className="text-center py-10 px-6 text-dark-text-secondary">No check-ins yet.</td></tr>
                                ) : sortedCheckIns.map((checkIn, index) => {
                                    const style = getStatusStyles(checkIn.status_flag);
                                    // Find badges earned specifically in this session for this user.
                                    const earnedBadges = props.awardedBadges.filter(b => b.call_sign === checkIn.call_sign && b.session_id === sessionId)
                                        .map(b => allBadges.find(def => def.id === b.badge_id)).filter(Boolean) as BadgeType[];
                                    const isNCO = checkIn.call_sign === session.primary_nco_callsign;
                                    // Find the repeater name if applicable.
                                    const repeater = checkIn.repeater_id && isLinkedRepeaterNet
                                        ? net.repeaters.find(r => r.id === checkIn.repeater_id)
                                        : null;
                                    return (
                                        <tr key={checkIn.id} className={`transition-colors ${style.row} ${checkIn.isOptimistic ? 'opacity-50' : ''}`}>
                                            <td className="w-12 px-2 py-4">
                                                <button onClick={() => handleStatusClick(checkIn)} className={`w-full flex items-center justify-center rounded-md ${hasEditPermissions && !checkIn.isOptimistic ? 'hover:bg-dark-700' : 'cursor-default'}`} disabled={!hasEditPermissions || checkIn.isOptimistic}>
                                                    <Icon className={`text-2xl transition-colors ${style.icon}`}>{getStatusIcon(checkIn.status_flag)}</Icon>
                                                </button>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(checkIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                                            <td className={`px-4 py-2 whitespace-nowrap text-sm font-bold text-md ${style.callsign}`}>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => props.onViewCallsignProfile(checkIn.call_sign)} className={`hover:underline focus:outline-none ${isNCO ? 'text-blue-300' : ''}`}>
                                                        {checkIn.call_sign}
                                                    </button>
                                                    {isNCO && <NCOBadge />}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{checkIn.name}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-1.5">
                                                    {earnedBadges.map(b => <Badge key={b.id} badge={b} variant="icon" />)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">{checkIn.location}</td>
                                            {isLinkedRepeaterNet && (
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                                    {repeater ? repeater.name : '-'}
                                                </td>
                                            )}
                                            <td className="px-4 py-2 whitespace-nowrap text-sm italic">{checkIn.notes}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                {/* Edit/Delete buttons only appear for active/editable sessions for authorized users. */}
                                                {hasEditPermissions && (
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => onEditCheckIn(sessionId, checkIn)} disabled={checkIn.isOptimistic} className="w-8 h-8 flex items-center justify-center text-gray-400 rounded-full hover:bg-white/10 hover:text-white transition-colors disabled:text-gray-600 disabled:cursor-not-allowed">
                                                            <Icon className="text-xl">edit</Icon>
                                                        </button>
                                                        <button onClick={() => handleDeleteCheckIn(checkIn)} disabled={checkIn.isOptimistic} className="w-8 h-8 flex items-center justify-center text-gray-400 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:text-gray-600 disabled:cursor-not-allowed">
                                                            <Icon className="text-xl">delete</Icon>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {/* --- Roster Table --- */}
                {activeTab === 'roster' && showTabs && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-dark-700">
                            <thead className="bg-dark-700/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Call Sign</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Location</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Action</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-700">
                                {rosterMembers.length === 0 ? (
                                    <tr><td colSpan={4} className="text-center py-10 px-6 text-dark-text-secondary">No members in this roster.</td></tr>
                                ) : rosterMembers.map(member => (
                                    <tr key={member.id} className="hover:bg-dark-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-md text-brand-accent">{member.call_sign}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{member.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{member.location}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* Check-in from roster button */}
                                            {hasEditPermissions && (
                                                <button onClick={() => handleAddCheckIn({call_sign: member.call_sign, name: member.name, location: member.location, notes: "From Roster", repeater_id: null})}
                                                    // Disable if submitting or if the user is already checked in.
                                                    disabled={isSubmitting || checkedInCallsigns.has(normalizeCallsign(member.call_sign))}
                                                    className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary disabled:bg-gray-500 disabled:cursor-not-allowed">
                                                    {checkedInCallsigns.has(normalizeCallsign(member.call_sign)) ? 'Logged' : 'Check-in'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SessionScreen;