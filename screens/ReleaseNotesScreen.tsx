import React from 'react';
import { Icon } from '../components/Icon';

interface ReleaseNotesScreenProps {
  onBack: () => void;
}

const ReleaseNotesScreen: React.FC<ReleaseNotesScreenProps> = ({ onBack }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-md font-semibold text-dark-text-secondary hover:text-dark-text transition-colors">
                <Icon className="text-xl">arrow_back</Icon>
                <span>Back</span>
            </button>

            <div className="space-y-8 bg-dark-800 p-6 sm:p-8 rounded-lg shadow-xl">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Release Notes</h1>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <div className="border-l-4 border-brand-secondary pl-4 py-2">
                        <h2 className="text-2xl font-bold text-dark-text">Version 1.3.4 (Current)</h2>
                        <p className="text-sm"><span className="text-dark-text font-bold">Release Date:</span> Friday, August 22, 2025</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Adjusted "callsign" to "call sign" in most areas in keeping with ARRL and other sources.</li>
                            <li>Adjusted instances of Net Control "operator" to "station" where it made sense.</li>
                            <li>Adjusted the mobile view for session history to fit better for smaller screens.</li>
                            <li>Minor feature: Added a stats and usage block on the homepage.</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <div className="border-l-4 border-dark-800 pl-4 py-2">
                        <h2 className="text-2xl font-bold text-dark-text">Version 1.3.3</h2>
                        <p className="text-sm"><span className="text-dark-text font-bold">Release Date:</span> Wednesday, August 13, 2025</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Testing a redesign of the home screen.</li>
                            <li>Added a new Direcory page with filters to prepare for hopefully many more Nets.</li>
                            <li>Slight adjustment to header navigation.</li>
                            <li>Bug fix: For Linked Repeater Nets, the net selected will stay selected until you select a different one for faster logging.</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <div className="border-l-4 border-dark-800 pl-4 py-2">
                        <h2 className="text-2xl font-bold text-dark-text">Version 1.3.2</h2>
                        <p className="text-sm"><span className="text-dark-text font-bold">Release Date:</span> Wednesday, August 6, 2025</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Fixed an automatic saving issue with Session Notes</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <div className="border-l-4 border-dark-800 pl-4 py-2">
                        <h2 className="text-2xl font-bold text-dark-text">Version 1.3.1</h2>
                        <p className="text-sm"><span className="text-dark-text font-bold">Release Date:</span> Saturday, August 2, 2025</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Major optimizations and bug fixes to help resolve real-time check-in monitoring.</li>
                            <li>Removed name and call sign from "New NET" screen since that is captured during registration.</li>
                            <li>Improved speed in logging and preparing system for next major feature.</li>
                            <li>Improved user experience for viewing and managing NCO profiles.</li>
                            <li>Improved user experience for all alerts and confirmation dialogs.</li>
                            <li>Setting up system to improve Rosters.</li>
                            <li>Improved net control badging in check-in log.</li>
                            <li>Improved the presentation of a few mobile screens.</li>
                            <li>Slight improvement to the "Loading Session..." animation.</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <div className="border-l-4 border-dark-800 pl-4 py-2">
                        <h2 className="text-2xl font-bold text-dark-text">Version 1.3.0</h2>
                        <p className="text-sm"><span className="text-dark-text font-bold">Release Date:</span> Tuesday, July 29, 2025</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>The "first check-in" badge is now awarded for first time check-ins on a Net.</li>
                            <li>Slight adjustment to the badge design for added size consistency.</li>
                            <li><span className="font-bold text-dark-text">New Feature: Profile Management</span></li>
                            <ul className="list-disc list-inside mt-2 space-y-1 pl-5">
                                <li>Authenticated users can now edit name, call sign, email, and password.</li>
                                <li>This change also comes with a minor update to the header navigation.</li>
                            </ul>
                            <li><span className="font-bold text-dark-text">New Feature: Status Action Button</span></li>
                            <ul className="list-disc list-inside mt-2 space-y-1 pl-5">
                                <li>You can now toggle the status of a check-in to help you mark log for activities.</li>
                            </ul>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <div className="border-l-4 border-dark-800 pl-4 py-2">
                        <h2 className="text-2xl font-bold text-dark-text">Version 1.2.1</h2>
                        <p className="text-sm"><span className="text-dark-text font-bold">Release Date:</span> Sunday, July 27, 2025</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Addressing bugs with the rollout of the roster.</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <div className="border-l-4 border-dark-800 pl-4 py-2">
                        <h2 className="text-2xl font-bold text-dark-text">Version 1.2.0</h2>
                        <p className="text-sm"><span className="text-dark-text font-bold">Release Date:</span> Friday, July 25, 2025</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>More optimizations and an improved user experience</li>
                            <li>
                                <span className="font-bold text-dark-text">New Feature: Rosters</span>
                                <ul className="list-disc list-inside mt-2 space-y-1 pl-5">
                                    <li>You can now build a roster of regular net attendees that you can access from your sessions log screen.</li>
                                    <li>This will allow you to spot and check-in participants much quicker as you conduct nets.</li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <div className="border-l-4 border-dark-800 pl-4 py-2">
                        <h2 className="text-2xl font-bold text-dark-text">Version 1.1.0</h2>
                        <p className="text-sm"><span className="text-dark-text font-bold">Release Date:</span> Thursday, July 24, 2025</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Removed the Javascript alert for new badge awards to speed up adding stations to contact log.</li>
                            <li>Addressed a session timeout bug and offered a modal to direct login.</li>
                            <li>
                                <span className="font-bold text-dark-text">New Feature: Passcode Permissions</span>
                                <ul className="list-disc list-inside mt-2 space-y-1 pl-5">
                                    <li>Net control stations can now grant permission to authenticated users with a passcode.</li>
                                    <li>Users can enter the passcode to gain access to the net control station's permission settings.</li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <div className="border-l-4 border-dark-800 pl-4 py-2">
                        <h2 className="text-2xl font-bold text-dark-text">Version 1.0.1</h2>
                        <p className="text-sm"><span className="text-dark-text font-bold">Release Date:</span> Wednesday, July 23, 2025</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Added application footer with user agreement, release notes, and feedback links.</li>
                            <li>Added user agreement on registration screen.</li>
                            <li>Added Intuivis, LLC branding.</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <div className="border-l-4 border-dark-800 pl-4 py-2">
                        <h2 className="text-2xl font-bold text-dark-text">Version 1.0.0</h2>
                        <p className="text-sm"><span className="text-dark-text font-bold">Release Date:</span> July 2025</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Initial release of the NetControl application.</li>
                            <li>Features include NET creation, session management, and real-time check-in logging.</li>
                            <li>Activity charts for logged session check-ins.</li>
                            <li>User registration and administration panel.</li>
                            <li>Awards and badge system for operator engagement.</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReleaseNotesScreen;