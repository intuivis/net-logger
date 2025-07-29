
import React from 'react';
import { Net, NetSession, CheckIn, AwardedBadge, BadgeDefinition, Profile, View } from '../types';
import CallSignProfileScreen from './CallSignProfileScreen';

interface ProfileScreenProps {
  profile: Profile;
  allNets: Net[];
  allSessions: NetSession[];
  allCheckIns: CheckIn[];
  allBadgeDefinitions: BadgeDefinition[];
  awardedBadges: AwardedBadge[];
  onViewSession: (sessionId: string) => void;
  onViewNetDetails: (netId: string) => void;
  onSetView: (view: View) => void;
}


const ProfileScreen: React.FC<ProfileScreenProps> = (props) => {
    const { profile, onSetView } = props;

    if (!profile.call_sign) {
         return (
            <div className="text-center py-20 bg-dark-800 rounded-lg">
                <p className="text-dark-text-secondary text-lg">Set your call sign to view your activity.</p>
                <button 
                    onClick={() => onSetView({type: 'settings'})} 
                    className="mt-6 px-6 py-2.5 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary"
                >
                    Go to Settings
                </button>
            </div>
        );
    }
    
    return (
        <CallSignProfileScreen
            profile={props.profile}
            callsign={profile.call_sign}
            allNets={props.allNets}
            allSessions={props.allSessions}
            allCheckIns={props.allCheckIns}
            allBadgeDefinitions={props.allBadgeDefinitions}
            awardedBadges={props.awardedBadges}
            onViewSession={props.onViewSession}
            onViewNetDetails={props.onViewNetDetails}
            onBack={() => onSetView({ type: 'home' })}
            isOwnProfile={true}
            onNavigateToSettings={() => onSetView({ type: 'settings'})}
        />
    );
};

export default ProfileScreen;