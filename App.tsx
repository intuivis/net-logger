
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Net, NetSession, View, CheckIn, Profile, NetType, DayOfWeek, NetConfigType, AwardedBadge, Badge, PasscodePermissions, PermissionKey, RosterMember } from './types';
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
import { Database } from './database.types';
import { BADGE_DEFINITIONS } from './lib/badges';
import CallsignProfileScreen from './screens/CallSignProfileScreen';
import AboutScreen from './screens/AboutScreen';
import AwardsScreen from './screens/AwardsScreen';
import Footer from './components/Footer';
import UserAgreementScreen from './screens/UserAgreementScreen';
import ReleaseNotesScreen from './screens/ReleaseNotesScreen';
import PasscodeModal from './components/PasscodeModal';
import SessionExpiredModal from './components/SessionExpiredModal';
import RosterEditorScreen from './screens/RosterEditorScreen';
import ConfirmModal from './components/ConfirmModal';

const App: React.FC = () => {
  const [viewHistory, setViewHistory] = useState<View[]>([{ type: 'home' }]);
  const view = viewHistory[viewHistory.length - 1];
  
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nets, setNets] = useState<Net[]>([]);
  const [sessions, setSessions] = useState<NetSession[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [awardedBadges, setAwardedBadges] = useState<AwardedBadge[]>([]);
  const [rosterMembers, setRosterMembers] = useState<RosterMember[]>([]);
  
  const [loading, setLoading] = useState(true);

  const [editingCheckIn, setEditingCheckIn] = useState<{ sessionId: string; checkIn: CheckIn } | null>(null);
  const [verifyingPasscodeForNet, setVerifyingPasscodeForNet] = useState<Net | null>(null);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [grantedPermissions, setGrantedPermissions] = useState<Record<string, PasscodePermissions>>({});
  const [verifiedPasscodes, setVerifiedPasscodes] = useState<Record<string, string>>({});
  const [isSessionExpired, setIsSessionExpired] = useState(false);

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

  const goBack = useCallback(() => {
      setViewHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const setView = useCallback((newView: View) => {
      setViewHistory(prev => {
          const currentView = prev[prev.length - 1];
          if (JSON.stringify(newView) === JSON.stringify(currentView)) return prev;

          // Navigating to a main screen from the header should reset the stack
          if (['home', 'login', 'register', 'manageNets', 'userManagement', 'about', 'awards'].includes(newView.type)) {
              return [newView];
          }
          
          return [...prev, newView];
      });
  }, []);

  const handleApiError = useCallback((error: any, context?: string) => {
      console.error(`API Error${context ? ` in ${context}`: ''}:`, error);
      
      const isAuthError = (error?.message?.includes('JWT expired') ||
                           error?.status === 401 ||
                           (error?.message?.includes('invalid') && error?.message?.includes('token'))
                          );

      if (isAuthError) {
          setIsSessionExpired(true);
      } else {
          alert(`An unexpected error occurred: ${error.message}. Please try again.`);
      }
  }, []);
  
  const requestConfirmation = useCallback((config: Omit<typeof confirmModalState, 'isOpen'>) => {
    setConfirmModalState({
        ...config,
        isOpen: true,
    });
  }, []);

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


  const refreshAllData = useCallback(async () => {
    try {
        const [netsRes, sessionsRes, checkInsRes, awardedBadgesRes, allBadgesRes, rosterMembersRes] = await Promise.all([
            supabase.from('nets').select('*').order('name'),
            supabase.from('sessions').select('*').order('start_time', { ascending: false }),
            supabase.from('check_ins').select('*').order('timestamp', { ascending: false }),
            supabase.from('awarded_badges').select('*'),
            supabase.from('badges').select('*'),
            supabase.from('roster_members').select('*'), // Fetch all roster members
        ]);

        if (netsRes.error) throw new Error(`Failed to load NETs: ${netsRes.error.message}`);
        if (sessionsRes.error) throw new Error(`Failed to load sessions: ${sessionsRes.error.message}`);
        if (checkInsRes.error) throw new Error(`Failed to load check-ins: ${checkInsRes.error.message}`);
        if (awardedBadgesRes.error) throw new Error(`Failed to load awarded badges: ${awardedBadgesRes.error.message}`);
        if (allBadgesRes.error) throw new Error(`Failed to load badge definitions: ${allBadgesRes.error.message}`);
        if (rosterMembersRes.error && !rosterMembersRes.error.message.includes('does not exist')) {
            throw new Error(`Failed to load roster members: ${rosterMembersRes.error.message}`);
        }


        const rawNets = (netsRes.data as Database['public']['Tables']['nets']['Row'][]) || [];
        
        const typedNets: Net[] = rawNets.map(transformNetPayload);
        
        setNets(typedNets);
        setSessions((sessionsRes.data as NetSession[]) || []);
        setCheckIns((checkInsRes.data as CheckIn[]) || []);
        setAllBadges((allBadgesRes.data as Badge[]) || []);
        setAwardedBadges((awardedBadgesRes.data as AwardedBadge[]) || []);
        setRosterMembers((rosterMembersRes.data as RosterMember[]) || []);

    } catch (error: any) {
        if (error.message && error.message.includes('Failed to fetch')) {
             alert(`A network error occurred while trying to connect to the database. Please verify your internet connection.`);
        } else {
            handleApiError(error, 'refreshAllData');
        }
    }
  }, [transformNetPayload, handleApiError]);

  const backfillBadges = useCallback(async () => {
    const firstCheckinBadgeId = 'first_checkin';

    try {
        const [checkInsRes, awardedBadgesRes] = await Promise.all([
            supabase.from('check_ins').select('call_sign, timestamp, session_id'),
            supabase.from('awarded_badges').select('call_sign').eq('badge_id', firstCheckinBadgeId)
        ]);

        if (checkInsRes.error) throw new Error(`Failed to fetch check-ins for backfill: ${checkInsRes.error.message}`);
        if (awardedBadgesRes.error) throw new Error(`Failed to fetch awarded badges for backfill: ${awardedBadgesRes.error.message}`);

        const allCheckIns = (checkInsRes.data as Pick<CheckIn, 'call_sign' | 'timestamp' | 'session_id'>[]) || [];
        const operatorsWithFirstBadge = new Set(((awardedBadgesRes.data as Pick<AwardedBadge, 'call_sign'>[]) || []).map(b => b.call_sign));

        const firstCheckIns = new Map<string, { timestamp: string; session_id: string }>();
        for (const checkIn of allCheckIns) {
            const existingFirst = firstCheckIns.get(checkIn.call_sign);
            if (!existingFirst || new Date(checkIn.timestamp) < new Date(existingFirst.timestamp)) {
                firstCheckIns.set(checkIn.call_sign, { timestamp: checkIn.timestamp, session_id: checkIn.session_id });
            }
        }

        const newAwards: Database['public']['Tables']['awarded_badges']['Insert'][] = [];
        for (const [callsign, firstCheckIn] of firstCheckIns.entries()) {
            if (!operatorsWithFirstBadge.has(callsign)) {
                newAwards.push({
                    call_sign: callsign,
                    badge_id: firstCheckinBadgeId,
                    session_id: firstCheckIn.session_id,
                });
            }
        }

        if (newAwards.length > 0) {
            console.log(`Backfilling ${newAwards.length} '${firstCheckinBadgeId}' badges...`);
            const { error: insertError } = await supabase.from('awarded_badges').insert(newAwards);

            if (insertError) {
                throw new Error(`Error inserting backfilled badges: ${insertError.message}`);
            }
            
            await refreshAllData();
        }
    } catch (error) {
        console.error("Error during badge backfill process:", error);
    }
  }, [refreshAllData]);
  
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

  useEffect(() => {
    const onSessionChange = async () => {
        try {
            setLoading(true);
            let userProfile: Profile | null = null;

            if (session?.user?.id) {
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) {
                    console.error("Error fetching user profile:", profileError);
                    handleApiError(profileError, 'fetch-profile');
                } else if (!profileData) {
                    console.warn(`Profile not found for user ${session.user.id}. Signing out.`);
                    await supabase.auth.signOut();
                    return;
                } else {
                    userProfile = profileData;
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

  useEffect(() => {
    // This effect sets up real-time listeners for database changes.
    // SessionScreen now handles its own check-in and session updates for better performance.
    const handleDelete = <T extends { id: string }>(payload: any, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
      setter(prev => prev.filter(item => item.id !== payload.old.id));
    };

    const netsChannel = supabase.channel('public:nets')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'nets' }, payload => {
        const newNet = transformNetPayload(payload.new as Database['public']['Tables']['nets']['Row']);
        setNets(prev => (prev.some(n => n.id === newNet.id) ? prev : [...prev, newNet].sort((a,b) => a.name.localeCompare(b.name))));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'nets' }, payload => {
        const updatedNet = transformNetPayload(payload.new as Database['public']['Tables']['nets']['Row']);
        setNets(prev => prev.map(n => n.id === updatedNet.id ? updatedNet : n));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'nets' }, payload => handleDelete<Net>(payload, setNets))
      .subscribe();

    // Global session listener for HomeScreen and NetDetailScreen updates
    const sessionsChannel = supabase.channel('public:sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
          // A full refresh is safer here to keep all screens in sync,
          // except for the active SessionScreen which manages its own state.
          refreshAllData();
      })
      .subscribe();
      
    // Global listener for awarded badges.
    const awardedBadgesChannel = supabase.channel('public:awarded_badges')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'awarded_badges' }, () => {
            // Because badge logic can be complex, a full refresh is safest for now.
            refreshAllData();
        })
        .subscribe();
    
    const rosterMembersChannel = supabase.channel('public:roster_members')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'roster_members' }, () => {
            refreshAllData();
        })
        .subscribe();

    return () => {
      supabase.removeChannel(netsChannel);
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(awardedBadgesChannel);
      supabase.removeChannel(rosterMembersChannel);
    };
  }, [refreshAllData, transformNetPayload]);


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

  const handleSaveNet = useCallback(async (netData: Partial<Net>) => {
    try {
        const { id } = netData;

        const commonPayload = {
            name: netData.name!,
            description: netData.description || null,
            website_url: netData.website_url || null,
            primary_nco: netData.primary_nco!,
            primary_nco_callsign: netData.primary_nco_callsign!,
            net_type: netData.net_type!,
            schedule: netData.schedule!,
            time: netData.time!,
            time_zone: netData.time_zone!,
            net_config_type: netData.net_config_type!,
            repeaters: (netData.net_config_type === NetConfigType.GROUP ? [] : (netData.repeaters ?? [])) as any,
            frequency: netData.net_config_type !== NetConfigType.GROUP ? null : netData.frequency || null,
            band: netData.net_config_type !== NetConfigType.GROUP ? null : netData.band || null,
            mode: netData.net_config_type !== NetConfigType.GROUP ? null : netData.mode || null,
            passcode: netData.passcode || null,
            passcode_permissions: (netData.passcode ? (netData.passcode_permissions ?? {}) : null) as any,
        };

        if (id) {
            const { error, data } = await supabase.from('nets').update(commonPayload).eq('id', id).select().single();
            if (error) throw error;
            if (!data) throw new Error("No data returned after update operation.");
            
            const updatedNet = transformNetPayload(data);
            setNets(prev => prev.map(n => n.id === updatedNet.id ? updatedNet : n));
            setView({ type: 'netDetail', netId: updatedNet.id });
        } else {
            if (!profile) throw new Error("User must be logged in to create a net.");
            
            const insertPayload: Database['public']['Tables']['nets']['Insert'] = {
                ...commonPayload,
                created_by: profile.id,
            };

            const { data, error } = await supabase.from('nets').insert(insertPayload).select().single();
            if (error) throw error;
            if (!data) throw new Error("No data returned after create operation.");

            const newNet = transformNetPayload(data);
            setNets(prev => [...prev, newNet].sort((a,b) => a.name.localeCompare(b.name)));
            setView({ type: 'netDetail', netId: newNet.id });
        }
    } catch (error: any) {
        handleApiError(error, 'handleSaveNet');
    }
  }, [profile, setView, transformNetPayload, handleApiError]);

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
  
  const handleStartSession = useCallback(async (netId: string) => {
    const netToStart = nets.find(n => n.id === netId);
    if (!netToStart) {
        console.error(`Could not find net with ID ${netId} to start session.`);
        alert("Error: Could not find the specified NET to start a session.");
        return;
    }

    try {
        const passcode = verifiedPasscodes[netToStart.id] || null;

        const { data, error } = await supabase.rpc('start_session', {
            p_net_id: netToStart.id,
            p_primary_nco: netToStart.primary_nco, // Use default from net
            p_primary_nco_callsign: netToStart.primary_nco_callsign, // Use default from net
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
  }, [nets, setView, handleApiError, verifiedPasscodes]);

  const handleEndSession = useCallback(async (sessionId: string, netId: string) => {
      if (view.type === 'session' && view.sessionId === sessionId) {
          setView({ type: 'netDetail', netId });
      }

      try {
        const passcode = verifiedPasscodes[netId] || null;

        const { data: updatedSessionData, error } = await supabase.rpc('end_session', {
            p_session_id: sessionId,
            p_passcode: passcode
        });
        
        if (error) throw error;
        if (!updatedSessionData) throw new Error("Failed to end session: No data returned from RPC.");

        const updatedSession = updatedSessionData as unknown as NetSession;
        
        setSessions(prev => prev.map(s => s.id === sessionId ? updatedSession : s));
      } catch (error: any) {
        handleApiError(error, 'handleEndSession');
      }
  }, [view, setView, handleApiError, verifiedPasscodes]);

  const handleEndSessionRequest = useCallback((sessionId: string, netId: string) => {
    requestConfirmation({
        title: 'Confirm End Session',
        message: 'Are you sure you want to end this net session?',
        confirmText: 'End Session',
        isDestructive: true,
        onConfirm: () => handleEndSession(sessionId, netId)
    });
  }, [handleEndSession, requestConfirmation]);

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
  
  const handleUpdateSessionNotes = useCallback(async (sessionId: string, notes: string) => {
    try {
        const { error } = await supabase.from('sessions').update({ notes }).eq('id', sessionId);
        if (error) throw error;
        setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, notes } : s));
    } catch (error: any) {
        handleApiError(error, 'handleUpdateSessionNotes');
    }
  }, [handleApiError]);

  const handleAddCheckIn = useCallback(async (sessionId: string, checkInData: Omit<Database['public']['Tables']['check_ins']['Insert'], 'session_id'>) => {
    try {
        const payload: Database['public']['Tables']['check_ins']['Insert'] = {
            session_id: sessionId,
            call_sign: checkInData.call_sign,
            name: checkInData.name,
            location: checkInData.location,
            notes: checkInData.notes,
            repeater_id: checkInData.repeater_id
        };

        const { data: newCheckInData, error: checkInError } = await supabase
            .from('check_ins')
            .insert(payload)
            .select()
            .single();

        if (checkInError || !newCheckInData) throw checkInError || new Error('No data returned from insert.');

        const newCheckIn = newCheckInData as CheckIn;
        setCheckIns(prev => [newCheckIn, ...prev]);

        const callSign = newCheckIn.call_sign;
        const { data: allUserCheckInsData, error: userCheckInsError } = await supabase.from('check_ins').select('*').eq('call_sign', callSign);
        if (userCheckInsError) throw userCheckInsError;

        const allUserCheckInsIncludingNew = allUserCheckInsData as CheckIn[];

        const { data: existingAwardsData, error: awardsError } = await supabase.from('awarded_badges').select('badge_id').eq('call_sign', callSign);
        if (awardsError) throw awardsError;

        const existingAwards = (existingAwardsData as Pick<AwardedBadge, 'badge_id'>[]) || [];
        const awardedBadgeIds = new Set(existingAwards.map(b => b.badge_id));

        const badgesToAward: Database['public']['Tables']['awarded_badges']['Insert'][] = [];
        const badgeLogicDefinitions = BADGE_DEFINITIONS;

        for (const badgeLogic of badgeLogicDefinitions) {
            try {
                if (!awardedBadgeIds.has(badgeLogic.id) && badgeLogic.isEarned(allUserCheckInsIncludingNew, sessions, newCheckIn)) {
                    badgesToAward.push({
                        call_sign: callSign,
                        badge_id: badgeLogic.id,
                        session_id: sessionId,
                    });
                }
            } catch (badgeError) {
                console.error(`[handleAddCheckIn] Error in badge logic for ${badgeLogic.id}:`, badgeError);
            }
        }

        if (badgesToAward.length > 0) {
            const { error: newBadgeError } = await supabase.from('awarded_badges').insert(badgesToAward);
            if (newBadgeError) throw newBadgeError;
        }
    } catch (error: any) {
        handleApiError(error, 'handleAddCheckIn');
    }
  }, [sessions, allBadges, handleApiError]);

  const handleEditCheckIn = useCallback((sessionId: string, checkIn: CheckIn) => {
    setEditingCheckIn({ sessionId, checkIn });
  }, []);

  const handleUpdateCheckIn = useCallback(async (updatedCheckIn: CheckIn) => {
    try {
        const { id, ...updateData } = updatedCheckIn;
        const payload: Database['public']['Tables']['check_ins']['Update'] = {
            call_sign: updateData.call_sign,
            name: updateData.name,
            location: updateData.location,
            notes: updateData.notes,
            repeater_id: updateData.repeater_id,
            session_id: updateData.session_id,
            timestamp: updateData.timestamp
        };
        const { error } = await supabase.from('check_ins').update(payload).eq('id', id);
        if (error) throw error;
        // The SessionScreen will update its own check-ins via its real-time subscription.
        setCheckIns(prev => prev.map(c => c.id === id ? updatedCheckIn : c));
        setEditingCheckIn(null);
    } catch (error: any) {
        handleApiError(error, 'handleUpdateCheckIn');
    }
  }, [handleApiError]);

  const handleDeleteCheckIn = useCallback(async (checkInId: string, netId: string) => {
    const checkIn = checkIns.find(ci => ci.id === checkInId);
    if (!checkIn) return;

    requestConfirmation({
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete the check-in for ${checkIn.call_sign}?`,
        confirmText: 'Delete',
        isDestructive: true,
        onConfirm: async () => {
            try {
                const passcode = verifiedPasscodes[netId] || null;
                const { error } = await supabase.rpc('delete_check_in', {
                    p_check_in_id: checkInId,
                    p_passcode: passcode,
                });

                if (error) throw error;
                
                setCheckIns(prev => prev.filter(c => c.id !== checkInId));
            } catch (error: any) {
                handleApiError(error, 'handleDeleteCheckIn');
            }
        }
    });
  }, [handleApiError, verifiedPasscodes, checkIns, requestConfirmation]);

  const handleSaveRosterMembers = useCallback(async (netId: string, members: Omit<RosterMember, 'id' | 'net_id' | 'created_at'>[]) => {
    try {
        // Delete all existing members for the net
        const { error: deleteError } = await supabase.from('roster_members').delete().eq('net_id', netId);
        if (deleteError) throw deleteError;

        // Insert new members if any
        if (members.length > 0) {
            const membersToInsert = members.map(m => ({ ...m, net_id: netId }));
            const { error: insertError } = await supabase.from('roster_members').insert(membersToInsert);
            if (insertError) throw insertError;
        }

        await refreshAllData();
        setView({ type: 'netDetail', netId: netId });
    } catch(error: any) {
        handleApiError(error, 'handleSaveRosterMembers');
    }
  }, [refreshAllData, handleApiError, setView]);
  

  const hasPermission = useMemo(() => {
    return (net: Net | null, permission: PermissionKey): boolean => {
        if (!profile || !net) return false;
        if (profile.role === 'admin') return true;
        if (net.created_by === profile.id) return true;
        return grantedPermissions[net.id]?.[permission] || false;
    };
  }, [profile, grantedPermissions]);

  const isNetManagedByUser = useCallback((net: Net): boolean => {
    if (!profile) return false;
    // An admin can manage everything.
    if (profile.role === 'admin') return true;
    // The owner can manage their own net.
    if (net.created_by === profile.id) return true;
    // Check for any delegated permissions via a verified passcode.
    const netPermissions = grantedPermissions[net.id];
    if (netPermissions && Object.keys(netPermissions).length > 0) {
        return true;
    }
    return false;
  }, [profile, grantedPermissions]);
  
  const allBadgeDefinitions = React.useMemo(() => {
    const logicMap = new Map(BADGE_DEFINITIONS.map(b => [b.id, b]));
    return allBadges.map(badge => ({
        ...badge,
        category: logicMap.get(badge.id)?.category || 'Special',
        isEarned: logicMap.get(badge.id)?.isEarned || (() => false),
        sortOrder: logicMap.get(badge.id)?.sortOrder || 999
    }));
  }, [allBadges]);

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
        // On success, the RPC returns the permissions object.
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
        // If data is null, the passcode was incorrect.
        setPasscodeError("Invalid passcode. Please try again.");
    }

    setIsVerifying(false);
  }, [verifyingPasscodeForNet]);


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
            onEditNet={(netId) => setView({ type: 'netEditor', netId })}
            onDeleteNet={handleDeleteNet}
            onAddNet={() => setView({ type: 'netEditor' })}
            onViewDetails={(netId) => setView({ type: 'netDetail', netId })}
            onEditRoster={(netId) => setView({ type: 'rosterEditor', netId })}
          />
        );
      }
      case 'netEditor': {
        // "Create new" flow
        if (!view.netId) {
          return (
            <NetEditorScreen
              initialNet={undefined}
              onSave={handleSaveNet}
              onCancel={goBack}
            />
          );
        }

        // "Edit existing" flow
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
        const netForPerms = sessionForPerms ? nets.find(n => n.id === sessionForPerms.net_id) : null;
        const netRosterMembers = netForPerms ? rosterMembers.filter(rm => rm.net_id === netForPerms.id) : [];
        return (
          <SessionScreen
            sessionId={view.sessionId}
            allBadges={allBadges}
            awardedBadges={awardedBadges}
            rosterMembers={netRosterMembers}
            profile={profile}
            hasPermission={(permission) => hasPermission(netForPerms, permission)}
            onEndSession={handleEndSession}
            onAddCheckIn={handleAddCheckIn}
            onEditCheckIn={handleEditCheckIn}
            onDeleteCheckIn={handleDeleteCheckIn}
            onBack={goBack}
            onUpdateSessionNotes={handleUpdateSessionNotes}
            onViewCallsignProfile={(callsign) => setView({ type: 'callsignProfile', callsign })}
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
            <CallsignProfileScreen
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
      default:
        setView({ type: 'home' });
        return <div className="text-center py-20 text-dark-text-secondary">Redirecting...</div>;
    }
  };

  const getNetForSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session ? nets.find(n => n.id === session.net_id) : undefined;
  };
  
  const getNetForCheckIn = () => {
      if (!editingCheckIn) return undefined;
      return getNetForSession(editingCheckIn.sessionId);
  }

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
      <Footer onSetView={setView} />
    </div>
  );
};

export default App;
