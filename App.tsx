
import React, { useState, useCallback, useEffect } from 'react';
import { Net, NetSession, View, CheckIn, Profile, NetType, DayOfWeek, Repeater, NetConfigType, AwardedBadge, BadgeDefinition, Badge } from './types';
import HomeScreen from './screens/HomeScreen';
import ManageNetsScreen from './screens/ManageNetsScreen';
import NetEditorScreen from './screens/NetEditorScreen';
import SessionScreen from './screens/SessionScreen';
import NetDetailScreen from './screens/NetDetailScreen';
import Header from './components/Header';
import EditCheckInModal from './components/EditCheckInModal';
import StartSessionModal from './components/StartSessionModal';
import { supabase } from './lib/supabaseClient';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import PendingApprovalScreen from './screens/PendingApprovalScreen';
import AdminApprovalScreen from './screens/AdminApprovalScreen';
import { Session } from '@supabase/supabase-js';
import { Database } from './database.types';
import { Json } from './database.types';
import { BADGE_DEFINITIONS } from './lib/badges';
import CallsignProfileScreen from './screens/CallSignProfileScreen';
import { v4 as uuidv4 } from 'uuid';
import AboutScreen from './screens/AboutScreen';
import AwardsScreen from './screens/AwardsScreen';

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
  
  const [loading, setLoading] = useState(true);

  const [editingCheckIn, setEditingCheckIn] = useState<{ sessionId: string; checkIn: CheckIn } | null>(null);
  const [startingNet, setStartingNet] = useState<Net | null>(null);

  const goBack = useCallback(() => {
      setViewHistory(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const setView = useCallback((newView: View) => {
      setViewHistory(prev => {
          const currentView = prev[prev.length - 1];
          if (JSON.stringify(newView) === JSON.stringify(currentView)) return prev;

          // Navigating to a main screen from the header should reset the stack
          if (['home', 'login', 'register', 'manageNets', 'adminApprovals', 'about', 'awards'].includes(newView.type)) {
              return [newView];
          }
          
          return [...prev, newView];
      });
  }, []);

  const refreshAllData = useCallback(async () => {
    try {
        const [netsRes, sessionsRes, checkInsRes, awardedBadgesRes, allBadgesRes] = await Promise.all([
            supabase.from('nets').select('*').order('name'),
            supabase.from('sessions').select('*').order('start_time', { ascending: false }),
            supabase.from('check_ins').select('*').order('timestamp', { ascending: false }),
            supabase.from('awarded_badges').select('*'),
            supabase.from('badges').select('*'),
        ]);

        if (netsRes.error) throw new Error(`Failed to load NETs: ${netsRes.error.message}`);
        if (sessionsRes.error) throw new Error(`Failed to load sessions: ${sessionsRes.error.message}`);
        if (checkInsRes.error) throw new Error(`Failed to load check-ins: ${checkInsRes.error.message}`);
        if (awardedBadgesRes.error) throw new Error(`Failed to load awarded badges: ${awardedBadgesRes.error.message}`);
        if (allBadgesRes.error) throw new Error(`Failed to load badge definitions: ${allBadgesRes.error.message}`);

        const rawNets = (netsRes.data as Database['public']['Tables']['nets']['Row'][]) || [];
        
        const typedNets: Net[] = rawNets.map((n): Net => {
            let migratedRepeaters: Repeater[] = [];
            
            if (Array.isArray(n.repeaters)) {
                const repeatersArray = n.repeaters as any[];
                if (repeatersArray.length > 0 && repeatersArray[0] && repeatersArray[0].frequency !== undefined) {
                    migratedRepeaters = repeatersArray.map((r: any): Repeater => {
                        const offset = r.tone_offset === 'plus' ? '+0.600' : r.tone_offset === 'minus' ? '-0.600' : null;
                        return {
                            id: r.id || uuidv4(),
                            name: r.name || 'Imported Repeater',
                            owner_callsign: null,
                            grid_square: null,
                            county: null,
                            downlink_freq: r.frequency || '',
                            offset: offset,
                            uplink_tone: r.tone || null,
                            downlink_tone: r.tone || null,
                            website_url: null,
                        };
                    });
                } else {
                    migratedRepeaters = repeatersArray as Repeater[];
                }
            }

            return {
                ...n,
                net_type: n.net_type as NetType,
                schedule: n.schedule as DayOfWeek,
                net_config_type: (n.net_config_type as NetConfigType) || NetConfigType.SINGLE_REPEATER,
                repeaters: migratedRepeaters,
            };
        });
        
        setNets(typedNets);
        setSessions((sessionsRes.data as NetSession[]) || []);
        setCheckIns((checkInsRes.data as CheckIn[]) || []);
        setAllBadges((allBadgesRes.data as Badge[]) || []);
        setAwardedBadges((awardedBadgesRes.data as AwardedBadge[]) || []);
    } catch (error: any) {
        console.error("Error refreshing application data:", error);

        let alertMessage = `Could not load application data. Please check your connection and refresh the page.\n\nDetails: ${error.message}`;

        if (error.message && error.message.includes('Failed to fetch')) {
            alertMessage = `A network error occurred while trying to connect to the database. This can happen if you are offline or if the Supabase URL in lib/config.ts is incorrect.

Please verify your internet connection and ensure your Supabase credentials are set correctly.`;
        }
    
        alert(alertMessage);
    }
  }, []);

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
                    alert("A problem occurred while loading your profile. The app may not function correctly. Please check your connection and refresh.");
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
            alert("An unexpected error occurred. Please refresh the page.");
        } finally {
            setLoading(false);
        }
    };

    onSessionChange();
  }, [session, refreshAllData, backfillBadges]);

  useEffect(() => {
    if (loading) return;

    if (session && profile) {
        if (!profile.is_approved && profile.role !== 'admin') {
            if (view.type !== 'pendingApproval') {
                setView({ type: 'pendingApproval' });
            }
        } else if (['login', 'register', 'pendingApproval'].includes(view.type)) {
            setView({ type: 'home' });
        }
    } else if (!session) {
        const publicViews: Array<View['type']> = ['home', 'login', 'register', 'netDetail', 'session', 'callsignProfile', 'about', 'awards'];
        if (!publicViews.includes(view.type)) {
             setView({ type: 'login' });
        }
    }
  }, [view, session, profile, loading, setView]);

  const handleSaveNet = useCallback(async (netData: Partial<Net>) => {
    try {
        const { id, ...updateData } = netData;
        
        const sanitizedData: Omit<typeof updateData, 'id'> & {created_by?: string} = { ...updateData };
        if (sanitizedData.description === '') sanitizedData.description = null;
        if (sanitizedData.website_url === '') sanitizedData.website_url = null;
        if (sanitizedData.backup_nco === '') sanitizedData.backup_nco = null;
        if (sanitizedData.backup_nco_callsign === '') sanitizedData.backup_nco_callsign = null;

        if(sanitizedData.net_config_type === NetConfigType.GROUP) {
            sanitizedData.repeaters = [];
        } else {
            sanitizedData.frequency = null;
            sanitizedData.band = null;
            sanitizedData.mode = null;
        }

        let result;

        if (id) {
            const { created_by, ...finalUpdateData } = sanitizedData;
            const updatePayload: Database['public']['Tables']['nets']['Update'] = {
                ...finalUpdateData,
                repeaters: finalUpdateData.repeaters,
            };
            result = await supabase.from('nets').update(updatePayload).eq('id', id).select('id').single();
        } else {
            if (!profile) throw new Error("User must be logged in to create a net.");
            
            const { repeaters, ...restData } = sanitizedData;
            const insertPayload: Database['public']['Tables']['nets']['Insert'] = {
                name: restData.name!,
                created_by: profile.id,
                description: restData.description ?? null,
                website_url: restData.website_url ?? null,
                primary_nco: restData.primary_nco!,
                primary_nco_callsign: restData.primary_nco_callsign!,
                backup_nco: restData.backup_nco ?? null,
                backup_nco_callsign: restData.backup_nco_callsign ?? null,
                net_type: restData.net_type!,
                schedule: restData.schedule!,
                time: restData.time!,
                time_zone: restData.time_zone!,
                repeaters: sanitizedData.repeaters ?? [],
                net_config_type: restData.net_config_type!,
                frequency: restData.frequency ?? null,
                band: restData.band ?? null,
                mode: restData.mode ?? null,
            };

            result = await supabase.from('nets').insert([insertPayload]).select('id').single();
        }

        if (result.error) throw result.error;
        if (!result.data?.id) throw new Error("No data returned after save operation.");
        
        const newNetId = result.data.id;
        await refreshAllData();
        setView({ type: 'netDetail', netId: newNetId });
    } catch (error: any) {
        console.error("Error saving NET:", error);
        alert(`Failed to save NET: ${error.message}`);
    }
  }, [refreshAllData, profile, setView]);

  const handleDeleteNet = useCallback(async (netId: string) => {
    if (window.confirm('Are you sure you want to delete this NET and all its sessions? This cannot be undone.')) {
        try {
            const { error } = await supabase.from('nets').delete().eq('id', netId);
            if (error) throw error;
            await refreshAllData();
            setView({ type: 'manageNets' });
        } catch(error: any) {
             console.error("Error deleting NET:", error);
             alert(`Failed to delete NET: ${error.message}`);
        }
    }
  }, [refreshAllData, setView]);

  const handleStartSessionRequest = useCallback((netId: string) => {
    const netToStart = nets.find(n => n.id === netId);
    if(netToStart) setStartingNet(netToStart);
  }, [nets]);
  
  const handleConfirmStartSession = useCallback(async (net: Net, overrides: Partial<NetSession>) => {
    try {
        const payload: Database['public']['Tables']['sessions']['Insert'] = {
          net_id: net.id,
          primary_nco: overrides.primary_nco || net.primary_nco,
          primary_nco_callsign: overrides.primary_nco_callsign || net.primary_nco_callsign,
          backup_nco: overrides.backup_nco || net.backup_nco,
          backup_nco_callsign: overrides.backup_nco_callsign || net.backup_nco_callsign,
        };

        const { data, error } = await supabase.from('sessions').insert([payload]).select().single();
        
        if (error) throw error;
        if (!data) throw new Error("Failed to create session.");
        
        await refreshAllData();
        setStartingNet(null);
        setView({ type: 'session', sessionId: data.id });
    } catch (error: any) {
        console.error("Error starting session:", error);
        alert(`Failed to start session: ${error.message}`);
    }
  }, [refreshAllData, setView]);

  const handleEndSession = useCallback(async (sessionId: string, netId: string) => {
    const endedTime = new Date().toISOString();
    const originalSessions = [...sessions];

    setSessions(prevSessions =>
      prevSessions.map(s =>
        s.id === sessionId ? { ...s, end_time: endedTime } : s
      )
    );
    if (view.type === 'session' && view.sessionId === sessionId) {
        setView({ type: 'netDetail', netId });
    }

    try {
      const updatePayload: Database['public']['Tables']['sessions']['Update'] = { end_time: endedTime };
      const { error } = await supabase
        .from('sessions')
        .update(updatePayload)
        .eq('id', sessionId);

      if (error) {
        setSessions(originalSessions);
        alert(`Failed to end session: ${error.message}`);
        throw error;
      }
      
      await refreshAllData();
    } catch (error) {
      console.error("Error ending session:", error);
    }
  }, [refreshAllData, sessions, view.type, setView]);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this session and its log?')) {
        try {
            const { error } = await supabase.from('sessions').delete().eq('id', sessionId);
            if (error) throw error;
            await refreshAllData();
        } catch (error: any) {
            console.error("Error deleting session:", error);
            alert(`Failed to delete session: ${error.message}`);
        }
    }
  }, [refreshAllData]);
  
  const handleUpdateSessionNotes = useCallback(async (sessionId: string, notes: string) => {
    try {
        const { error } = await supabase.from('sessions').update({ notes }).eq('id', sessionId);
        if (error) throw error;
        await refreshAllData();
    } catch (error: any) {
        console.error("Error updating session notes:", error);
        alert(`Failed to save notes: ${error.message}`);
    }
  }, [refreshAllData]);

  const handleAddCheckIn = useCallback(async (sessionId: string, checkInData: Omit<Database['public']['Tables']['check_ins']['Insert'], 'session_id'>) => {
    try {
        const { data: newCheckInData, error: checkInError } = await supabase
            .from('check_ins')
            .insert([{ ...checkInData, session_id: sessionId }])
            .select()
            .single();
            
        if (checkInError || !newCheckInData) throw checkInError || new Error("Failed to create check-in");
        
        const newCheckIn = newCheckInData as CheckIn;

        const callSign = newCheckIn.call_sign;
        
        const allUserCheckInsIncludingNew = [...checkIns.filter(ci => ci.call_sign === callSign), newCheckIn];

        const { data: existingAwardsData, error: awardsError } = await supabase.from('awarded_badges').select('badge_id').eq('call_sign', callSign);
        if (awardsError) throw awardsError;
        const existingAwards = (existingAwardsData as Pick<AwardedBadge, 'badge_id'>[]) || [];
        
        const awardedBadgeIds = new Set(existingAwards.map(b => b.badge_id));
        
        const badgesToAward: Database['public']['Tables']['awarded_badges']['Insert'][] = [];
        
        const badgeLogicDefinitions = BADGE_DEFINITIONS;

        for (const badgeLogic of badgeLogicDefinitions) {
            if (!awardedBadgeIds.has(badgeLogic.id) && badgeLogic.isEarned(allUserCheckInsIncludingNew, sessions, newCheckIn)) {
                badgesToAward.push({
                    call_sign: callSign,
                    badge_id: badgeLogic.id,
                    session_id: sessionId,
                });
            }
        }
        
        if (badgesToAward.length > 0) {
            const { error: newBadgeError } = await supabase.from('awarded_badges').insert(badgesToAward);
            if (newBadgeError) throw newBadgeError;
            
            const badgeNames = badgesToAward.map(b => allBadges.find(def => def.id === b.badge_id)?.name || b.badge_id).join(', ');
            alert(`Congratulations! ${callSign} unlocked new badge(s): ${badgeNames}`);
        }

        await refreshAllData();
    } catch (error: any) {
        console.error("Error adding check-in and awarding badges:", error);
        alert(`Failed to add check-in: ${error.message}`);
    }
  }, [refreshAllData, checkIns, sessions, allBadges]);

  const handleEditCheckIn = useCallback((sessionId: string, checkIn: CheckIn) => {
    setEditingCheckIn({ sessionId, checkIn });
  }, []);

  const handleUpdateCheckIn = useCallback(async (updatedCheckIn: CheckIn) => {
    try {
        const { id, ...updateData } = updatedCheckIn;
        const payload: Database['public']['Tables']['check_ins']['Update'] = updateData;
        const { error } = await supabase.from('check_ins').update(payload).eq('id', id);
        if (error) throw error;
        await refreshAllData();
        setEditingCheckIn(null);
    } catch (error: any) {
        console.error("Error updating check-in:", error);
        alert(`Failed to update check-in: ${error.message}`);
    }
  }, [refreshAllData]);

  const handleDeleteCheckIn = useCallback(async (checkInId: string) => {
    if (window.confirm('Are you sure you want to delete this check-in?')) {
        try {
            const { error } = await supabase.from('check_ins').delete().eq('id', checkInId);
            if (error) throw error;
            await refreshAllData();
        } catch (error: any) {
            console.error("Error deleting check-in:", error);
            alert(`Failed to delete check-in: ${error.message}`);
        }
    }
  }, [refreshAllData]);
  
  const allBadgeDefinitions = React.useMemo(() => {
    const logicMap = new Map(BADGE_DEFINITIONS.map(b => [b.id, b]));
    return allBadges.map(badge => ({
        ...badge,
        category: logicMap.get(badge.id)?.category || 'Special',
        isEarned: logicMap.get(badge.id)?.isEarned || (() => false),
        sortOrder: logicMap.get(badge.id)?.sortOrder || 999
    }));
  }, [allBadges]);

  const renderContent = () => {
    switch (view.type) {
      case 'login':
          return <LoginScreen onSetView={setView} />;
      case 'register':
          return <RegisterScreen onSetView={setView} />;
      case 'pendingApproval':
          return <PendingApprovalScreen email={profile?.email || session?.user?.email || null} onSetView={setView} />;
      case 'about':
          return <AboutScreen />;
      case 'awards':
          return <AwardsScreen allBadgeDefinitions={allBadgeDefinitions} />;
      case 'home': {
        const activeSessions = sessions.filter(s => s.end_time === null);
        return (
            <HomeScreen 
                activeSessions={activeSessions}
                nets={nets}
                checkIns={checkIns}
                onViewSession={(sessionId) => setView({ type: 'session', sessionId })}
                onViewNetDetails={(netId) => setView({ type: 'netDetail', netId })}
                profile={profile}
            />
        );
      }
      case 'manageNets': {
         const managedNets = nets.filter(n => profile?.role === 'admin' || n.created_by === profile?.id)
         return (
          <ManageNetsScreen
            nets={managedNets}
            sessions={sessions}
            profile={profile}
            onStartSession={handleStartSessionRequest}
            onEditNet={(netId) => setView({ type: 'netEditor', netId })}
            onDeleteNet={handleDeleteNet}
            onAddNet={() => setView({ type: 'netEditor' })}
            onViewDetails={(netId) => setView({ type: 'netDetail', netId })}
          />
        );
      }
      case 'netEditor': {
        const netToEdit = nets.find(n => n.id === view.netId);
        if(view.netId && netToEdit?.created_by !== profile?.id && profile?.role !== 'admin') {
            return <div className="text-center py-20">Access Denied. You do not own this NET.</div>;
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
                onStartSession={() => handleStartSessionRequest(view.netId)}
                onEndSession={handleEndSession}
                onEditNet={() => setView({ type: 'netEditor', netId: view.netId })}
                onDeleteNet={() => handleDeleteNet(view.netId)}
                onViewSession={(sessionId) => setView({ type: 'session', sessionId })}
                onBack={goBack}
                onDeleteSession={handleDeleteSession}
            />
        );
      }
      case 'session': {
        const sessionData = sessions.find(s => s.id === view.sessionId);
        if (!sessionData) return <div className="text-center py-20">Session not found.</div>;
        const net = nets.find(n => n.id === sessionData.net_id);
        if (!net) return <div className="text-center py-20">Associated NET not found.</div>;
        const sessionCheckIns = checkIns.filter(ci => ci.session_id === view.sessionId);
        return (
          <SessionScreen
            session={sessionData}
            net={net}
            checkIns={sessionCheckIns}
            allBadges={allBadges}
            awardedBadges={awardedBadges}
            profile={profile}
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
      case 'adminApprovals': {
        if (profile?.role !== 'admin') {
            return <div className="text-center py-20">Access Denied.</div>;
        }
        return <AdminApprovalScreen onSetView={setView}/>;
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
    <div className="min-h-screen bg-light-bg dark:bg-dark-900 text-light-text dark:text-dark-text">
      <Header profile={profile} onSetView={setView} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
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
      {startingNet && (
        <StartSessionModal 
            net={startingNet}
            onStart={handleConfirmStartSession}
            onClose={() => setStartingNet(null)}
        />
      )}
    </div>
  );
};

export default App;