
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { Profile, View } from '../types';
import { supabase } from '../lib/supabaseClient';
import { LogoSignal } from './icons/LogoSignal';

interface HeaderProps {
    profile: Profile | null;
    onSetView: (view: View) => void;
}

const DropdownMenuItem: React.FC<{
    icon: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}> = ({ icon, label, onClick, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-dark-text-secondary hover:bg-dark-700 hover:text-dark-text transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
        <Icon className="text-xl w-5 text-center">{icon}</Icon>
        <span>{label}</span>
    </button>
);


const Header: React.FC<HeaderProps> = ({ profile, onSetView }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNavClick = (view: View) => {
        onSetView(view);
        setIsMenuOpen(false);
        setIsProfileMenuOpen(false);
    };

    const handleLogout = async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        setIsProfileMenuOpen(false);

        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error('Error during sign out, forcing reload:', error.message);
            window.location.reload();
        }
        
        setIsLoggingOut(false);
    };

    return (
        <header className="bg-light-card dark:bg-dark-800 shadow-md sticky top-0 z-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                    {/* Logo and Title */}
                    <button onClick={() => handleNavClick({ type: 'home' })} className="flex items-center space-x-2 group">
                        <LogoSignal className="w-8 h-8 text-white" />
                        <h1 className="text-xl font-bold tracking-tight text-light-text dark:text-dark-text transition-colors">
                            NetControl <span className="text-xs font-light text-light uppercase">Beta</span>
                        </h1>
                    </button>
                    
                    {/* --- Centered Desktop Navigation --- */}
                    <nav className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-4">
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
                        <button
                            onClick={() => handleNavClick({ type: 'directory' })}
                            className="px-4 py-2 text-sm font-semibold text-dark-text-secondary hover:text-dark-text hover:bg-dark-700 rounded-lg transition-colors"
                        >
                            Directory
                        </button>
                    </nav>
                    
                    {/* --- Right-aligned Auth Controls --- */}
                    <div className="hidden md:flex items-center gap-4">
                        {profile ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setIsProfileMenuOpen(prev => !prev)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-dark-text-secondary hover:text-dark-text bg-dark-300/50 hover:bg-dark-700 rounded-full transition-colors"
                                >
                                    <span>{profile.call_sign || profile.full_name?.split(' ')[0] || 'Profile'}</span>
                                    <Icon className="text-xl transition-transform" style={{ transform: isProfileMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</Icon>
                                </button>
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-dark-800 border border-dark-700 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none p-2">
                                        <div className="space-y-1">
                                            <DropdownMenuItem icon="person" label="My Profile" onClick={() => handleNavClick({ type: 'profile' })} />
                                            {(profile.is_approved || profile.role === 'admin') && (
                                                 <DropdownMenuItem icon="podcasts" label="Manage NETs" onClick={() => handleNavClick({ type: 'manageNets' })} />
                                            )}
                                            {profile.role === 'admin' && (
                                                 <DropdownMenuItem icon="manage_accounts" label="User Management" onClick={() => handleNavClick({ type: 'userManagement' })} />
                                            )}
                                            <div className="h-px bg-dark-700 my-1" />
                                            <DropdownMenuItem icon="logout" label={isLoggingOut ? "Signing out..." : "Sign Out"} onClick={handleLogout} disabled={isLoggingOut} />
                                        </div>
                                    </div>
                                )}
                            </div>
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
                    </div>
                    
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
                        <button
                            onClick={() => handleNavClick({ type: 'directory' })}
                            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-dark-text hover:bg-dark-700"
                        >
                            Directory
                        </button>
                       {profile ? (
                            <>
                                <div className="px-3 py-3 my-1 border-y border-dark-700 text-sm text-dark-text-secondary text-center">
                                    Signed in as <span className="font-semibold text-dark-text">{profile.call_sign || profile.email}</span>
                                </div>
                                <button onClick={() => handleNavClick({ type: 'profile' })} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-dark-text hover:bg-dark-700">
                                    <Icon className="text-xl w-5 text-center">person</Icon>My Profile
                                </button>
                                {(profile.is_approved || profile.role === 'admin') && (
                                    <button onClick={() => handleNavClick({ type: 'manageNets' })} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-dark-text hover:bg-dark-700">
                                        <Icon className="text-xl w-5 text-center">podcasts</Icon>Manage NETs
                                    </button>
                                )}
                                {profile.role === 'admin' && (
                                     <button onClick={() => handleNavClick({ type: 'userManagement' })} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-dark-text hover:bg-dark-700">
                                        <Icon className="text-xl w-5 text-center">manage_accounts</Icon>User Management
                                    </button>
                                )}
                                <div className="h-px bg-dark-700 my-1" />
                                <button onClick={handleLogout} disabled={isLoggingOut} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-dark-text hover:bg-dark-700 disabled:opacity-50">
                                    <Icon className="text-xl w-5 text-center">logout</Icon>{isLoggingOut ? 'Logging out...' : 'Sign Out'}
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
