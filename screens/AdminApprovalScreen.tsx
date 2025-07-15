
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types';
import { Database } from '../database.types';

const AdminApprovalScreen: React.FC = () => {
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
            setProfiles((data as any[]) || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleApprovalToggle = async (profile: Profile) => {
        setUpdatingProfileId(profile.id);
        const payload: Database['public']['Tables']['profiles']['Update'] = { is_approved: !profile.is_approved };
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
    
    if (loading) {
        return <div className="text-center py-20 text-dark-text-secondary">Loading Users...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">User Approvals</h1>
            
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
                                <tr key={profile.id} className="hover:bg-dark-700/30">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">{profile.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{profile.full_name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text-secondary">{profile.call_sign || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${profile.is_approved ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                                            {profile.is_approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleApprovalToggle(profile)}
                                            disabled={updatingProfileId === profile.id}
                                            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-wait ${profile.is_approved ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                                        >
                                            {updatingProfileId === profile.id ? 'Updating...' : (profile.is_approved ? 'Revoke' : 'Approve')}
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

export default AdminApprovalScreen;
