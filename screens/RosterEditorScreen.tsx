
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Net, RosterMember } from '../types';
import { Icon } from '../components/Icon';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/Button';

interface RosterEditorScreenProps {
    net: Net;
    initialMembers: RosterMember[];
    onSave: (netId: string, members: Omit<RosterMember, 'id' | 'net_id' | 'created_at'>[]) => void;
    onCancel: () => void;
    onViewCallsignProfile: (callsign: string) => void;
}

const FormInput = ({ label, id, ...props }: {label: string, id: string} & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-dark-text-secondary mb-1">
            {label}
        </label>
        <input id={id} {...props} className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11" />
    </div>
);

type ClientRosterMember = Omit<RosterMember, 'id'> & { client_id: string; id?: string };

const RosterEditorScreen: React.FC<RosterEditorScreenProps> = ({ net, initialMembers, onSave, onCancel, onViewCallsignProfile }) => {
    const [members, setMembers] = useState<ClientRosterMember[]>(initialMembers.map(m => ({ ...m, client_id: m.id || uuidv4() })));

    const [newMember, setNewMember] = useState({ call_sign: '', name: '', location: '' });
    const [isLookingUp, setIsLookingUp] = useState(false);

    useEffect(() => {
        const lookupName = async () => {
            const callSign = newMember.call_sign.trim().toUpperCase();
            if (!callSign || callSign.length < 3) {
                return;
            }

            setIsLookingUp(true);
            try {
                const { data, error } = await supabase
                    .from('callsigns')
                    .select('first_name, last_name')
                    .eq('callsign', callSign)
                    .order('license_id', { ascending: false })
                    .limit(1);
                
                if (error) {
                    console.warn(`Callsign lookup for ${callSign} failed:`, error.message);
                    return;
                }

                const typedData = data as unknown as ({ first_name: string | null; last_name: string | null; }[] | null);

                if (typedData && typedData.length > 0) {
                    setNewMember(prev => ({...prev, name: `${typedData[0].first_name ?? ''} ${typedData[0].last_name ?? ''}`.trim() }));
                }
            } catch (err) {
                console.error("An unexpected error occurred during callsign lookup:", err);
            } finally {
                setIsLookingUp(false);
            }
        };

        const timer = setTimeout(() => {
            lookupName();
        }, 300); // Debounce API call

        return () => clearTimeout(timer);
    }, [newMember.call_sign]);

    const handleAddMember = () => {
        const callsignToAdd = newMember.call_sign.trim().toUpperCase();
        if (!callsignToAdd) {
            alert("Callsign cannot be empty.");
            return;
        }

        if (members.some(m => m.call_sign === callsignToAdd)) {
            alert(`${callsignToAdd} is already in the roster.`);
            return;
        }

        setMembers(prev => [...prev, {
            ...newMember,
            call_sign: callsignToAdd,
            client_id: uuidv4(),
            net_id: net.id,
            created_at: new Date().toISOString(),
            id: undefined, // ensure it matches the ClientRosterMember type
        }]);
        setNewMember({ call_sign: '', name: '', location: '' });
        document.getElementById('new-callsign')?.focus();
    };

    const handleRemoveMember = (clientId: string) => {
        setMembers(prev => prev.filter(m => m.client_id !== clientId));
    };

    const handleNewMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let finalValue = value;
        if (name === 'call_sign') {
            finalValue = value.toUpperCase();
        }
        setNewMember(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleNewMemberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent submitting the main form
            handleAddMember();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const membersToSave = members.map(m => ({ call_sign: m.call_sign, name: m.name || null, location: m.location || null }));
        onSave(net.id, membersToSave);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Manage Roster</h1>
            <p className="font-semibold text-dark-text mb-6">{net.name}</p>

            <form onSubmit={handleSubmit} className="bg-dark-800 p-6 sm:p-8 rounded-lg shadow-xl space-y-8">
                <p className="text-md text-dark-text-secondary mb-4">Create a roster of stations that regularly attend this net for faster check-ins on your session log.</p>
                <fieldset>
                    <legend className="text-lg font-medium text-dark-text mb-4">Members ({members.length})</legend>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {members.length > 0 ? members.map(member => (
                            <div key={member.client_id} className="p-3 bg-dark-700 rounded-md flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <button
                                        type="button"
                                        onClick={() => onViewCallsignProfile(member.call_sign)}
                                        className="font-semibold text-brand-accent hover:underline"
                                    >
                                        {member.call_sign}
                                    </button>
                                    <p className="text-md text-dark-text">
                                    {member.name}
                                    {member.location && (
                                        <span className="text-dark-text-secondary"> - {member.location}</span>
                                    )}
                                    </p>
                                </div>
                                <button type="button" onClick={() => handleRemoveMember(member.client_id)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full hover:bg-red-500/10" aria-label="Remove member">
                                    <Icon>delete</Icon>
                                </button>
                            </div>
                        )) : (
                            <p className="text-center text-dark-text-secondary py-4">This roster is empty. Add members below.</p>
                        )}
                    </div>
                </fieldset>
                
                 <fieldset className="border-t border-dark-700 pt-6">
                    <legend className="text-lg font-medium text-dark-text mb-4">Add New Member</legend>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                             <FormInput label="Call Sign" id="new-callsign" name="call_sign" value={newMember.call_sign} onChange={handleNewMemberChange} onKeyDown={handleNewMemberKeyDown} />
                        </div>
                         <div className="md:col-span-1">
                            <FormInput label="Name" id="new-name" name="name" value={newMember.name} onChange={handleNewMemberChange} onKeyDown={handleNewMemberKeyDown} />
                        </div>
                        <div className="md:col-span-1">
                            <FormInput label="Location" id="new-location" name="location" value={newMember.location} onChange={handleNewMemberChange} onKeyDown={handleNewMemberKeyDown} />
                        </div>
                        <div className="md:col-span-1">
                            <button type="button" onClick={handleAddMember} className="w-full h-11 flex items-center justify-center gap-2 text-sm font-medium text-brand-accent hover:text-yellow-400 transition-colors bg-dark-700 rounded-md">
                                <Icon>add</Icon>
                                <span>Add to Roster</span>
                            </button>
                        </div>
                    </div>
                </fieldset>

                <div className="flex justify-end gap-4 pt-4 border-t border-dark-700">
                    <Button type="button" onClick={onCancel} variant="secondary" size="lg">Cancel</Button>
                    <Button type="submit" size="lg">
                        Save Roster
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default RosterEditorScreen;
