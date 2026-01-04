

import React from 'react';
import { Net, NetSession, CheckIn, Profile, View } from '../types';
import { Icon } from '../components/Icon';
import LiveNetsSection from '../components/LiveNetsSection';
import Button from '../components/Button';
// import netControlScreenshot from '../img/NetControl-screen-mobile.png'; // Adjust the path as necessary


interface HomeScreenProps {
  activeSessions: NetSession[];
  nets: Net[];
  sessions: NetSession[];
  checkIns: CheckIn[];
  profile: Profile | null;
  onViewSession: (sessionId: string) => void;
  onViewNetDetails: (netId: string) => void;
  onSetView: (view: View) => void;
}

/**
 * A card component that displays a step in a process with an icon, title, and description.
 *
 * @param icon - The icon to display in the card, as a string.
 * @param title - The title of the step.
 * @param children - The description or content of the step.
 * @param step - The step number to display in the badge.
 *
 * @remarks
 * The card features a styled icon, step number badge, and supports hover effects.
 * Use this component to visually represent steps in a multi-step process.
 */
const StepCard: React.FC<{ icon: string; title: string; children: React.ReactNode; step: number }> = ({ icon, title, children }) => (
    <div className="bg-dark-800 p-6 rounded-lg shadow-lg text-center border-t-4 border-transparent hover:border-brand-accent transition-all duration-300 h-full flex flex-col">
        <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-dark-700 rounded-full flex items-center justify-center relative">
                <Icon className="text-3xl text-brand-accent">{icon}</Icon>
                {/*<div className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-brand-primary text-white font-bold rounded-full text-sm border-dark-900">
                    {step}
                </div>*/}
            </div>
        </div>
        <h3 className="text-xl font-bold mb-2 text-dark-text">{title}</h3>
        <div className="text-dark-text-secondary flex-grow flex flex-col justify-between">{children}</div>
    </div>
);

const StatCard: React.FC<{ icon: string; value: number | string; label: string }> = ({ icon, value, label }) => (
    <div className="bg-dark-800 p-6 rounded-lg shadow-lg flex items-center gap-4">
        <div className="w-16 h-16 p-3 flex items-center justify-center bg-dark-700 rounded-full">
            <Icon className="text-3xl text-brand-accent">{icon}</Icon>
        </div>
        <div>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-dark-text-secondary">{label}</div>
        </div>
    </div>
);


const HomeScreen: React.FC<HomeScreenProps> = ({ activeSessions, nets, sessions, checkIns, onViewSession, profile, onSetView }) => {

  const totalCheckIns = checkIns.length;
  const totalNets = nets.length;
  const totalSessions = sessions.length;
  const uniqueCallSigns = new Set(checkIns.map(ci => ci.call_sign)).size;
  const netControlScreenshot = "https://netcontrol.app/assets/NetControl-screen-mobile-DI82yjz6.png";

  return (
    <div className="space-y-10">
      <div className="relative rounded-xl p-8 md:p-12 lg:p-12 mb-6 overflow-hidden">
         <div className="text-center z-10 relative">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Amateur Radio Net Logging System</h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-dark-text-secondary">Coordinate on-air NETs, track participation, and keep your community connected in real-time.</p>
         </div>
      </div>


      <div className="relative isolate overflow-hidden px-6 pt-30 after:pointer-events-none after:absolute after:inset-0 after:inset-ring after:inset-ring-white/10 sm:rounded-3xl sm:px-16 md:px-16 after:sm:rounded-3xl md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
        <div className="container mx-auto p-2 relative">
            <div className="flex justify-center items-center md:justify-between lg:w-full md:6/8 xl:w-6/8 2xl:w-8/8 rounded-lg mx-auto my-5">
                
                <div className="md:flex-row flex flex-col w-full gap-x-4">
                    
                    <div className="w-full text-lg md:w-12/12 lg:w-1/2 p-4 rounded-lg mr-0 mb-4">
                        <h2 className="text-3xl font-bold tracking-tight text-brand-accent">Traditional Net Logging, Reimagined</h2>
                        <p className="mt-4 text-dark-text-secondary">
                            Welcome to a modern Net management and check-in system to help amateur radio Net Control stations schedule and run nets and encourage regular on-air participation through a fun and engaging awardsystem.</p>
                        <p className="mt-4 text-dark-text-secondary">
                            Net participants <span className='font-bold text-dark-text'>do not need to create an account or register</span> to see their badges and awards.
                        </p>
                        <Button size="lg" onClick={() => onSetView({ type: 'directory' })} className="mt-8">
                            <span>View Net Directory</span>
                        </Button>
                    </div>                                   
                    
                    <div className="w-full md:w-6/12 lg:w-1/2 p-4 rounded-lg ml-0 text-center">
                      {/* GoogleAIStudio <img src="https://placehold.co/350x300/1E1E1E/E0E0E0?text=NetControl%0AApp+Screenshot" alt="NetControl Screenshot" className="mx-auto object-cover" /> */ }
                      {/* Local <img src={netControlScreenshot} alt="NetControl Screenshot" className="mx-auto object-cover" /> */ }
                      <img src={netControlScreenshot} alt="NetControl Screenshot" className="mx-auto object-cover" />
                    </div>
                </div>
            </div>  
        </div>
      </div>

      <LiveNetsSection
        activeSessions={activeSessions}
        nets={nets}
        checkIns={checkIns}
        onViewSession={onViewSession}
        profile={profile}
        onSetView={onSetView}
      />

    <div className="pb-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Get Started in 3 Easy Steps</h2>
            <p className="mt-2 text-dark-text-secondary">For Net Control Stations ready to manage their NET.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard step={1} icon="podcasts" title="Register as a Net Control Station">
              <div>
                <p>Sign up for a <span className='font-bold text-dark-text'>FREE</span> account as a Net Control station and start setting up your first Net.</p>
                <div className="mt-8">
                    <Button size="lg" onClick={() => onSetView({ type: 'register' })}>
                        <span>Get Started</span>
                    </Button>
                </div>
              </div>
            </StepCard>
             <StepCard step={2} icon="how_to_reg" title="Create a Net & Roster">
                <p>Create and configure Net to help others find you on the air. For regular Nets, build an roster of regular attendees for quick check-ins.</p>
            </StepCard>
             <StepCard step={3} icon="emoji_events" title="Log Check-ins & Award Badges">
                <p>Start a live session and log participants as they check-in. The system automatically awards badges for participation milestones!</p>
            </StepCard>
          </div>
      </div>
      
      <div className="mb-6 py-6">
        <h2 className="text-3xl font-bold tracking-tight">Stats</h2>
        <p className="mt-2 text-dark-text-secondary">
         NetControl usage as of {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard icon="tag" value={totalCheckIns} label="Total Check-ins" />
        <StatCard icon="podcasts" value={totalNets} label="Configured Nets" />
        <StatCard icon="history" value={totalSessions} label="Logged Net Sessions" />
        <StatCard icon="group" value={uniqueCallSigns} label="Call Signs Logged" />
      </div>

    </div>
  );
};

export default HomeScreen;