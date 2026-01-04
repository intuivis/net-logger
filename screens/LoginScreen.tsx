
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { View } from '../types';
import Button from '../components/Button';

interface LoginScreenProps {
  onSetView: (view: View) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSetView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    }
    // No need to call onSetView here. The onAuthStateChange listener in App.tsx will handle it.
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-dark-800 rounded-lg shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-center text-dark-text">Sign in to your account</h2>
          <p className="mt-2 text-center text-md text-dark-text-secondary">
            Or{' '}
            <button onClick={() => onSetView({type: 'register'})} className="font-medium text-brand-secondary hover:text-brand-primary">
              Create a New Account
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="p-3 bg-red-500/20 text-red-400 rounded-md text-sm">{error}</div>}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="block text-md font-medium text-dark-text-secondary mb-1">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-md font-medium text-dark-text-secondary mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm h-11"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              size="xl"
              fullWidth
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
