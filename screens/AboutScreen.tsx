
import React from 'react';
import { Badge } from '../components/Badge';
import { BADGE_DEFINITIONS } from '../lib/badges';
import { Icon } from '../components/Icon';
import { NET_CONFIG_TYPE_LABELS, NetConfigType } from '../types';
import { NET_TYPE_OPTIONS, NET_TYPE_INFO } from '../constants';

interface AboutScreenProps {
    onBack: () => void;
}

const CONFIG_DESCRIPTIONS = [
    {
        type: NetConfigType.GROUP,
        label: NET_CONFIG_TYPE_LABELS.GROUP,
        description: 'Ideal for local clubs or informal groups using a single simplex frequency. This configuration is perfect for direct, line-of-sight communication without a repeater.',
        icon: 'wifi_tethering',
        classes: 'bg-teal-500/20 text-teal-300',
    },
    {
        type: NetConfigType.SINGLE_REPEATER,
        label: NET_CONFIG_TYPE_LABELS.SINGLE_REPEATER,
        description: "The most common setup for nets operating on one repeater. This extends the range for operators within the repeater's coverage area, connecting a wider community.",
        icon: 'cell_tower',
        classes: 'bg-purple-500/20 text-purple-300',
    },
    {
        type: NetConfigType.LINKED_REPEATER,
        label: NET_CONFIG_TYPE_LABELS.LINKED_REPEATER,
        description: 'For wide-area nets spanning multiple locations, this configuration links several repeaters. Check-ins on any repeater in the system are heard by all.',
        icon: 'link',
        classes: 'bg-blue-500/20 text-blue-300',
    }
];

const InfoBadge: React.FC<{
  label: string,
  icon: string,
  classes: string
}> = ({ label, icon, classes }) => (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full ${classes}`}>
      <Icon className="text-base">{icon}</Icon>
      <span>{label}</span>
    </div>
);


const AboutScreen: React.FC<AboutScreenProps> = ({ onBack }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div>
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About NetControl</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-dark-text-secondary">
                        This application is designed to encourage Amateur Radio operators to get on the air, join a NET, and earn recognition for their participation and achievements.
                    </p>
                </div>
            </div>

            <div className="bg-dark-800 rounded-lg shadow-lg">
                <div className="p-6 sm:p-8 border-b border-dark-700">
                    <h2 className="text-2xl font-bold text-center tracking-tight text-dark-text">Understanding NET Types</h2>
                </div>
                <ul className="divide-y divide-dark-700">
                    {NET_TYPE_OPTIONS.map(netType => {
                        const info = NET_TYPE_INFO[netType];
                        if (!info) return null;
                        return (
                            <li key={netType} className="p-6 flex flex-col sm:flex-row items-start gap-4 hover:bg-dark-700/30">
                                <div className="flex-shrink-0 mt-1">
                                    <InfoBadge label={netType} icon={info.icon} classes={info.classes} />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-dark-text-secondary">{info.description}</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
            
            <div className="bg-dark-800 rounded-lg shadow-lg">
                <div className="p-6 sm:p-8 border-b border-dark-700">
                    <h2 className="text-2xl font-bold text-center tracking-tight text-dark-text">Understanding NET Configurations</h2>
                </div>
                <ul className="divide-y divide-dark-700">
                    {CONFIG_DESCRIPTIONS.map(config => (
                         <li key={config.type} className="p-6 flex flex-col sm:flex-row items-start gap-4 hover:bg-dark-700/30">
                            <div className="flex-shrink-0 mt-1">
                                <InfoBadge label={config.label} icon={config.icon} classes={config.classes} />
                            </div>
                            <div className="flex-grow">
                                <p className="text-dark-text-secondary">{config.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>


            <div className="bg-dark-800 rounded-lg shadow-lg">
                 <div className="p-6 sm:p-8 border-b border-dark-700">
                    <h2 className="text-2xl font-bold tracking-tight text-center text-dark-text">Awards &amp; Achievements</h2>
                    <p className="mt-2 text-center text-dark-text-secondary">
                        Badges are awarded to operators for achieving certain milestones. Here's how you can earn them.
                    </p>
                </div>
                <ul className="divide-y divide-dark-700">
                    {BADGE_DEFINITIONS.map(badgeDef => (
                        <li key={badgeDef.id} className="p-6 flex flex-col sm:flex-row items-start gap-4 hover:bg-dark-700/30">
                            <div className="flex-shrink-0 mt-1">
                                <Badge badge={badgeDef} />
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-dark-text">{badgeDef.name}</p>
                                <p className="text-sm text-dark-text-secondary">{badgeDef.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AboutScreen;