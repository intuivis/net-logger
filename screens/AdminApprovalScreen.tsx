
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile, View } from '../types';
import { Icon } from '../components/Icon';
import Button from '../components/Button';

interface UserManagementScreenProps {
    onSetView: (view: View) => void;
}

const UserManagementScreen: React.FC<UserManagementScreenProps> = ({ onSetView }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingProfileId, setUpdatingProfileId] = useState<string | null>(null);


    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('email');
        
        if (error) {
            console.error(error);
            setError('Failed to load user profiles.');
        } else {
            setProfiles((data as unknown as Profile[]) || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleToggleApproval = async (profileToUpdate: Profile) => {
        setUpdatingProfileId(profileToUpdate.id);
        const newStatus = !profileToUpdate.is_approved;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ is_approved: newStatus })
                .eq('id', profileToUpdate.id)
                .select()
                .single();
            
            if (error) throw error;

            setProfiles(prevProfiles => 
                prevProfiles.map(p => p.id === profileToUpdate.id ? (data as unknown as Profile) : p)
            );

        } catch (err: any) {
             console.error("Failed to update user status:", err);
             setError(`Error updating ${profileToUpdate.call_sign || profileToUpdate.email}: ${err.message}`);
        } finally {
            setUpdatingProfileId(null);
        }
    };


    const handleViewProfile = (callsign: string | null) => {
        if(callsign) {
            onSetView({ type: 'callsignProfile', callsign });
        }
    }
    
    if (loading) {
        return <div className="text-center py-20 text-dark-text-secondary">Loading Users...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Net Control User Management</h1>
                <p className="text-dark-text-secondary mt-1">Approve or revoke access for registered Net Control Stations.</p>
            </div>
            
            <div className="bg-dark-800 shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-dark-700">
                        <thead className="bg-dark-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Call Sign</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-dark-text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-dark-700">
                             {profiles.filter(p => p.role !== 'admin').map(profile => (
                                <tr key={profile.id} className={`hover:bg-dark-700/30 transition-colors`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-md font-medium text-dark-text">{profile.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-md text-dark-text-secondary">{profile.full_name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-md text-dark-text">
                                        <button
                                          onClick={() => handleViewProfile(profile.call_sign)}
                                          className="flex items-center gap-1.5 hover:text-brand-accent transition-colors disabled:text-dark-text-secondary disabled:cursor-not-allowed"
                                          disabled={!profile.call_sign}
                                          title={profile.call_sign ? `View profile for ${profile.call_sign}`: ''}
                                        >
                                            <span>{profile.call_sign || '-'}</span>
                                            {profile.call_sign && <Icon className="text-sm">person</Icon>}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {profile.is_approved ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-300">
                                                Approved
                                            </span>
                                        ) : (
                                             <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-300">
                                                Revoked
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <Button
                                            onClick={() => handleToggleApproval(profile)}
                                            disabled={updatingProfileId === profile.id}
                                            variant={profile.is_approved ? 'destructive' : 'success'}
                                        >
                                            {updatingProfileId === profile.id ? 'Updating...' : (profile.is_approved ? 'Revoke' : 'Approve')}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagementScreen;
