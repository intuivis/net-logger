import React from 'react';
import { NET_TYPE_OPTIONS, NET_TYPE_INFO } from '../constants';
import { NetTypeBadge } from '../components/NetTypeBadge';
import { InfoListItem } from '../components/InfoListItem';

const AboutScreen: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div>
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About NetControl</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-dark-text-secondary">
                        This application is designed to encourage Amateur Radio operators to get on the air, join or lead a NET, and earn badges for their participation and achievements.
                    </p>
                </div>
            </div>

            <div className="bg-dark-800 rounded-lg shadow-lg">
                <div className="p-6 sm:p-8 border-b border-dark-700">
                    <h2 className="text-2xl font-bold tracking-tight text-center text-dark-text">Understanding NET Types</h2>
                    <p className="mt-2 text-center text-dark-text-secondary">NETs are organized by their purpose. Here are the types you'll find in this system.</p>
                </div>
                <ul className="divide-y divide-dark-700">
                    {NET_TYPE_OPTIONS.map(netType => {
                        const info = NET_TYPE_INFO[netType];
                        return (
                            <InfoListItem key={netType} badge={<NetTypeBadge type={netType} size="base" />}>
                                <h3 className="font-semibold text-dark-text text-lg">{netType}</h3>
                                <p className="text-sm text-dark-text-secondary mt-1">{info.description}</p>
                            </InfoListItem>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default AboutScreen;