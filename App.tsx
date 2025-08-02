

/**
 * App.tsx
 * 
 * This is the root component of the application, acting as the main controller.
 * It manages all global state, user authentication, data fetching, real-time
 * subscriptions, and view routing.
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Net, NetSession, View, CheckIn, Profile, NetType, DayOfWeek, NetConfigType, AwardedBadge, Badge, PasscodePermissions, PermissionKey, RosterMember, Repeater, CheckInInsertPayload, CheckInStatusValue } from './types';
import HomeScreen from './screens/HomeScreen';
import ManageNetsScreen from './screens/ManageNetsScreen';
import NetEditorScreen from './screens/NetEditorScreen';
import SessionScreen from './screens/SessionScreen';
import NetDetailScreen from './screens/NetDetailScreen';
import Header from './components/Header';
import EditCheckInModal from './components/EditCheckInModal';
import { supabase } from './lib/supabaseClient';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AccessRevokedScreen from './screens/PendingApprovalScreen';
import UserManagementScreen from './screens/AdminApprovalScreen';
import { Session } from '@supabase/supabase-js';
import { Database, Json } from './database.types';
import { BADGE_DEFINITIONS } from './lib/badges';
import CallSignProfileScreen from './screens/CallSignProfileScreen';
import AboutScreen from './screens/AboutScreen';
import AwardsScreen from './screens/AwardsScreen';
import Footer from './components/Footer';
import UserAgreementScreen from './screens/UserAgreementScreen';
import ReleaseNotesScreen from './screens/ReleaseNotesScreen';
import PasscodeModal from './components/PasscodeModal';
import SessionExpiredModal from './components/SessionExpiredModal';
import RosterEditorScreen from './screens/RosterEditorScreen';
import ConfirmModal from './components/ConfirmModal';
import AlertModal from './components/AlertModal';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---

  // `viewHistory` manages the navigation stack. The last item is the current view.
  const [viewHistory, setViewHistory] = useState<View[]>([{ type: 'home' }]);
  // `view` is a convenience variable for the current screen.
  const view = viewHistory[viewHistory.length - 1];
  
  // `session` stores the current Supabase authentication session. Null if logged out.
  const [session, setSession] = useState<Session | null>(null);
  // `profile` stores the logged-in user's profile data from the 'profiles' table.
  const [profile, setProfile] = useState<Profile | null>(null);
  
  // Global data stores. These hold all the data fetched from the database.
  const [nets, setNets] = useState<Net[]>([]); // All configured NETs.
  const [sessions, setSessions] = useState<NetSession[]>([]); // All historical and active sessions for all NETs.
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]); // All check-ins for all sessions.
  const [allBadges, setAllBadges] = useState<Badge[]>([]); // Definitions of all possible badges.
  const [awardedBadges, setAwardedBadges] = useState<AwardedBadge[]>([]); // Records of which users have earned which badges.
  const [rosterMembers, setRosterMembers] = useState<RosterMember[]>([]); // All roster members for all NETs.
  
  // `loading` tracks the initial data loading state when the app or user session changes.
  const [loading, setLoading] = useState(true);

  // State for modals and UI interactions.
  const [editingCheckIn, setEditingCheckIn] = useState<{ sessionId: string; checkIn: CheckIn } | null>(null);
  const [verifyingPasscodeForNet, setVerifyingPasscodeForNet] = useState<Net | null>(null);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // `grantedPermissions`: Stores permissions granted via passcode for specific NETs.
  const [grantedPermissions, setGrantedPermissions] = useState<Record<string, PasscodePermissions>>({});
  // `verifiedPasscodes`: Stores the actual passcodes that have been successfully verified.
  const [verifiedPasscodes, setVerifiedPasscodes] = useState<Record<string, string>>({});
  // `isSessionExpired`: Controls the visibility of the session expiration modal.
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // State for the confirmation modal.
  const [confirmModalState, setConfirmModalState] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
      onConfirm: () => void;
      confirmText?: string;
      isDestructive?: boolean;
  }>({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
  });
  
  // State for the generic alert modal.
  const [alertModalState, setAlertModalState] = useState<{
      isOpen: boolean;
      title: string;
      message: string;
  }>({
      isOpen: false,
      title: '',
      message: '',
  });

  // --- NAVIGATION ---

  // `goBack`: Pops the last view from the history stack to navigate back.
  const goBack = useCallback(() => {
      setViewHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  // `setView`: Pushes a new view onto the history stack to navigate forward.
  // Includes logic to reset the stack for top-level navigation.
  const setView = useCallback((newView: View) => {
      setViewHistory(prev => {
          const currentView = prev[prev.length - 1];
          if (JSON.stringify(newView) === JSON.stringify(currentView)) return prev;

          // Navigating to a main screen from the header should reset the stack
          if (['home', 'login', 'register', 'manageNets', 'userManagement', 'about', 'awards', 'profile'].includes(newView.type)) {
              return [newView];
          }
          
          return [...prev, newView];
      });
  }, []);
  
  // --- MODALS & ALERTS ---
  
  // `showAlert`: Displays a generic alert modal with a title and message.
  const showAlert = useCallback((title: string, message: string) => {
    setAlertModalState({
        isOpen: true,
        title,
        message,
    });
  }, []);

  // `handleApiError`: Centralized error handler for all Supabase/API calls.
  // It parses the error object and displays a user-friendly message in the alert modal.
  // It also specifically handles auth errors to show the session expired modal.
  const handleApiError = useCallback((error: any, context?: string) => {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

    let title = `API Error${context ? ` in ${context}` : ''}`;
    let message = 'An unexpected error occurred.';

    if (error) {
        if (typeof error === 'object' && error !== null && 'message' in error) {
            const errorParts = [];
            if (typeof error.message === 'string') {
                errorParts.push(error.message);
            }
            if ('details' in error && typeof error.details === 'string' && error.details) {
                errorParts.push(`Details: ${error.details}`);
            }
            if ('hint' in error && typeof error.hint === 'string' && error.hint) {
                errorParts.push(`Hint: ${error.hint}`);
            }
            if (errorParts.length > 0) {
                message = errorParts.join(' ');
            } else {
                 try {
                    message = `An unknown error occurred: ${JSON.stringify(error)}`;
                 } catch(e) { message = 'An un-serializable error object was thrown.' }
            }
        } else if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        } else {
             try {
                message = `An unknown error occurred: ${JSON.stringify(error)}`;
            } catch (e) { message = 'An un-serializable error object was thrown.' }
        }
    }

    const isAuthError = (
        (typeof error === 'object' && error !== null && 'status' in error && (error.status === 401 || error.status === 403)) ||
        (message && (message.includes('JWT expired') || (message.includes('invalid') && message.includes('token'))))
    );

    if (isAuthError) {
        setIsSessionExpired(true);
        return;
    }

    if (message && message.includes('Failed to fetch')) {
        title = 'Network Connection Error';
        message = 'The application could not connect to the server. This may be due to a network connectivity issue, a browser extension (like an ad-blocker), or a firewall. Please check your connection and browser settings, then try again.';
    }

    showAlert(title, message);
  }, [showAlert]);
  
  // `requestConfirmation`: Displays a confirmation dialog before performing a destructive action.
  const requestConfirmation = useCallback((config: Omit<typeof confirmModalState, 'isOpen'>) => {
    setConfirmModalState({
        ...config,
        isOpen: true,
    });
  }, []);
  
  // --- DATA TRANSFORMATION & FETCHING ---

  // `transformNetPayload`: A helper function to convert raw net data from Supabase 
  // into the strongly-typed `Net` interface used by the frontend.
  const transformNetPayload = useCallback((rawNet: Database['public']['Tables']['nets']['Row']): Net => ({
    id: rawNet.id,
    created_by: rawNet.created_by,
    name: rawNet.name,
    description: rawNet.description,
    website_url: rawNet.website_url,
    primary_nco: rawNet.primary_nco,
    primary_nco_callsign: rawNet.primary_nco_callsign,
    net_type: rawNet.net_type as NetType,
    schedule: rawNet.schedule as DayOfWeek,
    time: rawNet.time,
    time_zone: rawNet.time_zone,
    net_config_type: (rawNet.net_config_type as NetConfigType) || NetConfigType.SINGLE_REPEATER,
    repeaters: (rawNet.repeaters as unknown as Repeater[]) || [],
    frequency: rawNet.frequency,
    band: rawNet.band,
    mode: rawNet.mode,
    passcode: rawNet.passcode || null,
    passcode_permissions: (rawNet.passcode_permissions as unknown as PasscodePermissions | null),
  }), []);

  // `refreshAllData`: Fetches all primary data sets from Supabase in parallel.
  // This is called on initial load and after major state changes (like ending a session).
  const refreshAllData = useCallback(async () => {
    try {
        const [netsRes, sessionsRes, checkInsRes, awardedBadgesRes, allBadgesRes, rosterMembersRes] = await Promise.all([
            supabase.from('nets').select('*').order('name'),
            supabase.from('sessions').select('*').order('start_time', { ascending: false }),
            supabase.from('check_ins').select('*').order('timestamp', { ascending: false }),
            supabase.from('awarded_badges').select('*'),
            supabase.from('badges').select('*'),
            supabase.from('roster_members').select('*'),
        ]);

        if (netsRes.error) throw new Error(`Failed to load NETs: ${netsRes.error.message}`);
        if (sessionsRes.error) throw new Error(`Failed to load sessions: ${sessionsRes.error.message}`);
        if (checkInsRes.error) throw new Error(`Failed to load check-ins: ${checkInsRes.error.message}`);
        if (awardedBadgesRes.error) throw new Error(`Failed to load awarded badges: ${awardedBadgesRes.error.message}`);
        if (allBadgesRes.error) throw new Error(`Failed to load badge definitions: ${allBadgesRes.error.message}`);
        if (rosterMembersRes.error && !rosterMembersRes.error.message.includes('does not exist')) {
            throw new Error(`Failed to load roster members: ${rosterMembersRes.error.message}`);
        }
        
        const typedNets: Net[] = ((netsRes.data as Database['public']['Tables']['nets']['Row'][]) || []).map(transformNetPayload);
        
        // FIX: Transform raw check-in data to match the frontend CheckIn type.
        // The database returns `status_flag` as a generic `number`, but our frontend `CheckIn` type
        // expects the more specific `CheckInStatusValue` union type. We cast it here.
        const typedCheckIns = ((checkInsRes.data as Database['public']['Tables']['check_ins']['Row'][]) || []).map(ci => ({
            ...ci,
            status_flag: ci.status_flag as CheckInStatusValue,
        }));

        setNets(typedNets);
        setSessions((sessionsRes.data as NetSession[]) || []);
        setCheckIns(typedCheckIns);
        setAwardedBadges((awardedBadgesRes.data as AwardedBadge[]) || []);
        setAllBadges((allBadgesRes.data as Badge[]) || []);
        setRosterMembers((rosterMembersRes.data as RosterMember[]) || []);

    } catch (error: any) {
        handleApiError(error, 'refreshAllData');
    }
  }, [transformNetPayload, handleApiError]);

  // `backfillBadges`: A utility function to retroactively award "First Check-in" badges.
  // This runs on startup to ensure data consistency if the logic was previously missing.
  const backfillBadges = useCallback(async () => {
    const firstCheckinBadgeId = 'first_checkin';

    try {
        const { data: allSessions, error: sessionsError } = await supabase.from('sessions').select('id, net_id');
        if (sessionsError) throw new Error(`Failed to fetch sessions for backfill: ${sessionsError.message}`);
        const sessionToNetMap = new Map(((allSessions as Pick<NetSession, 'id' | 'net_id'>[]) || []).map(s => [s.id, s.net_id]));

        const { data: allCheckIns, error: checkInsError } = await supabase.from('check_ins').select('call_sign, timestamp, session_id');
        if (checkInsError) throw new Error(`Failed to fetch check-ins for backfill: ${checkInsError.message}`);

        const { data: existingAwards, error: awardedBadgesError } = await supabase.from('awarded_badges').select('call_sign, net_id').eq('badge_id', firstCheckinBadgeId);
        if (awardedBadgesError) throw new Error(`Failed to fetch existing badges: ${awardedBadgesError.message}`);

        const allCheckInsWithNetId = ((allCheckIns as Pick<CheckIn, 'call_sign' | 'timestamp' | 'session_id'>[]) || []).map(ci => ({
            ...ci,
            net_id: sessionToNetMap.get(ci.session_id)
        })).filter(ci => ci.net_id);

        const firstCheckInsPerNet = new Map<string, { call_sign: string, timestamp: string, session_id: string, net_id: string }>();

        for (const checkIn of allCheckInsWithNetId) {
            if (!checkIn.net_id) continue;
            const key = `${checkIn.call_sign}-${checkIn.net_id}`;
            const existingFirst = firstCheckInsPerNet.get(key);
            if (!existingFirst || new Date(checkIn.timestamp) < new Date(existingFirst.timestamp)) {
                firstCheckInsPerNet.set(key, { ...checkIn, net_id: checkIn.net_id });
            }
        }
        
        const existingAwardsSet = new Set(((existingAwards as Pick<AwardedBadge, 'call_sign' | 'net_id'>[]) || []).map(b => `${b.call_sign}-${b.net_id}`));
        const newAwardsToInsert: Database['public']['Tables']['awarded_badges']['Insert'][] = [];

        for (const [key, firstCheckIn] of firstCheckInsPerNet.entries()) {
            if (!existingAwardsSet.has(key) && firstCheckIn.net_id) {
                newAwardsToInsert.push({
                    call_sign: firstCheckIn.call_sign,
                    badge_id: firstCheckinBadgeId,
                    session_id: firstCheckIn.session_id,
                    net_id: firstCheckIn.net_id,
                });
            }
        }

        if (newAwardsToInsert.length > 0) {
            console.log(`Backfilling ${newAwardsToInsert.length} '${firstCheckinBadgeId}' badges...`);
            const { error: insertError } = await supabase.from('awarded_badges').insert(newAwardsToInsert as any);

            if (insertError) {
                console.error(`Error inserting backfilled badges: ${insertError.message}`);
            } else {
                await refreshAllData(); // Refresh data after successful backfill
            }
        }
    } catch (error) {
        console.error("Error during badge backfill process:", error);
    }
}, [refreshAllData]);
  
  // --- SIDE EFFECTS (useEffect) ---
  
  // This effect manages the user's authentication state.
  // It runs once on mount to get the initial session and sets up a listener
  // for any subsequent auth changes (login, logout).
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if(!session) {
        setGrantedPermissions({}); // Clear permissions on logout
        setVerifiedPasscodes({}); // Clear verified passcodes on logout
        setIsSessionExpired(false); // Clear expired modal on logout
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // This effect triggers whenever the user's session changes.
  // It fetches the user's profile and then refreshes all application data.
  // It also handles the case where a user is logged in but their profile hasn't been created yet.
  useEffect(() => {
    const onSessionChange = async () => {
        try {
            setLoading(true);
            let userProfile: Profile | null = null;

            if (session?.user?.id) {
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .limit(1);

                if (profileError) {
                    console.error("Error fetching user profile:", profileError.message);
                    handleApiError(profileError, 'fetch-profile');
                } else if (!profiles || profiles.length === 0) {
                    console.warn(`Profile not found for user ${session.user.id}. Signing out.`);
                    await supabase.auth.signOut();
                    return;
                } else {
                    userProfile = profiles[0] as Profile;
                }
            }

            setProfile(userProfile);
            await refreshAllData();
            if (session?.user) { // Only backfill if user is logged in
                await backfillBadges();
            }

        } catch (error) {
            console.error("An unexpected error occurred during session processing:", error);
        } finally {
            setLoading(false);
        }
    };

    onSessionChange();
  }, [session, refreshAllData, backfillBadges, handleApiError]);

  // This effect sets up all the real-time listeners (subscriptions) for database changes.
  // It listens for inserts, updates, and deletes on key tables and updates the global state.
  // A unique channel ID is used for each client to prevent cross-talk issues.
  useEffect(() => {
    const channelId = `app-global-${Math.random().toString(36).substring(2, 9)}`;
    
    const netsChannel = supabase.channel(`${channelId}-nets`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nets' }, payload => {
        const newNet = transformNetPayload(payload.new as Database['public']['Tables']['nets']['Row']);
        setNets(prev => (prev.some(n => n.id === newNet.id) ? prev : [...prev, newNet].sort((a,b) => a.name.localeCompare(b.name))));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'nets' }, payload => {
        const updatedNet = transformNetPayload(payload.new as Database['public']['Tables']['nets']['Row']);
        setNets(prev => prev.map(n => n.id === updatedNet.id ? updatedNet : n));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'nets' }, payload => {
        setNets(prev => prev.filter(item => item.id !== (payload.old as any).id));
      })
      .subscribe();

    const sessionsChannel = supabase.channel(`${channelId}-sessions`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sessions' }, (payload) => {
          const newSession = payload.new as NetSession;
          setSessions(prev => [newSession, ...prev.filter(s => s.id !== newSession.id)].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions' }, (payload) => {
          const updatedSession = payload.new as NetSession;
          setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'sessions' }, (payload) => {
          const oldSessionId = (payload.old as any).id;
          setSessions(prev => prev.filter(s => s.id !== oldSessionId));
      })
      .subscribe();
      
    const awardedBadgesChannel = supabase.channel(`${channelId}-awarded_badges`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'awarded_badges' }, payload => {
            const newBadge = payload.new as AwardedBadge;
            setAwardedBadges(prev => [...prev, newBadge]);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'awarded_badges' }, payload => {
            const oldBadgeId = (payload.old as any).id;
            setAwardedBadges(prev => prev.filter(b => b.id !== oldBadgeId));
        })
        .subscribe();
    
    const rosterMembersChannel = supabase.channel(`${channelId}-roster_members`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'roster_members' }, async () => {
            const { data, error } = await supabase.from('roster_members').select('*');
            if (error) {
                console.error("Error re-fetching roster members:", error);
            } else {
                setRosterMembers((data as RosterMember[]) || []);
            }
        })
        .subscribe();

    return () => {
      supabase.removeChannel(netsChannel);
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(awardedBadgesChannel);
      supabase.removeChannel(rosterMembersChannel);
    };
  }, [transformNetPayload]);

  // This effect acts as the primary router for the application.
  // It runs whenever the current view, session, or profile changes.
  // It enforces access control, redirecting users based on their auth status and profile approval.
  useEffect(() => {
    if (loading) return;

    if (session && profile) {
        if (!profile.is_approved && profile.role !== 'admin') {
            if (view.type !== 'accessRevoked') {
                setView({ type: 'accessRevoked' });
            }
        } else if (['login', 'register', 'accessRevoked'].includes(view.type)) {
            setView({ type: 'home' });
        }
    } else if (!session) {
        const publicViews: Array<View['type']> = ['home', 'login', 'register', 'netDetail', 'session', 'callsignProfile', 'about', 'awards', 'userAgreement', 'releaseNotes'];
        if (!publicViews.includes(view.type)) {
             setView({ type: 'login' });
        }
    }
  }, [view, session, profile, loading, setView]);

  // --- API HANDLERS (Callbacks) ---
  // These functions are passed down as props to child components to perform actions.
  // They encapsulate the logic for interacting with the Supabase API.

  // `handleSaveNet`: Handles creating or updating a NET. It calls a Supabase RPC for updates
  // and a direct table insert for new NETs.
  const handleSaveNet = useCallback(async (netData: Partial<Net>) => {
    if (!profile || !profile.full_name || !profile.call_sign) {
        handleApiError({ message: "You must have a full name and call sign in your profile to create or manage a NET." });
        return;
    }
    try {
        const { id } = netData;

        const commonPayload = {
            name: netData.name!,
            description: netData.description || null,
            website_url: netData.website_url || null,
            primary_nco: profile.full_name,
            primary_nco_callsign: profile.call_sign,
            net_type: netData.net_type!,
            schedule: netData.schedule!,
            time: netData.time!,
            time_zone: netData.time_zone!,
            net_config_type: netData.net_config_type!,
            repeaters: (netData.net_config_type === NetConfigType.GROUP ? [] : (netData.repeaters ?? [])),
            frequency: netData.net_config_type !== NetConfigType.GROUP ? null : netData.frequency || null,
            band: netData.net_config_type !== NetConfigType.GROUP ? null : netData.band || null,
            mode: netData.net_config_type !== NetConfigType.GROUP ? null : netData.mode || null,
            passcode: netData.passcode || null,
            passcode_permissions: (netData.passcode ? (netData.passcode_permissions ?? {}) : null),
        };

        if (id) {
            const passcode = verifiedPasscodes[id] || null;
            const rpcPayload = {
                p_net_id: id,
                p_name: commonPayload.name,
                p_description: commonPayload.description,
                p_website_url: commonPayload.website_url,
                p_primary_nco: commonPayload.primary_nco,
                p_primary_nco_callsign: commonPayload.primary_nco_callsign,
                p_net_type: commonPayload.net_type,
                p_schedule: commonPayload.schedule,
                p_time: commonPayload.time,
                p_time_zone: commonPayload.time_zone,
                p_net_config_type: commonPayload.net_config_type,
                p_repeaters: commonPayload.repeaters as unknown as Json,
                p_frequency: commonPayload.frequency,
                p_band: commonPayload.band,
                p_mode: commonPayload.mode,
                p_passcode_val: commonPayload.passcode,
                p_passcode_permissions: commonPayload.passcode_permissions as unknown as Json,
                p_passcode: passcode,
            };

            const { data, error } = await supabase.rpc('update_net_details', rpcPayload);

            if (error) throw error;
            if (!data) throw new Error("No data returned after update operation via RPC.");

            const updatedNet = transformNetPayload(data as unknown as Database['public']['Tables']['nets']['Row']);
            setNets(prev => prev.map(n => n.id === updatedNet.id ? updatedNet : n));
            setView({ type: 'netDetail', netId: updatedNet.id });

        } else {
            if (!profile) throw new Error("User must be logged in to create a net.");
            
            const insertPayload: Database['public']['Tables']['nets']['Insert'] = {
                ...commonPayload,
                repeaters: commonPayload.repeaters as unknown as Json,
                passcode_permissions: commonPayload.passcode_permissions as unknown as Json | null,
                created_by: profile.id,
            };

            const { data, error } = await supabase.from('nets').insert(insertPayload as any).select().single();
            if (error) throw error;
            if (!data) throw new Error("No data returned after create operation.");

            const newNet = transformNetPayload(data as Database['public']['Tables']['nets']['Row']);
            setNets(prev => [...prev, newNet].sort((a,b) => a.name.localeCompare(b.name)));
            setView({ type: 'netDetail', netId: newNet.id });
        }
    } catch (error: any) {
        handleApiError(error, 'handleSaveNet');
    }
  }, [profile, setView, transformNetPayload, handleApiError, verifiedPasscodes]);

  // `handleDeleteNet`: Deletes a NET after user confirmation.
  const handleDeleteNet = useCallback(async (netId: string) => {
    requestConfirmation({
        title: 'Confirm Deletion',
        message: 'Are you sure you want to delete this NET and all its sessions? This cannot be undone.',
        confirmText: 'Delete',
        isDestructive: true,
        onConfirm: async () => {
            try {
                const { error } = await supabase.from('nets').delete().eq('id', netId);
                if (error) throw error;
                setNets(prev => prev.filter(n => n.id !== netId));
                setView({ type: 'manageNets' });
            } catch(error: any) {
                 handleApiError(error, 'handleDeleteNet');
            }
        }
    });
  }, [setView, handleApiError, requestConfirmation]);
  
  // `handleStartSession`: Starts a new session for a given NET.
  const handleStartSession = useCallback(async (netId: string) => {
    const netToStart = nets.find(n => n.id === netId);
    if (!netToStart) {
        console.error(`Could not find net with ID ${netId} to start session.`);
        alert("Error: Could not find the specified NET to start a session.");
        return;
    }

    if (!profile || !profile.full_name || !profile.call_sign) {
        handleApiError({ message: "You must have a name and callsign in your profile to start a session." });
        return;
    }

    try {
        const passcode = verifiedPasscodes[netToStart.id] || null;

        const { data, error } = await supabase.rpc('start_session', {
            p_net_id: netToStart.id,
            p_primary_nco: profile.full_name,
            p_primary_nco_callsign: profile.call_sign,
            p_passcode: passcode
        });
        
        if (error) throw error;
        if (!data) throw new Error("Failed to create session: No data returned from RPC.");
        
        const newSession = data as unknown as NetSession;
        setSessions(prev => [newSession, ...prev]);

        setView({ type: 'session', sessionId: newSession.id });
    } catch (error: any) {
        handleApiError(error, 'handleStartSession');
    }
  }, [nets, profile, setView, handleApiError, verifiedPasscodes]);

  // `handleEndSession`: Ends an active session. Refreshes all data afterwards to ensure consistency.
  const handleEndSession = useCallback(async (sessionId: string, netId: string) => {
    try {
        const passcode = verifiedPasscodes[netId] || null;

        const { error } = await supabase.rpc('end_session', {
            p_session_id: sessionId,
            p_passcode: passcode,
        });

        if (error) throw error;

        await refreshAllData();

        if (view.type === 'session' && view.sessionId === sessionId) {
            setView({ type: 'netDetail', netId });
        }
    } catch (error: any) {
        handleApiError(error, 'handleEndSession');
    }
  }, [view, setView, handleApiError, verifiedPasscodes, refreshAllData]);

  // `handleEndSessionRequest`: Wraps the end session action in a confirmation dialog.
  const handleEndSessionRequest = useCallback((sessionId: string, netId: string) => {
    requestConfirmation({
        title: 'Confirm End Session',
        message: 'Are you sure you want to end this net session?',
        confirmText: 'End Session',
        isDestructive: true,
        onConfirm: () => handleEndSession(sessionId, netId)
    });
  }, [handleEndSession, requestConfirmation]);

  // `handleDeleteSession`: Deletes a historical session and its check-ins after confirmation.
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    requestConfirmation({
        title: 'Confirm Deletion',
        message: 'Are you sure you want to permanently delete this session and its log?',
        confirmText: 'Delete',
        isDestructive: true,
        onConfirm: async () => {
            try {
                const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
                if (error) throw error;
                setSessions(prev => prev.filter(s => s.id !== sessionId));
                setCheckIns(prev => prev.filter(ci => ci.session_id !== sessionId));
            } catch (error: any) {
                handleApiError(error, 'handleDeleteSession');
            }
        }
    });
  }, [handleApiError, requestConfirmation]);
  
  // `handleUpdateSessionNotes`: Updates the notes for a session.
  const handleUpdateSessionNotes = useCallback(async (sessionId: string, notes: string) => {
    try {
        const payload: Database['public']['Tables']['sessions']['Update'] = { notes: notes };
        const { error } = await supabase.from('sessions').update(payload as any).eq('id', sessionId);
        if (error) throw error;
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, notes } : s));
    } catch (error: any) {
        handleApiError(error, 'handleUpdateSessionNotes');
    }
  }, [handleApiError]);

  // `handleAddCheckIn`: Adds a new check-in to a session via a Supabase RPC.
  // The RPC handles badge awarding logic server-side.
  const handleAddCheckIn = useCallback(async (sessionId: string, netId: string, checkInData: CheckInInsertPayload) => {
    try {
        const passcode = verifiedPasscodes[netId] || null;

        const { error: checkInError } = await supabase.rpc('create_check_in', {
            p_session_id: sessionId,
            p_call_sign: checkInData.call_sign,
            p_name: checkInData.name ?? null,
            p_location: checkInData.location ?? null,
            p_notes: checkInData.notes ?? null,
            p_repeater_id: checkInData.repeater_id ?? null,
            p_passcode: passcode
        });

        if (checkInError) throw checkInError;

    } catch (error: any) {
        handleApiError(error, 'handleAddCheckIn');
        throw error; // Re-throw so the caller knows about the failure.
    }
  }, [handleApiError, verifiedPasscodes]);

  // `handleEditCheckIn`: Opens the modal for editing a check-in.
  const handleEditCheckIn = useCallback((sessionId: string, checkIn: CheckIn) => {
    setEditingCheckIn({ sessionId, checkIn });
  }, []);

  // `handleUpdateCheckIn`: Saves the changes to an edited check-in.
  const handleUpdateCheckIn = useCallback(async (updatedCheckIn: CheckIn) => {
    try {
        const session = sessions.find(s => s.id === updatedCheckIn.session_id);
        if (!session) throw new Error('Session not found to determine permissions.');
        const net = nets.find(n => n.id === session.net_id);
        if (!net) throw new Error('Net not found to determine permissions.');
        
        const passcode = verifiedPasscodes[net.id] || null;

        const { error } = await supabase.rpc('update_check_in', {
            p_check_in_id: updatedCheckIn.id,
            p_call_sign: updatedCheckIn.call_sign,
            p_name: updatedCheckIn.name,
            p_location: updatedCheckIn.location,
            p_notes: updatedCheckIn.notes,
            p_repeater_id: updatedCheckIn.repeater_id,
            p_passcode: passcode,
        });

        if (error) throw error;
        
        setCheckIns(prev => prev.map(c => c.id === updatedCheckIn.id ? updatedCheckIn : c));
        setEditingCheckIn(null);
    } catch (error: any) {
        handleApiError(error, 'handleUpdateCheckIn');
    }
  }, [handleApiError, sessions, nets, verifiedPasscodes]);

  // `handleUpdateCheckInStatus`: Updates the status flag of a check-in (e.g., Acknowledged, Question).
  const handleUpdateCheckInStatus = useCallback(async (checkInId: string, netId: string, status: CheckInStatusValue) => {
    try {
        const passcode = verifiedPasscodes[netId] || null;
        const { error } = await supabase.rpc('update_check_in_status_flag', {
            p_check_in_id: checkInId,
            p_status_flag: status,
            p_passcode: passcode
        });
        if (error) throw error;
    } catch(error: any) {
        handleApiError(error, 'handleUpdateCheckInStatus');
        throw error;
    }
  }, [verifiedPasscodes, handleApiError]);

  // `handleSaveRosterMembers`: Replaces the entire roster for a NET with a new list of members.
  const handleSaveRosterMembers = useCallback(async (netId: string, members: Omit<RosterMember, 'id' | 'net_id' | 'created_at'>[]) => {
    try {
        const { error: deleteError } = await supabase.from('roster_members').delete().eq('net_id', netId);
        if (deleteError) throw deleteError;

        if (members.length > 0) {
            const membersToInsert = members.map(m => ({ ...m, net_id: netId }));
            const { error: insertError } = await supabase.from('roster_members').insert(membersToInsert as any);
            if (insertError) throw insertError;
        }

        await refreshAllData();
        setView({ type: 'netDetail', netId: netId });
    } catch(error: any) {
        handleApiError(error, 'handleSaveRosterMembers');
    }
  }, [refreshAllData, handleApiError, setView]);
  
  // `handleVerifyPasscode`: Verifies a user-submitted passcode for a NET to grant delegated permissions.
  const handleVerifyPasscode = useCallback(async (passcode: string) => {
    if (!verifyingPasscodeForNet) return;

    setIsVerifying(true);
    setPasscodeError(null);

    const { data, error } = await supabase.rpc('verify_passcode', {
        p_net_id: verifyingPasscodeForNet.id,
        p_passcode_attempt: passcode,
    });

    if (error) {
        setPasscodeError(error.message);
    } else if (data) {
        const permissions = data as PasscodePermissions;
        setGrantedPermissions(prev => ({
            ...prev,
            [verifyingPasscodeForNet.id]: permissions,
        }));
        setVerifiedPasscodes(prev => ({
            ...prev,
            [verifyingPasscodeForNet.id]: passcode,
        }));
        setVerifyingPasscodeForNet(null);
    } else {
        setPasscodeError("Invalid passcode. Please try again.");
    }

    setIsVerifying(false);
  }, [verifyingPasscodeForNet]);

  // `handleUpdateProfileData`: Updates the user's own profile information (name, callsign, location).
  const handleUpdateProfileData = useCallback(async (profileData: { full_name: string, call_sign: string, location: string }) => {
    if (!profile) return;
    try {
        const upperCaseCallSign = profileData.call_sign.toUpperCase();

        if (upperCaseCallSign && upperCaseCallSign !== profile.call_sign) {
            const { data: conflictingProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('id')
                .eq('call_sign', upperCaseCallSign)
                .not('id', 'eq', profile.id)
                .maybeSingle();

            if (fetchError) {
                if (fetchError.code !== 'PGRST116') {
                    throw fetchError;
                }
            }

            if (conflictingProfile) {
                throw new Error('This call sign is already in use by another account.');
            }
        }
        
        const { data, error: updateError } = await supabase
            .from('profiles')
            .update({
                full_name: profileData.full_name,
                call_sign: upperCaseCallSign,
                location: profileData.location
            } as any)
            .eq('id', profile.id)
            .select()
            .single();

        if (updateError) throw updateError;
        
        setProfile(data as Profile);
        showAlert('Success', 'Profile updated successfully!');
    } catch (error: any) {
        handleApiError(error, 'handleUpdateProfileData');
    }
  }, [profile, handleApiError, showAlert]);

  // `handleUpdatePassword`: Updates the user's password.
  const handleUpdatePassword = useCallback(async (password: string) => {
    try {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        showAlert('Success', 'Password updated successfully!');
    } catch (error: any) {
        handleApiError(error, 'handleUpdatePassword');
    }
  }, [handleApiError, showAlert]);

  // `handleUpdateEmail`: Updates the user's email address (requires email confirmation).
  const handleUpdateEmail = useCallback(async (email: string) => {
    try {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
        showAlert('Confirmation Required', 'A confirmation link has been sent to your new email address. Please check your inbox to complete the change.');
    } catch (error: any) {
        handleApiError(error, 'handleUpdateEmail');
    }
  }, [handleApiError, showAlert]);


  // --- DERIVED STATE & HELPERS ---

  // `hasPermission`: A memoized function to check if the current user has a specific permission for a NET.
  // It checks for admin status, ownership, and delegated permissions from a passcode.
  const hasPermission = useMemo(() => {
    return (net: Net | null, permission: PermissionKey): boolean => {
        if (!profile || !net) return false;
        if (profile.role === 'admin') return true;
        if (net.created_by === profile.id) return true;
        return grantedPermissions[net.id]?.[permission] || false;
    };
  }, [profile, grantedPermissions]);

  // `isNetManagedByUser`: A memoized helper to determine if the user has *any* management rights over a NET.
  const isNetManagedByUser = useCallback((net: Net): boolean => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    if (net.created_by === profile.id) return true;
    const netPermissions = grantedPermissions[net.id];
    if (netPermissions && Object.keys(netPermissions).length > 0) {
        return true;
    }
    return false;
  }, [profile, grantedPermissions]);
  
  // `allBadgeDefinitions`: A memoized list that combines badge data from the DB with the client-side logic (e.g., isEarned function).
  const allBadgeDefinitions = React.useMemo(() => {
    const logicMap = new Map(BADGE_DEFINITIONS.map(b => [b.id, b]));
    return allBadges.map(badge => ({
        ...badge,
        category: logicMap.get(badge.id)?.category || 'Special',
        isEarned: logicMap.get(badge.id)?.isEarned || (() => false),
        sortOrder: logicMap.get(badge.id)?.sortOrder || 999
    }));
  }, [allBadges]);

  // --- RENDER LOGIC ---

  // `renderContent`: This function acts as a simple router, rendering the correct screen component
  // based on the current `view` state.
  const renderContent = () => {
    switch (view.type) {
      case 'login':
          return <LoginScreen onSetView={setView} />;
      case 'register':
          return <RegisterScreen onSetView={setView} />;
      case 'accessRevoked':
          return <AccessRevokedScreen email={profile?.email || session?.user?.email || null} onSetView={setView} />;
      case 'about':
          return <AboutScreen />;
      case 'awards':
          return <AwardsScreen allBadgeDefinitions={allBadgeDefinitions} />;
      case 'userAgreement':
        return <UserAgreementScreen onBack={goBack} onReleaseNotes={() => setView({ type: 'releaseNotes' })} />;
      case 'releaseNotes':
          return <ReleaseNotesScreen onBack={goBack} />;
      case 'home': {
        const activeSessions = sessions.filter(s => s.end_time === null);
        return (
            <HomeScreen 
                activeSessions={activeSessions}
                nets={nets}
                checkIns={checkIns}
                profile={profile}
                onViewSession={(sessionId) => setView({ type: 'session', sessionId })}
                onViewNetDetails={(netId) => setView({ type: 'netDetail', netId })}
            />
        );
      }
      case 'manageNets': {
         const managedNets = nets.filter(isNetManagedByUser);
         return (
          <ManageNetsScreen
            nets={managedNets}
            sessions={sessions}
            rosterMembers={rosterMembers}
            profile={profile}
            hasPermission={hasPermission}
            onStartSession={handleStartSession}
            onEndSessionRequest={handleEndSessionRequest}
            onEditNet={(netId) => setView({ type: 'netEditor', netId })}
            onDeleteNet={handleDeleteNet}
            onAddNet={() => setView({ type: 'netEditor' })}
            onViewDetails={(netId) => setView({ type: 'netDetail', netId })}
            onEditRoster={(netId) => setView({ type: 'rosterEditor', netId })}
          />
        );
      }
      case 'netEditor': {
        if (!view.netId) {
          return (
            <NetEditorScreen
              initialNet={undefined}
              onSave={handleSaveNet}
              onCancel={goBack}
              profile={profile}
            />
          );
        }

        const netToEdit = nets.find(n => n.id === view.netId);

        if (!netToEdit) {
          return <div className="text-center py-20">Net not found. It may have been deleted.</div>;
        }

        if (!hasPermission(netToEdit, 'editNet')) {
          return <div className="text-center py-20">Access Denied. You do not have permission to edit this NET.</div>;
        }
        
        return (
          <NetEditorScreen
            initialNet={netToEdit}
            onSave={handleSaveNet}
            onCancel={goBack}
            profile={profile}
          />
        );
      }
       case 'netDetail': {
        const detailNet = nets.find(n => n.id === view.netId);
        if (!detailNet) return <div className="text-center py-20">Net not found.</div>;
        const netSessions = sessions.filter(s => s.net_id === view.netId);
        return (
            <NetDetailScreen
                net={detailNet}
                sessions={netSessions}
                checkIns={checkIns}
                profile={profile}
                hasPermission={hasPermission}
                onStartSession={() => handleStartSession(view.netId)}
                onEndSessionRequest={handleEndSessionRequest}
                onEditNet={() => setView({ type: 'netEditor', netId: view.netId })}
                onDeleteNet={() => handleDeleteNet(view.netId)}
                onViewSession={(sessionId) => setView({ type: 'session', sessionId })}
                onBack={goBack}
                onDeleteSession={handleDeleteSession}
                onVerifyPasscodeRequest={() => setVerifyingPasscodeForNet(detailNet)}
                onEditRoster={() => setView({ type: 'rosterEditor', netId: view.netId })}
            />
        );
      }
      case 'session': {
        const sessionForPerms = sessions.find(s => s.id === view.sessionId);
        const netForPerms = sessionForPerms ? (nets.find(n => n.id === sessionForPerms.net_id) ?? null) : null;
        const netRosterMembers = netForPerms ? rosterMembers.filter(rm => rm.net_id === netForPerms.id) : [];
        return (
          <SessionScreen
            sessionId={view.sessionId}
            allBadges={allBadges}
            awardedBadges={awardedBadges}
            rosterMembers={netRosterMembers}
            profile={profile}
            hasPermission={(permission) => hasPermission(netForPerms, permission)}
            onEndSessionRequest={handleEndSessionRequest}
            onAddCheckIn={handleAddCheckIn}
            onEditCheckIn={handleEditCheckIn}
            onUpdateCheckInStatus={handleUpdateCheckInStatus}
            onBack={goBack}
            onUpdateSessionNotes={handleUpdateSessionNotes}
            onViewCallsignProfile={(callsign) => setView({ type: 'callsignProfile', callsign })}
            showAlert={showAlert}
            handleApiError={handleApiError}
            requestConfirmation={requestConfirmation}
            verifiedPasscodes={verifiedPasscodes}
          />
        );
      }
      case 'rosterEditor': {
        const netForRoster = nets.find(n => n.id === view.netId);
        if (!netForRoster) return <div className="text-center py-20">Net not found.</div>;
        
        const membersOfRosterToEdit = rosterMembers.filter(m => m.net_id === view.netId);

        return (
          <RosterEditorScreen
            net={netForRoster}
            initialMembers={membersOfRosterToEdit}
            onSave={handleSaveRosterMembers}
            onCancel={goBack}
            onViewCallsignProfile={(callsign) => setView({ type: 'callsignProfile', callsign })}
          />
        )
      }
      case 'userManagement': {
        if (profile?.role !== 'admin') {
            return <div className="text-center py-20">Access Denied.</div>;
        }
        return <UserManagementScreen onSetView={setView}/>;
      }
      case 'callsignProfile': {
        return (
            <CallSignProfileScreen
                callsign={view.callsign}
                allNets={nets}
                allSessions={sessions}
                allCheckIns={checkIns}
                allBadgeDefinitions={allBadgeDefinitions}
                awardedBadges={awardedBadges}
                onViewSession={(sessionId) => setView({ type: 'session', sessionId })}
                onViewNetDetails={(netId) => setView({ type: 'netDetail', netId })}
                onBack={goBack}
            />
        )
      }
      case 'profile': {
        if (!profile) {
            setView({ type: 'login' });
            return null;
        }
        return (
            <ProfileScreen
                profile={profile}
                allNets={nets}
                allSessions={sessions}
                allCheckIns={checkIns}
                allBadgeDefinitions={allBadgeDefinitions}
                awardedBadges={awardedBadges}
                onViewSession={(sessionId) => setView({ type: 'session', sessionId })}
                onViewNetDetails={(netId) => setView({ type: 'netDetail', netId })}
                onSetView={setView}
            />
        );
      }
      case 'settings': {
        if (!profile) {
            setView({ type: 'login' });
            return null;
        }
        return (
            <SettingsScreen
                profile={profile}
                onUpdateProfile={handleUpdateProfileData}
                onUpdatePassword={handleUpdatePassword}
                onUpdateEmail={handleUpdateEmail}
                onBack={goBack}
            />
        );
      }
      default:
        setView({ type: 'home' });
        return <div className="text-center py-20 text-dark-text-secondary">Redirecting...</div>;
    }
  };

  // Helper functions to find associated data for modals.
  const getNetForSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session ? nets.find(n => n.id === session.net_id) : undefined;
  };
  
  const getNetForCheckIn = () => {
      if (!editingCheckIn) return undefined;
      return getNetForSession(editingCheckIn.sessionId);
  }

  // The main JSX for the component. It renders the Header, the content from `renderContent`,
  // any active modals, and the Footer.
  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-900 text-light-text dark:text-dark-text">
      <Header profile={profile} onSetView={setView} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
        {loading && !profile && !session ? (
            <div className="text-center py-20 text-dark-text-secondary">Loading...</div>
        ) : (
            renderContent()
        )}
      </main>
      {editingCheckIn && getNetForCheckIn() && (
        <EditCheckInModal
            session={sessions.find(s => s.id === editingCheckIn.sessionId)!}
            net={getNetForCheckIn()!}
            checkIn={editingCheckIn.checkIn}
            onSave={handleUpdateCheckIn}
            onClose={() => setEditingCheckIn(null)}
        />
      )}
      {verifyingPasscodeForNet && (
        <PasscodeModal
            netName={verifyingPasscodeForNet.name}
            onVerify={handleVerifyPasscode}
            onClose={() => {
              setVerifyingPasscodeForNet(null);
              setPasscodeError(null);
            }}
            error={passcodeError}
            isVerifying={isVerifying}
        />
      )}
      {isSessionExpired && (
        <SessionExpiredModal
          onLogin={() => {
            setIsSessionExpired(false);
            setView({ type: 'login' });
          }}
        />
      )}
      <ConfirmModal
        {...confirmModalState}
        onClose={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
      />
      <AlertModal
        isOpen={alertModalState.isOpen}
        title={alertModalState.title}
        message={alertModalState.message}
        onClose={() => setAlertModalState({ isOpen: false, title: '', message: '' })}
      />
      <Footer onSetView={setView} />
    </div>
  );
};

export default App;
