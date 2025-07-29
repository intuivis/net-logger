







import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Net, NetSession, CheckIn, Profile, NetConfigType, AwardedBadge, Badge as BadgeType, DayOfWeek, Repeater, NetType, PermissionKey, PasscodePermissions, RosterMember, CheckInInsertPayload, Json, CheckInStatus, CheckInStatusValue } from '../types';
import { Icon } from '../components/Icon';
import { formatRepeaterCondensed } from '../lib/time';
import { supabase } from '../lib/supabaseClient'; // import to access supabase functions
import { Badge } from '../components/Badge';
import { Database } from '../database.types';
import { NCOBadge } from '../components/NCOBadge';

interface SessionScreenProps {
  sessionId: string;
  allBadges: BadgeType[];
  awardedBadges: AwardedBadge[];
  rosterMembers: RosterMember[];
  profile: Profile | null;
  hasPermission: (permission: PermissionKey) => boolean;
  onEndSessionRequest: (sessionId: string, netId: string) => void;
  onAddCheckIn: (sessionId: string, netId: string, checkIn: CheckInInsertPayload) => Promise<void>;
  onEditCheckIn: (sessionId: string, checkIn: CheckIn) => void;
  onDeleteCheckIn: (checkIn: CheckIn, netId: string) => void;
  onUpdateCheckInStatus: (checkInId: string, netId: string, status: CheckInStatusValue) => void;
  onBack: () => void;
  onUpdateSessionNotes: (sessionId: string, notes: string) => Promise<void>;
  onViewCallsignProfile: (callsign: string) => void;
}

const FormInput = ({ label, id, ...props }: {label: string, id: string} & React.InputHTMLAttributes<HTMLInputElement>) => (
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

const FormSelect = ({ label, id, children, ...props }: {label: string, id: string, children: React.ReactNode} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
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

const REPEATER_STORAGE_KEY = (net: Net) => `selectedRepeater_${net.id}`;

const CheckInForm: React.FC<{ net: Net, checkIns: CheckIn[], onAdd: (checkIn: CheckInInsertPayload) => Promise<void> }> = ({ net, checkIns, onAdd }) => {
    const [callSign, setCallSign] = useState('');
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [isLookingUp, setIsLookingUp] = useState(false);
    const showRepeaterSelect = net.net_config_type === NetConfigType.LINKED_REPEATER;

    const [repeaterId, setRepeaterId] = useState(() => {
        if (showRepeaterSelect) {
            return localStorage.getItem(REPEATER_STORAGE_KEY(net)) || '';
        }
        return '';
    });

    React.useEffect(() => {
        if (showRepeaterSelect) {
            localStorage.setItem(REPEATER_STORAGE_KEY(net), repeaterId);
        }
    }, [repeaterId, net, showRepeaterSelect]);

    React.useEffect(() => {
        const lookupName = async () => {
            if (!callSign || callSign.length < 3) {
                return;
            }

            setIsLookingUp(true);
            try {
                const { data, error } = await supabase
                    .from('callsigns')
                    .select('first_name, last_name')
                    .eq('callsign', callSign.trim().toUpperCase())
                    .order('license_id', { ascending: false })
                    .limit(1);
                
                if (error) {
                    console.warn(`Callsign lookup for ${callSign} failed:`, error.message);
                    return;
                }

                const typedData = data as unknown as ({ first_name: string | null; last_name: string | null; }[] | null);

                if (typedData && typedData.length > 0) {
                    setName(`${typedData[0].first_name ?? ''} ${typedData[0].last_name ?? ''}`.trim());
                }
            } catch (err) {
                console.error("An unexpected error occurred during callsign lookup:", err);
            } finally {
                setIsLookingUp(false);
            }
        };

        lookupName();
    }, [callSign, setName]);


const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedCallsign = callSign.trim().toUpperCase();

        if (!trimmedCallsign) {
            alert("Call Sign cannot be empty.");
            return;
        }

        if (checkIns.some(ci => ci.call_sign.trim().toUpperCase() === trimmedCallsign)) {
            alert(`${trimmedCallsign} has already checked into this session.`);
            return;
        }
        
        const checkInData = {
            call_sign: trimmedCallsign,
            name: name || null,
            location: location || null,
            notes: notes || null,
            repeater_id: (showRepeaterSelect && repeaterId) ? repeaterId : null
        };

        try {
            await onAdd(checkInData);
            setCallSign('');
            setName('');
            setLocation('');
            setNotes('');
            document.getElementById('callSign')?.focus();
        } catch (error) {
            // The error is handled by the `handleApiError` in App.tsx.
            // We catch it here to prevent the form from being cleared on failure.
        }
    };

    const gridCols = showRepeaterSelect ? 'lg:grid-cols-6' : 'lg:grid-cols-5';

    return (
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 bg-dark-800 shadow-lg rounded-lg">
            <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-4 items-end`}>
                {showRepeaterSelect && (
                    <div className="lg:col-span-1">
                        <FormSelect label="Repeater" id="repeaterId" value={repeaterId} onChange={e => setRepeaterId(e.target.value)}>
                            <option value="">Select...</option>
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
                         <button type="submit" className="flex-shrink-0 px-4 py-2 h-11 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-dark-800">
                            Log It
                         </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

const getStatusStyles = (status: CheckInStatusValue | null | undefined, isActive: boolean) => {
    switch (status) {
        case CheckInStatus.NEW:
            return { rowClass: 'text-dark-text-secondary', callsignClass: '', iconClass: 'text-dark-text-secondary' };
        case CheckInStatus.ACKNOWLEDGED:
            return { rowClass: '', callsignClass: 'text-brand-accent', iconClass: 'text-brand-accent' };
        case CheckInStatus.ATTENTION:
            return { 
                rowClass: isActive ? 'bg-yellow-500/10' : '',
                callsignClass: '',
                iconClass: 'text-yellow-400'
            };
        case CheckInStatus.QUESTION:
            return { 
                rowClass: isActive ? 'bg-blue-500/10' : '',
                callsignClass: '',
                iconClass: 'text-blue-400'
            };
        default:
            return { rowClass: '', callsignClass: '', iconClass: 'text-dark-text-secondary' };
    }
};

const getStatusIcon = (status: CheckInStatusValue | null | undefined): string => {
    switch (status) {
        case CheckInStatus.NEW:
            return 'check_box_outline_blank'; // Square
        case CheckInStatus.ACKNOWLEDGED:
            return 'check_box'; // Check Mark
        case CheckInStatus.ATTENTION:
            return 'asterisk'; // Asterisk
        case CheckInStatus.QUESTION:
            return 'help_outline'; // Question Mark
        default:
            return 'check_box_outline_blank'; // Fallback
    }
};

const SessionScreen: React.FC<SessionScreenProps> = ({ sessionId, allBadges, awardedBadges, rosterMembers, profile, hasPermission, onEndSessionRequest, onAddCheckIn, onEditCheckIn, onDeleteCheckIn, onUpdateCheckInStatus, onBack, onUpdateSessionNotes, onViewCallsignProfile }) => {
  const [session, setSession] = useState<NetSession | null>(null);
  const [net, setNet] = useState<Net | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'log' | 'roster'>('log');

  const [sessionNotes, setSessionNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const fetchSessionData = useCallback(async () => {
    try {
        setLoading(true);
        const { data: sessionData, error: sessionError } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

        if (sessionError || !sessionData) throw new Error(sessionError?.message || 'Session not found.');
        const currentSession = sessionData as unknown as NetSession;
        
        const { data: netData, error: netError } = await supabase
            .from('nets')
            .select('*')
            .eq('id', currentSession.net_id)
            .single();

        if (netError || !netData) throw new Error(netError?.message || 'Associated NET not found.');
        const currentNetData = netData as unknown as Database['public']['Tables']['nets']['Row'];
        
        const { data: checkInData, error: checkInError } = await supabase
            .from('check_ins')
            .select('*')
            .eq('session_id', sessionId)
            .order('timestamp', { ascending: false });

        if (checkInError) throw new Error(checkInError.message);
        
        const transformedNet: Net = {
            id: currentNetData.id,
            created_by: currentNetData.created_by,
            name: currentNetData.name,
            description: currentNetData.description,
            website_url: currentNetData.website_url,
            primary_nco: currentNetData.primary_nco,
            primary_nco_callsign: currentNetData.primary_nco_callsign,
            net_type: currentNetData.net_type as NetType,
            schedule: currentNetData.schedule as DayOfWeek,
            time: currentNetData.time,
            time_zone: currentNetData.time_zone,
            net_config_type: (currentNetData.net_config_type as NetConfigType) || NetConfigType.SINGLE_REPEATER,
            repeaters: (currentNetData.repeaters as unknown as Repeater[]) || [],
            frequency: currentNetData.frequency,
            band: currentNetData.band,
            mode: currentNetData.mode,
            passcode: currentNetData.passcode || null,
            passcode_permissions: (currentNetData.passcode_permissions as unknown as PasscodePermissions | null),
        };

        setSession(currentSession);
        setNet(transformedNet);
        setCheckIns((checkInData as unknown as CheckIn[]) || []);
        setSessionNotes(currentSession.notes || '');
        setError(null);
    } catch (err: any) {
        console.error("Error fetching session data:", err);
        setError(err.message);
    } finally {
        setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionData();

    const channel = supabase.channel(`session-${sessionId}`);

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'check_ins',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setCheckIns(prev => [payload.new as unknown as CheckIn, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'check_ins',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setCheckIns(prev => prev.map(c => c.id === payload.new.id ? payload.new as unknown as CheckIn : c));
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'check_ins',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        setCheckIns(prev => prev.filter(c => c.id !== (payload.old as any).id));
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`
      }, (payload) => {
        const newSession = payload.new as unknown as NetSession;
        setSession(newSession);
        if (newSession.notes !== undefined) {
          setSessionNotes(newSession.notes || '');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchSessionData]);

  const isActive = useMemo(() => session?.end_time === null, [session]);
  
  const canLogContacts = hasPermission('logContacts');
  const canManageSession = hasPermission('manageSessions');

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await onUpdateSessionNotes(sessionId, sessionNotes);
    setIsSavingNotes(false);
  };
  
  const handleStatusClick = (checkIn: CheckIn) => {
    if (!net) return;
    const currentStatus = checkIn.status_flag ?? 0;
    // Cycle from 0 -> 1 -> 2 -> 3 -> 1
    const nextStatus = currentStatus === CheckInStatus.QUESTION 
        ? CheckInStatus.ACKNOWLEDGED 
        : (currentStatus + 1) as CheckInStatusValue;
    onUpdateCheckInStatus(checkIn.id, net.id, nextStatus);
  };

  const sortedCheckIns = useMemo(() => {
    const sorted = [...checkIns].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    if (isActive) {
        return sorted.reverse();
    }
    return sorted;
  }, [checkIns, isActive]);

  const handleAdd = useCallback(async (checkInData: CheckInInsertPayload) => {
    if (!net) return;
    await onAddCheckIn(sessionId, net.id, checkInData);
  }, [sessionId, net, onAddCheckIn]);
  
  const handleEnd = () => {
    if (net) {
        onEndSessionRequest(sessionId, net.id);
    }
  }

    const checkedInCallsigns = useMemo(() => new Set(checkIns.map(ci => ci.call_sign)), [checkIns]);

    const handleRosterCheckIn = (member: RosterMember) => {
        if (!net) return;
        const repeaterId = net.net_config_type === NetConfigType.LINKED_REPEATER
            ? localStorage.getItem(REPEATER_STORAGE_KEY(net))
            : null;
        
        onAddCheckIn(sessionId, net.id, {
            call_sign: member.call_sign,
            name: member.name,
            location: member.location,
            notes: null,
            repeater_id: repeaterId
        });
    };

  if (loading) return <div className="text-center py-20 text-dark-text-secondary">Loading Session...</div>;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  if (!session || !net) return <div className="text-center py-20">Session not found.</div>;
  
  const showRepeaterColumn = net.net_config_type === NetConfigType.LINKED_REPEATER;
  const tableColSpan = 8 + (showRepeaterColumn ? 1 : 0) + (canLogContacts ? 1 : 0);

  return (
    <div className="space-y-6">
       <button onClick={onBack} className="flex items-center gap-2 text-md font-semibold text-dark-text-secondary hover:text-dark-text transition-colors">
          <Icon className="text-xl">arrow_back</Icon>
          <span>Back to {net.name} Details</span>
      </button>

      <div className="bg-dark-800 shadow-lg rounded-lg p-5 sm:p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                 <div className="flex items-center gap-4 mb-1">
                    <h1 className="text-3xl font-bold text-dark-text">{isActive ? net.name : "Session Log"}</h1>
                    {isActive && (
                        <div className="flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full bg-green-500/20 text-green-300">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span>Live</span>
                        </div>
                    )}
                </div>
                <p className="text-dark-text-secondary">
                    {isActive 
                        ? `Session started at ${new Date(session.start_time).toLocaleString()}`
                        : `For ${net.name} on ${new Date(session.start_time).toLocaleDateString()}`
                    }
                </p>
                <p className="text-dark-text-secondary mt-1">Net Control: <span className="text-dark-text font-semibold">{session.primary_nco} ({session.primary_nco_callsign})</span></p>
            </div>
            {canManageSession && isActive && (
                <button
                    onClick={handleEnd}
                    className="px-6 py-2.5 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-dark-800 transition-transform transform hover:scale-105"
                >
                    End Session
                </button>
            )}
        </div>
      </div>

      { canLogContacts || (session.notes && session.notes.trim() !== '') ? (
        <div className="bg-dark-800 shadow-lg rounded-lg p-5 sm:p-6 space-y-4">
            <h3 className="text-xl font-bold text-dark-text">Session Notes</h3>
            <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                rows={5}
                placeholder="Capture general notes for the session..."
                disabled={isSavingNotes || !canLogContacts}
            />
            {canLogContacts && (
                <div className="flex justify-end">
                    <button
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary disabled:bg-gray-500 disabled:cursor-wait"
                    >
                        {isSavingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                </div>
            )}
        </div>
      ) : null }
      
      {canLogContacts && isActive && <CheckInForm net={net} checkIns={checkIns} onAdd={handleAdd} />}
      
      <div className="bg-dark-800 shadow-lg rounded-lg overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-dark-700">
          <div className="flex justify-between items-center">
              <div>
                  <h3 className="text-xl font-bold text-dark-text">Check-in Log</h3>
                  <p className="text-sm text-dark-text-secondary">Total Check-ins: {checkIns.length}</p>
              </div>
              {isActive && canLogContacts && rosterMembers.length > 0 && (
                 <div className="flex items-center p-1 bg-dark-700 rounded-lg">
                    <button onClick={() => setActiveTab('roster')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'roster' ? 'bg-dark-900 text-dark-text' : 'text-dark-text-secondary hover:text-dark-text'}`}>Roster</button>
                    <button onClick={() => setActiveTab('log')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === 'log' ? 'bg-dark-900 text-dark-text' : 'text-dark-text-secondary hover:text-dark-text'}`}>Live Log</button>
                </div>
              )}
          </div>
        </div>
        
        {activeTab === 'log' && (
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-700">
                  <thead className="bg-dark-700/50">
                      <tr>
                          <th scope="col" className="px-2 py-4 text-center text-xs font-medium text-dark-text-secondary uppercase tracking-wider"> </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">#</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Time</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Call Sign</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Awards</th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Location</th>
                          {showRepeaterColumn && <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Repeater</th>}
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Notes</th>
                          {canLogContacts && <th scope="col" className="relative px-6 py-4">
                              <span className="sr-only">Actions</span>
                          </th>}
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                      {sortedCheckIns.length === 0 ? (
                          <tr>
                              <td colSpan={tableColSpan} className="px-6 py-12 text-center text-dark-text-secondary">
                                  {isActive && canLogContacts ? 'Waiting for first check-in...' : 'No check-ins have been logged yet.'}
                              </td>
                          </tr>
                      ) : (
                          sortedCheckIns.map((checkIn, index) => {
                              const repeater = showRepeaterColumn ? net.repeaters.find(r => r.id === checkIn.repeater_id) : null;
                              const itemNumber = isActive ? (checkIns.length - index) : (index + 1);
                              const newlyAwarded = awardedBadges.filter(ab => ab.session_id === sessionId && ab.call_sign === checkIn.call_sign);
                              const isNCO = checkIn.call_sign === session.primary_nco_callsign;
                              const { rowClass, callsignClass, iconClass } = getStatusStyles(checkIn.status_flag, isActive);

                              return (
                                  <tr key={checkIn.id} className={`transition-colors ${rowClass} ${checkIn.status_flag > 0 ? '' : 'hover:bg-dark-700/30'}`}>
                                      <td className="px-2 py-2 whitespace-nowrap text-center">
                                          {canLogContacts && isActive ? (
                                              <button onClick={() => handleStatusClick(checkIn)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white rounded-full hover:bg-white/10" aria-label="Cycle Status">
                                                  <Icon className={`text-xl ${iconClass}`}>{getStatusIcon(checkIn.status_flag)}</Icon>
                                              </button>
                                          ) : (
                                              <div className="w-10 h-10 flex items-center justify-center">
                                                  <Icon className={`text-xl ${iconClass}`}>{getStatusIcon(checkIn.status_flag)}</Icon>
                                              </div>
                                          )}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">{itemNumber}</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(checkIn.timestamp).toLocaleTimeString()}</td>
                                      <td className={`px-4 py-2 text-sm font-bold ${callsignClass}`}>
                                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                                              <button onClick={() => onViewCallsignProfile(checkIn.call_sign)} className="hover:underline">
                                                  {checkIn.call_sign}
                                              </button>
                                              {isNCO && <NCOBadge />}
                                          </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm">{checkIn.name}</td>
                                      <td className="px-4 py-2 whitespace-nowrap">
                                          <div className="flex items-center gap-2">
                                              {newlyAwarded.map(award => {
                                                  const badgeDef = allBadges.find(b => b.id === award.badge_id);
                                                  return badgeDef ? <Badge key={award.id} badge={badgeDef} variant="pill" size="sm" /> : null;
                                              })}
                                          </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm">{checkIn.location}</td>
                                      {showRepeaterColumn && <td className="px-6 py-4 whitespace-nowrap text-sm">{repeater ? `${repeater.name ?? '-'} - ${repeater.downlink_freq ?? '-'}` : '-'}</td>}
                                      <td className="px-4 py-2 whitespace-nowrap text-sm">{checkIn.notes}</td>
                                      {canLogContacts && isActive && (
                                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                              <div className="flex items-center justify-end gap-1">
                                                  <button onClick={() => onEditCheckIn(sessionId, checkIn)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-accent rounded-full hover:bg-white/10" aria-label="Edit Check-in">
                                                      <Icon className="text-xl">edit</Icon>
                                                  </button>
                                                  <button onClick={() => onDeleteCheckIn(checkIn, net.id)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10" aria-label="Delete Check-in">
                                                      <Icon className="text-xl">delete</Icon>
                                                  </button>
                                              </div>
                                          </td>
                                      )}
                                  </tr>
                              );
                          })
                      )}
                  </tbody>
              </table>
          </div>
        )}
        {activeTab === 'roster' && (
            <div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-700">
                        <thead className="bg-dark-700/50">
                           <tr>
                                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Call Sign</th>
                                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-2 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Location</th>
                                <th scope="col" className="relative px-6 py-2"><span className="sr-only">Action</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700">
                            {rosterMembers.map(member => {
                                const isCheckedIn = checkedInCallsigns.has(member.call_sign);
                                return (
                                    <tr key={member.id} className={`${isCheckedIn ? 'bg-green-900/20' : 'hover:bg-dark-700/30'}`}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-dark-text">{member.call_sign}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-dark-text-secondary">{member.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-dark-text-secondary">{member.location}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleRosterCheckIn(member)}
                                                disabled={isCheckedIn}
                                                className="px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:bg-green-800/50 disabled:text-green-300/80 disabled:cursor-not-allowed bg-brand-primary hover:bg-brand-secondary text-white"
                                            >
                                                {isCheckedIn ? 'Logged' : 'Check In'}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </div>
    </div>
  );
};

export default SessionScreen;