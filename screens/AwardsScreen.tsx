import React, { useMemo } from 'react';
import { Badge } from '../components/Badge';
import { BadgeDefinition, BadgeCategory } from '../types';
import { InfoListItem } from '../components/InfoListItem';

interface AwardsScreenProps {
    allBadgeDefinitions: BadgeDefinition[];
}

const AwardSection: React.FC<{title: string, description: string, awards: BadgeDefinition[]}> = ({title, description, awards}) => (
    <div className="bg-dark-800 rounded-lg shadow-lg">
        <div className="p-6 sm:p-8 border-b border-dark-700">
            <h2 className="text-2xl font-bold tracking-tight text-center text-dark-text">{title}</h2>
            <p className="mt-2 text-center text-dark-text-secondary">{description}</p>
        </div>
        <ul className="divide-y divide-dark-700">
            {awards.map(badgeDef => (
                <InfoListItem key={badgeDef.id} badge={<Badge badge={badgeDef} />}>
                    <div className="">
                        <h3 className="font-semibold text-dark-text text-lg">{badgeDef.name}</h3>
                        <p className="text-sm text-dark-text-secondary mt-1">{badgeDef.description}</p>
                    </div>
                </InfoListItem>
            ))}
        </ul>
    </div>
);

const AwardsScreen: React.FC<AwardsScreenProps> = ({ allBadgeDefinitions }) => {

    const badgeCategories = useMemo(() => {
        const categorized: Record<BadgeCategory, BadgeDefinition[]> = {
            'Participation': [],
            'Loyalty': [],
            'Special': []
        };
        
        for (const badgeDef of allBadgeDefinitions) {
            if (categorized[badgeDef.category]) {
                categorized[badgeDef.category].push(badgeDef);
            }
        }

        // Sort each category by the defined sortOrder
        for (const categoryKey in categorized) {
            categorized[categoryKey as BadgeCategory].sort((a, b) => a.sortOrder - b.sortOrder);
        }

        return categorized;
    }, [allBadgeDefinitions]);

    return (
        <div className="max-w-4xl mx-auto space-y-12">
             <div>
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Awards & Achievements</h1>
                    <p className="mt-4 max-w-3xl mx-auto text-lg text-dark-text-secondary">
                        Earn badges for checking into different NETs and for regularly checking into your favorites.
                    </p>
                </div>
            </div>

            <AwardSection
                title="Loyalty Awards"
                description="Awarded for staying with and getting checked into the same NET over time."
                awards={badgeCategories['Loyalty']}
            />

            <AwardSection
                title="Participation Awards"
                description="This group of awards are for attending a variety of different NETs."
                awards={badgeCategories['Participation']}
            />

            <AwardSection
                title="Special Achievements"
                description="Awards for checking into a NET under specific conditions."
                awards={badgeCategories['Special']}
            />
        </div>
    );
};

export default AwardsScreen;