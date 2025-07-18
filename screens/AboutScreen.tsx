
import React, { useMemo } from 'react';
import { Badge } from '../components/Badge';
import { BADGE_DEFINITIONS } from '../lib/badges';
import { BadgeDefinition } from '../types';

interface AboutScreenProps {
    onBack: () => void;
    allBadges: BadgeDefinition[];
}

const AwardSection: React.FC<{title: string, description: string, awards: BadgeDefinition[]}> = ({title, description, awards}) => (
    <div className="bg-dark-800 rounded-lg shadow-lg">
        <div className="p-6 sm:p-8 border-b border-dark-700">
            <h2 className="text-2xl font-bold tracking-tight text-center text-dark-text">{title}</h2>
            <p className="mt-2 text-center text-dark-text-secondary">{description}</p>
        </div>
        <ul className="divide-y divide-dark-700">
            {awards.map(badgeDef => (
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
);

const AboutScreen: React.FC<AboutScreenProps> = ({ onBack, allBadges }) => {

    const badgeCategories = useMemo(() => {
        const logicMap = new Map(BADGE_DEFINITIONS.map(b => [b.id, b]));
        const categorized: Record<string, BadgeDefinition[]> = {
            'Participation': [],
            'Loyalty': [],
            'Special': []
        };
        
        for (const badge of allBadges) {
            const logic = logicMap.get(badge.id);
            if (logic) {
                const fullBadgeDef = { ...badge, ...logic };
                if (categorized[fullBadgeDef.category]) {
                    categorized[fullBadgeDef.category].push(fullBadgeDef);
                }
            }
        }
        return categorized;
    }, [allBadges]);

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div>
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">About NetControl</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-dark-text-secondary">
                        This application is designed to encourage Amateur Radio operators to get on the air, join a NET, and earn badges for their participation and achievements.
                    </p>
                </div>
            </div>

            <AwardSection
                title="Participation Awards"
                description="This group of awards are for attending different NETs tracked over a full calendar year."
                awards={badgeCategories['Participation']}
            />

            <AwardSection
                title="Loyalty Awards"
                description="Awarded for staying with and getting checked into the same NET tracked over a full calendar year."
                awards={badgeCategories['Loyalty']}
            />

            <AwardSection
                title="Special Awards"
                description="Awards for checking into a NET under specific conditions tracked over a full calendar year."
                awards={badgeCategories['Special']}
            />
        </div>
    );
};

export default AboutScreen;