
import React, { useState, useCallback, useEffect } from 'react';
import { Net, NetSession, View, CheckIn, Profile, NetType, DayOfWeek, Repeater, NetConfigType } from './types';
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

const App: React.FC = () => {
  const [view, setView] = useState<View>({ type: 'home' });
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nets, setNets] = useState<Net[]>([]);
  const [sessions, setSessions] = useState<NetSession[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  
  const [loading, setLoading] = useState(true);

  const [editingCheckIn, setEditingCheckIn] = useState<{ sessionId: string; checkIn: CheckIn } | null>(null);
  const [startingNet, setStartingNet] = useState<Net | null>(null);

  const refreshAllData = useCallback(async () => {
    try {
        const [netsRes, sessionsRes, checkInsRes] = await Promise.all([
            supabase.from('nets').select('*').order('name'),
            supabase.from('sessions').select('*').order('start_time', { ascending: false }),
            supabase.from('check_ins').select('*').order('timestamp', { ascending: false })
        ]);

        if (netsRes.error) throw netsRes.error;
        if (sessionsRes.error) throw sessionsRes.error;
        if (checkInsRes.error) throw checkInsRes.error;

        const rawNets = (netsRes.data as any[]) || [];
        const typedNets: Net[] = rawNets.map(n => ({
            ...n,
            net_type: n.net_type as NetType,
            schedule: n.schedule as DayOfWeek,
            net_config_type: n.net_config_type as NetConfigType,
            repeaters: (Array.isArray(n.repeaters) ? n.repeaters : []) as unknown as Repeater[],
        }));
        
        setNets(typedNets);
        setSessions((sessionsRes.data as any[]) || []);
        setCheckIns((checkInsRes.data as any[]) || []);
    } catch (error) {
        console.error("Error refreshing application data:", error);
        alert('Could not load application data. Please check your connection and refresh the page.');
    }
  }, []);
  
  // Effect 1: Sync session with Supabase auth state.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Effect 2: React to session changes to fetch profile and all app data.
  // This is now robust against errors and guarantees loading state is cleared.
  useEffect(() => {
    const onSessionChange = async () => {
      try {
        setLoading(true);
        let userProfile: Profile | null = null;
        
        if (session?.user?.id) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (error || !data) {
                console.warn("Could not fetch user profile. This could be a new user or a stale session. Signing out.", error);
                await supabase.auth.signOut();
                return; // Let the sign-out flow (which triggers a re-run of this effect) handle the rest.
            }
            userProfile = data;
        }
        
        setProfile(userProfile);
        await refreshAllData();
      } catch (error) {
        console.error("An unexpected error occurred during session processing:", error);
        alert("An unexpected error occurred. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    onSessionChange();
  }, [session, refreshAllData]);

  // Effect 3: Handle view routing and redirection based on auth state and profile.
  useEffect(() => {
    if (loading) return; // Wait for auth and data load to complete

    if (session && profile) { // Authenticated and profile loaded
        if (!profile.is_approved && profile.role !== 'admin') {
            if (view.type !== 'pendingApproval') {
                setView({ type: 'pendingApproval' });
            }
        } else if (['login', 'register', 'pendingApproval'].includes(view.type)) {
            setView({ type: 'home' });
        }
    } else if (!session) { // Not authenticated
        const publicViews: Array<View['type']> = ['home', 'login', 'register', 'netDetail', 'session'];
        if (!publicViews.includes(view.type)) {
            // Preserve public views if user logs out, otherwise go to login
             if(view.type !== 'netDetail' && view.type !== 'session') {
                setView({ type: 'login' });
             }
        }
    }
  }, [view.type, session, profile, loading]);

  const handleSaveNet = useCallback(async (netData: Partial<Net>) => {
    try {
        const { id, ...updateData } = netData;
        
        const sanitizedData: Omit<typeof updateData, 'id'> & {created_by?: string} = { ...updateData };
        if (sanitizedData.description === '') sanitizedData.description = null;
        if (sanitizedData.website_url === '') sanitizedData.website_url = null;
        if (sanitizedData.backup_nco === '') sanitizedData.backup_nco = null;
        if (sanitizedData.backup_nco_callsign === '') sanitizedData.backup_nco_callsign = null;

        // Based on the config type, null out irrelevant fields
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
            const updatePayload = {
                ...finalUpdateData,
                repeaters: finalUpdateData.repeaters as unknown as Json,
            };
            result = await supabase.from('nets').update(updatePayload).eq('id', id).select('id').single();
        } else {
            if (!profile) throw new Error("User must be logged in to create a net.");
            
            sanitizedData.created_by = profile.id;
            const insertPayload = {
                ...sanitizedData,
                repeaters: sanitizedData.repeaters as unknown as Json,
            };

            result = await supabase.from('nets').insert(insertPayload).select('id').single();
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
  }, [refreshAllData, profile]);

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
  }, [refreshAllData]);

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

        const { data, error } = await supabase.from('sessions').insert(payload).select().single();
        
        if (error) throw error;
        if (!data) throw new Error("Failed to create session.");
        
        await refreshAllData();
        setStartingNet(null);
        setView({ type: 'session', sessionId: (data as any).id });
    } catch (error: any) {
        console.error("Error starting session:", error);
        alert(`Failed to start session: ${error.message}`);
    }
  }, [refreshAllData]);

  const handleEndSession = useCallback(async (sessionId: string, netId: string) => {
    const endedTime = new Date().toISOString();
    const originalSessions = [...sessions];

    setSessions(prevSessions =>
      prevSessions.map(s =>
        s.id === sessionId ? { ...s, end_time: endedTime } : s
      )
    );
    // If the current view is the session screen, navigate away.
    if (view.type === 'session' && view.sessionId === sessionId) {
        setView({ type: 'netDetail', netId });
    }

    try {
      const updatePayload = { end_time: endedTime };
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
  }, [refreshAllData, sessions, view.type]);

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

  const handleAddCheckIn = useCallback(async (sessionId: string, checkInData: Omit<CheckIn, 'id' | 'timestamp' | 'session_id'>) => {
    try {
        const payload: Database['public']['Tables']['check_ins']['Insert'] = { ...checkInData, session_id: sessionId };
        const { error } = await supabase.from('check_ins').insert(payload);
        if (error) throw error;
        await refreshAllData();
    } catch (error: any) {
        console.error("Error adding check-in:", error);
        alert(`Failed to add check-in: ${error.message}`);
    }
  }, [refreshAllData]);

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

  const renderContent = () => {
    if (loading) {
      return <div className="text-center py-20 text-dark-text-secondary">Loading...</div>;
    }
    
    switch (view.type) {
      case 'login':
          return <LoginScreen onSetView={setView} />;
      case 'register':
          return <RegisterScreen onSetView={setView} />;
      case 'pendingApproval':
          return <PendingApprovalScreen email={profile?.email || session?.user?.email || null} onSetView={setView} />;
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
            onCancel={() => view.netId ? setView({ type: 'netDetail', netId: view.netId }) : setView({ type: 'manageNets' })}
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
                onBack={() => profile ? setView({ type: 'manageNets' }) : setView({ type: 'home' })}
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
            profile={profile}
            onEndSession={handleEndSession}
            onAddCheckIn={handleAddCheckIn}
            onEditCheckIn={handleEditCheckIn}
            onDeleteCheckIn={handleDeleteCheckIn}
            onBack={() => setView({ type: 'netDetail', netId: net.id })}
            onUpdateSessionNotes={handleUpdateSessionNotes}
          />
        );
      }
      case 'adminApprovals': {
        if (profile?.role !== 'admin') {
            return <div className="text-center py-20">Access Denied.</div>;
        }
        return <AdminApprovalScreen />;
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
        {renderContent()}
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