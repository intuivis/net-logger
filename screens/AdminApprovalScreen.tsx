

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile, View } from '../types';
import { Database } from '../database.types';
import { Icon } from '../components/Icon';

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
            setProfiles((data as Profile[]) || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleApprovalToggle = async (profile: Profile) => {
        setUpdatingProfileId(profile.id);
        const payload = { is_approved: !profile.is_approved };
        const { error } = await supabase
            .from('profiles')
            .update(payload)
            .eq('id', profile.id);

        if (error) {
            alert('Failed to update profile: ' + error.message);
        } else {
            await fetchProfiles(); // Refresh the list
        }
        setUpdatingProfileId(null);
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
                <h1 className="text-3xl font-bold tracking-tight">NCO Management</h1>
                <p className="text-dark-text-secondary mt-1">View all registered Net Control Operators and manage their access.</p>
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
                                <th scope="col" className="relative px-6 py-4"><span className="sr-only">Action</span></th>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-md">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.is_approved ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                            {profile.is_approved ? 'Active' : 'Revoked'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-md font-medium">
                                        <button 
                                            onClick={() => handleApprovalToggle(profile)}
                                            disabled={updatingProfileId === profile.id}
                                            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-wait ${profile.is_approved ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                        >
                                            {updatingProfileId === profile.id ? 'Updating...' : (profile.is_approved ? 'Revoke Access' : 'Reinstate Access')}
                                        </button>
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