import React, { useState } from 'react';
import { Profile } from '../types';
import { Icon } from '../components/Icon';

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

interface SettingsScreenProps {
    profile: Profile;
    onUpdateProfile: (data: { full_name: string; call_sign: string; location: string; }) => Promise<void>;
    onUpdateEmail: (email: string) => Promise<void>;
    onUpdatePassword: (password: string) => Promise<void>;
    onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ profile, onUpdateProfile, onUpdateEmail, onUpdatePassword, onBack }) => {
    // State for profile info
    const [fullName, setFullName] = useState(profile.full_name || '');
    const [callSign, setCallSign] = useState(profile.call_sign || '');
    const [location, setLocation] = useState(profile.location || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // State for email
    const [email, setEmail] = useState(profile.email || '');
    const [isSavingEmail, setIsSavingEmail] = useState(false);

    // State for password
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        await onUpdateProfile({ full_name: fullName, call_sign: callSign, location: location });
        setIsSavingProfile(false);
    };
    
    const handleEmailSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingEmail(true);
        await onUpdateEmail(email);
        setIsSavingEmail(false);
    }

    const handlePasswordSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }
        setIsSavingPassword(true);
        await onUpdatePassword(newPassword);
        setIsSavingPassword(false);
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button onClick={onBack} className="flex items-center gap-2 text-md font-semibold text-dark-text-secondary hover:text-dark-text transition-colors">
                <Icon className="text-xl">arrow_back</Icon>
                <span>Back to Profile</span>
            </button>
            <h1 className="text-4xl font-bold tracking-tight">Account Settings</h1>

            <div className="space-y-12">
                {/* Profile Info Form */}
                <form onSubmit={handleProfileSave} className="bg-dark-800 p-6 sm:p-8 rounded-lg shadow-xl space-y-6">
                    <h3 className="text-xl font-bold text-dark-text">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput label="Full Name" id="fullName" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                        <FormInput label="Call Sign" id="callSign" type="text" value={callSign} onChange={e => setCallSign(e.target.value.toUpperCase())} required />
                    </div>
                     <div className="grid grid-cols-1">
                        <FormInput label="Location (e.g., City, State)" id="location" type="text" value={location} onChange={e => setLocation(e.target.value)} />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSavingProfile} className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary disabled:opacity-50">
                            {isSavingProfile ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>

                {/* Email Form */}
                 <form onSubmit={handleEmailSave} className="bg-dark-800 p-6 sm:p-8 rounded-lg shadow-xl space-y-6">
                    <h3 className="text-xl font-bold text-dark-text">Update Email</h3>
                    <div>
                        <FormInput label="Email Address" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                        <p className="text-sm text-dark-text-secondary mt-2">A verification link will be sent to the new email address to confirm the change.</p>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSavingEmail} className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary disabled:opacity-50">
                            {isSavingEmail ? 'Saving...' : 'Update Email'}
                        </button>
                    </div>
                </form>

                {/* Password Form */}
                <form onSubmit={handlePasswordSave} className="bg-dark-800 p-6 sm:p-8 rounded-lg shadow-xl space-y-6">
                    <h3 className="text-xl font-bold text-dark-text">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput label="New Password" id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Must be at least 6 characters" />
                        <FormInput label="Confirm New Password" id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSavingPassword || !newPassword} className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary disabled:opacity-50">
                            {isSavingPassword ? 'Saving...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsScreen;