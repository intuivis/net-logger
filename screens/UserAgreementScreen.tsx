import React from 'react';
import { Icon } from '../components/Icon';

interface UserAgreementScreenProps {
  onBack: () => void;
  onReleaseNotes: () => void;
}

const UserAgreementScreen: React.FC<UserAgreementScreenProps> = ({ onBack, onReleaseNotes }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-md font-semibold text-dark-text-secondary hover:text-dark-text transition-colors">
                <Icon className="text-xl">arrow_back</Icon>
                <span>Back</span>
            </button>
        
            <div className="space-y-8 bg-dark-800 p-6 sm:p-8 rounded-lg shadow-xl">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">User Agreement</h1>
                </div>

                <div className="space-y-4 text-dark-text-secondary">
                    <h2 className="text-2xl font-bold text-dark-text pt-4">1. Use at Your Own Risk</h2>
                    <p>This Application is provided on an “as is” and “as available” basis for informational and operational convenience. You use this service voluntarily and at your own risk. We do not guarantee the accuracy, completeness, or reliability of any data entered or displayed.</p>
                    <p>We are not responsible for:</p>
                    
                    <ul className="list-disc list-inside pl-6 mt-2 space-y-1">
                        <li>Any errors or omissions in the content of this service.</li>
                        <li>Missed or incomplete check-ins.</li>
                        <li>Any losses or damages of any kind incurred as a result of the use of this service.</li>
                        <li>Any interruptions or delays in the operation of this service.</li>
                        <li>Technical issues or data loss.</li>
                        <li>Any third-party services or content linked from this service.</li>
                        <li>Decisions or actions taken based on information from this Application</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-dark-text pt-4">2. No Warranties</h2>
                    <p className="pt-4">We make no warranties, express or implied, including but not limited to warranties of merchantability or fitness for a particular purpose. This Application may contain bugs, errors, or downtime. You acknowledge and accept this as part of its use.</p>

                    <h2 className="text-2xl font-bold text-dark-text pt-4">3. Limitation of Liability</h2>
                    <p>In no event shall Intuivis, LLC, its developers, or its affiliates be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses (even if we have been advised of the possibility of such damages), resulting from the use of this service.</p>

                    <h2 className="text-2xl font-bold text-dark-text pt-4">4. User Accounts</h2>
                    <p>Users are permitted one 1 account per person with no exceptions. You may not register for someone else or use someone else's callsign.</p>

                    <h2 className="text-2xl font-bold text-dark-text pt-4">5. User Conduct</h2>
                    <p>You agree to use this Application only for lawful purposes and in accordance with all applicable rules and regulations. You are responsible for any content you submit or manage using the service. Registered usered recognize that content entered into Application may be seen by others and access to Application may be revoked at anytime for inappropriate language or misconduct.</p>

                    <h2 className="text-2xl font-bold text-dark-text pt-4">6. Feedback &amp; Updates</h2>
                    <p>We may improve the Application from time to time. By providing feedback or using updated versions, you acknowledge that changes may affect your experience. You are encouraged to review the <button onClick={onReleaseNotes} className="text-dark-text hover:underline transition-colors underline">Release Notes</button> periodically.</p>

                    <h2 className="text-2xl font-bold text-dark-text pt-4">7. Termination</h2>
                    <p>We reserve the right to suspend or terminate access to the Application at any time without notice, for any reason, including but not limited to violations of this agreement.</p>

                    <h2 className="text-2xl font-bold text-dark-text pt-4">8. Governing Law</h2>
                    <p>This agreement shall be governed by and interpreted in accordance with the laws of the State of Georgia, without regard to its conflict of law principles.</p>

                    <h2 className="text-2xl font-bold text-dark-text pt-4">9. Changes to Terms</h2>
                    <p>We reserve the right to modify these terms at any time. We will do our best to notify you of any significant changes.</p>

                    <p>By using this Application, you acknowledge that you have read, understood, and agreed to this User Agreement. If you do not agree, you should <span className="text-bold text-dark-text">discontinue use of the Application immediately</span>.</p>

                </div>
            </div>
        </div>
    );
};

export default UserAgreementScreen;