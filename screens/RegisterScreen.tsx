
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { View } from '../types';

interface RegisterScreenProps {
    onSetView: (view: View) => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSetView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [callSign, setCallSign] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        // The user's profile will be created automatically by a database trigger.
        // We just need to sign them up and pass their details in the options.
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // This data is stored in auth.users.raw_user_meta_data
                // and will be used by our database trigger to populate the profile.
                data: {
                    full_name: fullName,
                    call_sign: callSign.toUpperCase(),
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
        } else {
            // Success! The trigger will handle profile creation.
            setMessage('Registration successful! Please check your email to confirm this email for your account. After confirmation, an admin must approve your account before you can log in.');
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
            <div className="w-full max-w-md p-8 space-y-8 bg-dark-800 rounded-lg shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold text-center text-dark-text">Create a new account</h2>
                     <p className="mt-2 text-center text-sm text-dark-text-secondary">
                        Already have an account?{' '}
                        <button onClick={() => onSetView({type: 'login'})} className="font-medium text-brand-secondary hover:text-brand-primary">
                          Sign in
                        </button>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    {error && <div className="p-3 bg-red-500/20 text-red-400 rounded-md text-sm">{error}</div>}
                    {message && <div className="p-3 bg-green-500/20 text-green-400 rounded-md text-sm">{message}</div>}
                    <div className="space-y-4 rounded-md shadow-sm">
                         <div>
                            <label htmlFor="register-email" className="block text-sm font-medium text-dark-text-secondary mb-1">
                                Email
                            </label>
                            <input id="register-email" name="email" type="email" autoComplete="email" required className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                         </div>
                         <div>
                            <label htmlFor="register-password" className="block text-sm font-medium text-dark-text-secondary mb-1">
                                Password
                            </label>
                            <input id="register-password" name="password" type="password" required className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                         </div>
                         <div>
                            <label htmlFor="register-full-name" className="block text-sm font-medium text-dark-text-secondary mb-1">
                                Full Name
                            </label>
                            <input id="register-full-name" name="full_name" type="text" required className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                         </div>
                         <div>
                            <label htmlFor="register-call-sign" className="block text-sm font-medium text-dark-text-secondary mb-1">
                                Call Sign
                            </label>
                            <input id="register-call-sign" name="call_sign" type="text" className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11" placeholder="Call Sign" value={callSign} onChange={(e) => setCallSign(e.target.value.toUpperCase())} />
                         </div>
                    </div>
                    <div>
                        <button type="submit" disabled={loading || !!message} className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-dark-800 disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterScreen;
