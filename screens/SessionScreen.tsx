/**
 * SessionScreen.tsx
 * 
 * This is the primary screen for managing a live NET session. It displays
 * the check-in form, the log of checked-in users, and session details. It
 * handles real-time updates for check-ins and session status.
 */
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Net, NetSession, CheckIn, Profile, NetConfigType, AwardedBadge, Badge as BadgeType, Repeater, PermissionKey, RosterMember, CheckInInsertPayload, CheckInStatus, CheckInStatusValue, DayOfWeek, PasscodePermissions, NetType } from '../types';
import { Icon } from '../components/Icon';
import { formatRepeaterCondensed } from '../lib/time';
import { supabase } from '../lib/supabaseClient';
import { Badge } from '../components/Badge';
import { Database } from '../database.types';
import { NCOBadge } from '../components/NCOBadge';
// import JoinNetModal from '../components/JoinNetModal';

// --- PROPS INTERFACE ---
interface SessionScreenProps {
  sessionId: string; // The unique ID of the session being viewed.
  allBadges: BadgeType[]; // All possible badge definitions.
  awardedBadges: AwardedBadge[]; // All awarded badges for all users.
  rosterMembers: RosterMember[]; // Roster members specific to the current NET.
  profile: Profile | null; // The currently logged-in user's profile.
  hasPermission: (permission: PermissionKey) => boolean; // Function to check if the user has a specific permission for this NET.
  onEndSessionRequest: (sessionId: string, netId: string) => void; // Handler to request ending the session.
  onAddCheckIn: (sessionId: string, netId: string, checkIn: CheckInInsertPayload) => Promise<void>; // Handler to add a new check-in.
  onEditCheckIn: (sessionId: string, checkIn: CheckIn) => void; // Handler to open the edit modal for a check-in.
  onUpdateCheckInStatus: (checkInId: string, netId: string, status: CheckInStatusValue) => Promise<void>; // Handler to update a check-in's status flag.
  onBack: () => void; // Navigation handler to go back to the previous screen.
  onUpdateSessionNotes: (sessionId: string, notes: string) => Promise<void>; // Handler to save session notes.
  onViewCallsignProfile: (callsign: string) => void; // Navigation handler to view a user's profile.
  showAlert: (title: string, message: string) => void; // Function to show a generic alert modal.
  handleApiError: (error: any, context?: string) => void; // Generic API error handler.
  requestConfirmation: (config: { title: string; message: string; onConfirm: () => void; confirmText?: string; isDestructive?: boolean; }) => void; // Function to show a confirmation dialog.
  verifiedPasscodes: Record<string, string>; // Map of net IDs to their verified passcodes.
  onDeleteSession: (sessionId: string, netId: string) => void; // Handler to delete the session.
}

// --- SUB-COMPONENTS ---

// A reusable, styled text input component.
const FormInput: React.FC<{label: string, id: string} & React.InputHTMLAttributes<HTMLInputElement>> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-dark-text-secondary mb-1">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <input
            id={id}
            {...props}
            className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11"
        />
    </div>
);

// A reusable, styled select dropdown component.
const FormSelect: React.FC<{label: string, id: string, children: React.ReactNode} & React.SelectHTMLAttributes<HTMLSelectElement>> = ({ label, id, children, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-dark-text-secondary mb-1">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <select id={id} {...props} className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11">
            {children}
        </select>
    </div>
);

// The main form for adding new check-ins.
const CheckInForm: React.FC<{
    net: Net,
    onSubmit: (data: CheckInInsertPayload) => Promise<void>,
    isSubmitting: boolean
}> = React.memo(({ net, onSubmit, isSubmitting }) => {
    const [callSign, setCallSign] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [repeaterId, setRepeaterId] = useState<string | null>(null);

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
            call_sign: callSign, name, location, notes, repeater_id: repeaterId,
        };
        try {
            await onSubmit(checkInData);
            // Clear form ONLY on successful submission. If there's an error (like a duplicate),
            // the data remains in the form for the user to correct.
            setCallSign('');
            setName('');
            setLocation('');
            setNotes('');
            setRepeaterId(null);
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
                    <FormSelect label="Repeater" id="repeater_id" name="repeater_id" value={repeaterId || ''} onChange={(e) => setRepeaterId(e.target.value || null)}>
                        <option value="">Select Repeater...</option>
                        {net.repeaters.map(r => <option key={r.id} value={r.id}>{formatRepeaterCondensed(r)}</option>)}
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

const SessionScreen: React.FC<SessionScreenProps> = ({ sessionId, allBadges, rosterMembers, onAddCheckIn, onEditCheckIn, onUpdateCheckInStatus, onUpdateSessionNotes, ...props }) => {
    // --- STATE MANAGEMENT ---
    const [loading, setLoading] = useState(true); // Tracks initial data loading state.
    const [session, setSession] = useState<NetSession | null>(null); // Holds the current session's data.
    const [net, setNet] = useState<Net | null>(null); // Holds the data for the NET associated with this session.
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]); // Holds the list of check-ins for this session.
    const [sessionNotes, setSessionNotes] = useState(''); // Local state for the session notes textarea to allow debouncing.
    const [activeTab, setActiveTab] = useState<'log' | 'roster'>('log'); // Controls which tab is visible (Live Log or Roster).
    const [isSubmitting, setIsSubmitting] = useState(false); // Tracks if a new check-in is currently being submitted to prevent double-clicks.
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State for the historical session actions menu.
    const [isEditingEndedSession, setIsEditingEndedSession] = useState(false); // State to enable editing on an ended session.
    const menuRef = useRef<HTMLDivElement>(null);

    // --- DERIVED STATE & CONSTANTS (using useMemo for performance) ---
    const isActive = useMemo(() => session?.end_time === null, [session]); // Is the session currently live?
    const canLogContacts = props.hasPermission('logContacts'); // Does the user have permission to manage check-ins during an active session?
    const canManageSessions = props.hasPermission('manageSessions'); // Does the user have permission to start/end sessions?
    const canDeleteSessions = props.hasPermission('deleteSessions'); // Does the user have permission to delete/edit historical sessions?

    const isOwnerOrAdmin = useMemo(() => {
        if (!props.profile || !net) return false;
        return props.profile.role === 'admin' || net.created_by === props.profile.id;
    }, [props.profile, net]);

    // This is the core permission logic for actions within the session.
    // It determines if the user can modify things based on session status and their permissions.
    const hasEditPermissions = useMemo(() => {
        if (isActive) {
            return canLogContacts; // For active sessions, you need 'logContacts' permission.
        }
        if (isEditingEndedSession) {
            return isOwnerOrAdmin; // For historical sessions, only owner/admin can edit.
        }
        return false; // Otherwise, no editing allowed.
    }, [isActive, isEditingEndedSession, canLogContacts, isOwnerOrAdmin]);

    const showTabs = hasEditPermissions && rosterMembers.length > 0; // Should the Roster/Log tabs be shown?
    const checkedInCallsigns = useMemo(() => new Set(checkIns.map(ci => normalizeCallsign(ci.call_sign))), [checkIns]); // A Set of already checked-in callsigns for quick lookups.

    // --- SIDE EFFECTS (useEffect) ---
    // Click-outside-to-close handler for the actions menu.
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

    // Debounced effect for saving session notes. This prevents an API call on every keystroke.
    useEffect(() => {
        // Don't save if still loading, user doesn't have permission, or notes haven't changed.
        if (loading || !hasEditPermissions || sessionNotes === (session?.notes || '')) {
            return;
        }
        // Set a timer to save the notes 1.5 seconds after the user stops typing.
        const handler = setTimeout(() => {
            onUpdateSessionNotes(sessionId, sessionNotes);
        }, 1500);

        // Cleanup function: if the component unmounts or dependencies change, clear the timer.
        return () => clearTimeout(handler);
    }, [sessionNotes, sessionId, session, onUpdateSessionNotes, loading, hasEditPermissions]);
    
    // This effect ensures the user is always on a valid tab.
    useEffect(() => {
        // If the user is on the roster tab but loses permission or the roster becomes empty,
        // automatically switch them back to the live log.
        if (activeTab === 'roster' && !showTabs) {
            setActiveTab('log');
        }
    }, [showTabs, activeTab]);

    // This is the main data fetching and real-time subscription effect. It runs once when the component mounts.
    useEffect(() => {
        setLoading(true);

        // Fetches all necessary data for the screen from the server.
        const fetchInitialData = async () => {
            try {
                // Fetch the session data first.
                const { data: sessionResult, error: sessionError } = await supabase
                    .from('sessions')
                    .select('*')
                    .eq('id', sessionId)
                    .limit(1);
        
                if (sessionError) throw new Error(sessionError.message);
        
                // If no session is found (e.g., deleted), stop loading and let the component render an error.
                if (!sessionResult || sessionResult.length === 0) {
                    setLoading(false);
                    return;
                }
                const sessionData = (sessionResult as unknown as NetSession[])[0];
        
                // Fetch the associated NET data.
                const { data: netResult, error: netError } = await supabase
                    .from('nets')
                    .select('*')
                    .eq('id', sessionData.net_id)
                    .limit(1);
        
                if (netError) throw new Error(netError.message);
        
                if (!netResult || netResult.length === 0) {
                    setLoading(false);
                    return;
                }
                const netData = (netResult as unknown as Database['public']['Tables']['nets']['Row'][])[0];
                
                // Transform the raw net data into the frontend `Net` type.
                const typedNet: Net = {
                    id: netData.id,
                    created_by: netData.created_by,
                    name: netData.name,
                    description: netData.description,
                    website_url: netData.website_url,
                    primary_nco: netData.primary_nco,
                    primary_nco_callsign: netData.primary_nco_callsign,
                    net_type: netData.net_type as NetType,
                    schedule: netData.schedule as DayOfWeek,
                    time: netData.time,
                    time_zone: netData.time_zone,
                    net_config_type: (netData.net_config_type as NetConfigType) || NetConfigType.SINGLE_REPEATER,
                    repeaters: (netData.repeaters as unknown as Repeater[]) || [],
                    frequency: netData.frequency,
                    band: netData.band,
                    mode: netData.mode,
                    passcode: netData.passcode || null,
                    passcode_permissions: (netData.passcode_permissions as unknown as PasscodePermissions | null),
                };

                setSession(sessionData as NetSession);
                setSessionNotes(sessionData.notes || '');
                setNet(typedNet);

                // Fetch the check-ins for this session.
                const { data: checkInData, error: checkInError } = await supabase.from('check_ins').select('*').eq('session_id', sessionId).order('timestamp', { ascending: false });
                if (checkInError) throw new Error(checkInError.message);

                // FIX: Transform raw check-in data to match the frontend CheckIn type.
                // The database returns `status_flag` as a generic `number`, but our frontend `CheckIn` type
                // expects the more specific `CheckInStatusValue` union type. We cast it here.
                const typedCheckIns = ((checkInData as unknown as Database['public']['Tables']['check_ins']['Row'][]) || []).map(ci => ({
                    ...ci,
                    status_flag: ci.status_flag as CheckInStatusValue,
                }));
                setCheckIns(typedCheckIns);

            } catch (err: any) {
                props.handleApiError(err, 'fetchSessionData');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();

        // Sets up real-time listeners for database changes.
        const channel = supabase.channel(`session-${sessionId}`);
        channel
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'check_ins', filter: `session_id=eq.${sessionId}`}, (payload) => {
                const newCheckInFromDb = payload.new as unknown as Database['public']['Tables']['check_ins']['Row'];
                const callsignFromDb = normalizeCallsign(newCheckInFromDb.call_sign);
                
                setCheckIns(current => {
                    // This logic handles replacing the optimistic UI entry with the real one from the database.
                    const optimisticEntry = current.find(c => c.isOptimistic && normalizeCallsign(c.call_sign) === callsignFromDb);
                    if (optimisticEntry) {
                        return current.map(c => c.id === optimisticEntry.id ? { ...newCheckInFromDb, isOptimistic: false, status_flag: c.status_flag as CheckInStatusValue } : c);
                    }
                    // Avoid adding duplicates if the message arrives multiple times.
                    return current.some(c => c.id === newCheckInFromDb.id) ? current : [{...newCheckInFromDb, status_flag: newCheckInFromDb.status_flag as CheckInStatusValue}, ...current];
                });
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'check_ins', filter: `session_id=eq.${sessionId}`}, (payload) => {
                const updatedCheckIn = payload.new as unknown as CheckIn;
                setCheckIns(current => current.map(c => c.id === updatedCheckIn.id ? updatedCheckIn : c));
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'check_ins', filter: `session_id=eq.${sessionId}`}, (payload) => {
                setCheckIns(current => current.filter(c => c.id !== (payload.old as any).id));
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}`}, (payload) => {
                // Listen for updates to the session itself (e.g., end_time, notes from another user).
                const updatedSession = payload.new as unknown as NetSession;
                setSession(prev => prev ? { ...prev, ...updatedSession } : updatedSession);
                // Use callback form to get latest state without adding dependency
                setSessionNotes(currentNotes => {
                    const newNotes = updatedSession.notes || '';
                    return newNotes !== currentNotes ? newNotes : currentNotes;
                });
            })
            .subscribe();

        // Cleanup: remove the channel subscription when the component unmounts.
        return () => { supabase.removeChannel(channel); };
    }, [sessionId, props.handleApiError]); // Dependency array ensures this runs only when sessionId changes.

    // Effect to update the browser tab's title.
    useEffect(() => {
        if (net) {
            document.title = `Session: ${net.name} | NetControl`;
        } else {
            document.title = 'Session | NetControl';
        }

        // Cleanup: reset the title when the component unmounts.
        return () => {
            document.title = 'Amateur Radio Net Logger';
        };
    }, [net]);

    // --- EVENT HANDLERS ---

    // Handles adding a check-in using an "optimistic UI" approach.
    const handleAddCheckInOptimistic = useCallback(async (checkInData: CheckInInsertPayload, source: 'form' | RosterMember['id']): Promise<void> => {
        if (isSubmitting || !net) return;
        const callsign = normalizeCallsign(checkInData.call_sign);
        if (!callsign) {
            props.showAlert("Missing Information", "Call Sign cannot be empty.");
            return;
        }
        if (checkedInCallsigns.has(callsign)) {
            props.showAlert("Duplicate Entry", `${callsign} has already checked into this session.`);
            return;
        }

        setIsSubmitting(true);
        // Create a temporary "optimistic" check-in object to display in the UI immediately.
        const optimisticId = `optimistic-${callsign}`;
        const optimisticCheckIn: CheckIn = {
            id: optimisticId,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
            status_flag: CheckInStatus.NEW,
            isOptimistic: true, // This flag lets us style it differently (e.g., faded out).
            ...checkInData
        };
        
        // Add the optimistic entry to the top of the list.
        setCheckIns(prev => [optimisticCheckIn, ...prev]);

        try {
            // Call the actual API function.
            await onAddCheckIn(sessionId, net.id, checkInData);
        } catch (error) {
            // If the API call fails, remove the optimistic entry from the UI.
            setCheckIns(prev => prev.filter(c => c.id !== optimisticId));
            // Re-throw the error so the CheckInForm knows the submission failed.
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, net, sessionId, checkedInCallsigns, onAddCheckIn, props.showAlert]);

    // Handles cycling through the check-in statuses (New -> Acknowledged -> Attention -> Question -> New).
    const handleStatusClick = useCallback(async (checkIn: CheckIn) => {
        if (!net || !hasEditPermissions || checkIn.isOptimistic) return;

        const currentStatus = checkIn.status_flag;
        const nextStatus = ((currentStatus + 1) % 4) as CheckInStatusValue; // Cycle through 0, 1, 2, 3

        // Optimistically update the UI to feel instantaneous.
        setCheckIns(prev => prev.map(c => c.id === checkIn.id ? { ...c, status_flag: nextStatus } : c));

        try {
            await onUpdateCheckInStatus(checkIn.id, net.id, nextStatus);
        } catch (error) {
            // If the API call fails, revert the change in the UI.
            setCheckIns(prev => prev.map(c => c.id === checkIn.id ? { ...c, status_flag: currentStatus } : c));
        }
    }, [net, hasEditPermissions, onUpdateCheckInStatus]);

    // Handles deleting a check-in after confirming with the user.
    const handleDeleteCheckIn = (checkInId: string) => {
        if (!net) return;
        const passcode = props.verifiedPasscodes[net.id] || null;
        props.requestConfirmation({
            title: "Delete Check-in",
            message: "Are you sure you want to permanently delete this check-in?",
            isDestructive: true,
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    const { error } = await supabase.rpc('delete_check_in', { p_check_in_id: checkInId, p_passcode: passcode });
                    if (error) throw new Error(error.message);
                    // The real-time subscription will handle removing the item from the UI.
                } catch (error) {
                    props.handleApiError(error, "handleDeleteCheckIn");
                }
            }
        });
    };

    // --- RENDER LOGIC ---

    // Show a loading indicator while fetching initial data.
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
    // Show an error message if data couldn't be loaded.
    if (!session || !net) {
        return <div className="text-center py-20 text-red-500">Error: Could not load session data. Please go back and try again.</div>;
    }

    // Sort check-ins by timestamp for display.
    const sortedCheckIns = [...checkIns].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
                <CheckInForm net={net} onSubmit={(data) => handleAddCheckInOptimistic(data, 'form')} isSubmitting={isSubmitting} />
            )}
            
            {/* --- Check-In Log / Roster Section --- */}
            <div className="bg-dark-800 shadow-lg rounded-lg">
                <div className="p-5 sm:p-6 border-b border-dark-700 flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h3 className="text-xl text-dark-text font-bold">Check-In Log</h3>
                        <p className="text-md text-dark-text mt-1"><span className="font-bold">{checkIns.length}</span> Checked-in</p>
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
                                                        <button onClick={() => handleDeleteCheckIn(checkIn.id)} disabled={checkIn.isOptimistic} className="w-8 h-8 flex items-center justify-center text-gray-400 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors disabled:text-gray-600 disabled:cursor-not-allowed">
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
                                                <button onClick={() => handleAddCheckInOptimistic({call_sign: member.call_sign, name: member.name, location: member.location, notes: "From Roster", repeater_id: null}, member.id)}
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