
import React, { useState } from 'react';
import { Icon } from './Icon';
import { Profile, View } from '../types';
import { supabase } from '../lib/supabaseClient';
//import { AuthSessionMissingError } from '@supabase/supabase-js';
import {LogoSignal} from './icons/LogoSignal';

interface HeaderProps {
    profile: Profile | null;
    onSetView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ profile, onSetView }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleNavClick = (view: View) => {
        onSetView(view);
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        setIsMenuOpen(false);

        const { error } = await supabase.auth.signOut();

        if (error) {
            // This can happen if the session is already expired.
            // The most robust way to ensure the user is in a logged-out state
            // is to reload the page. This will clear all React state and force
            // the app to re-check the session from scratch, breaking any loops.
            console.error('Error during sign out, forcing reload:', error.message);
            window.location.reload();
        }
        
        // If sign-out is successful, the onAuthStateChange listener handles the redirect.
        // We only reach here if there was no error. In case the component doesn't
        // unmount right away, we reset the loading state.
        setIsLoggingOut(false);
    };

    return (
        <header className="bg-light-card dark:bg-dark-800 shadow-md sticky top-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Title */}
                    <button onClick={() => handleNavClick({ type: 'home' })} className="flex items-center space-x-2 group">
                    <LogoSignal className="w-8 h-8 text-white" />
                        <h1 className="text-xl font-bold tracking-tight text-light-text dark:text-dark-text transition-colors">
                            NetControl <span className="text-xs font-light text-light uppercase">Beta</span>
                        </h1>
                    </button>
                    
                    {/* --- Desktop Navigation --- */}
                    <nav className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => handleNavClick({ type: 'about' })}
                            className="px-4 py-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            About
                        </button>
                         <button
                            onClick={() => handleNavClick({ type: 'awards' })}
                            className="px-4 py-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            Awards
                        </button>
                        {profile ? (
                            <>
                                {profile.role === 'admin' && (
                                     <button
                                        onClick={() => handleNavClick({type: 'userManagement'})}
                                        className="px-4 py-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors"
                                    >
                                        User Management
                                    </button>
                                )}
                                {(profile.is_approved || profile.role === 'admin') && (
                                    <button
                                        onClick={() => handleNavClick({type: 'manageNets'})}
                                        className="px-4 py-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors"
                                    >
                                        Manage NETs
                                    </button>
                                )}
                                <span className="text-sm text-dark-text-secondary hidden sm:block">
                                    {profile.email}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="px-4 py-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
                                >
                                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleNavClick({ type: 'login' })}
                                    className="px-4 py-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text bg-dark-700/50 hover:bg-dark-700 rounded-lg transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => handleNavClick({ type: 'register' })}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </nav>
                    
                    {/* --- Mobile Menu Button --- */}
                    <div className="md:hidden flex items-center">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="inline-flex items-center justify-center p-2 rounded-md text-dark-text-secondary hover:text-dark-text hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary"
                            aria-expanded={isMenuOpen}
                            aria-controls="mobile-menu"
                            aria-label="Open main menu"
                        >
                            <Icon>{isMenuOpen ? 'close' : 'menu'}</Icon>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Mobile Menu Panel --- */}
            {isMenuOpen && (
                <nav className="md:hidden border-t border-dark-700" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                       <button
                            onClick={() => handleNavClick({ type: 'about' })}
                            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-dark-text hover:bg-dark-700"
                        >
                            About
                        </button>
                        <button
                            onClick={() => handleNavClick({ type: 'awards' })}
                            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-dark-text hover:bg-dark-700"
                        >
                            Awards
                        </button>
                       {profile ? (
                            <>
                                {profile.role === 'admin' && (
                                     <button
                                        onClick={() => handleNavClick({type: 'userManagement'})}
                                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-dark-text hover:bg-dark-700"
                                    >
                                        User Management
                                    </button>
                                )}
                                {(profile.is_approved || profile.role === 'admin') && (
                                    <button
                                        onClick={() => handleNavClick({type: 'manageNets'})}
                                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-dark-text hover:bg-dark-700"
                                    >
                                        Manage NETs
                                    </button>
                                )}
                                <div className="px-3 py-3 my-1 border-y border-dark-700 text-sm text-dark-text-secondary text-center">
                                    Signed in as <span className="font-semibold text-dark-text">{profile.email}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-dark-text hover:bg-dark-700 disabled:opacity-50"
                                >
                                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleNavClick({ type: 'login' })}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-dark-text hover:bg-dark-700"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => handleNavClick({ type: 'register' })}
                                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white bg-brand-primary hover:bg-brand-secondary"
                                >
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                </nav>
            )}
        </header>
    );
};

export default Header;
