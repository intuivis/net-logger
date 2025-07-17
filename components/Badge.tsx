
import React from 'react';
import { Badge as BadgeType } from '../types';
import { Icon } from './Icon';
import { StarIcon } from './icons/StarIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { AwardIcon } from './icons/AwardIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunriseIcon } from './icons/SunriseIcon';

interface BadgeProps {
  badge: BadgeType;
  showLabel?: boolean;
}

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    star: StarIcon,
    trending_up: TrendingUpIcon,
    award: AwardIcon,
    moon: MoonIcon,
    sunrise: SunriseIcon,
};

export const Badge: React.FC<BadgeProps> = ({ badge, showLabel = true }) => {
    const IconComponent = iconMap[badge.icon];

    // Conditionally adjust styles for icon-only badges
    const containerClasses = showLabel
      ? `inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${badge.color_classes}`
      : `inline-flex items-center justify-center p-1 rounded-full ${badge.color_classes}`; // Smaller padding for icon-only

    const iconSize = showLabel ? 'w-3.5 h-3.5' : 'w-4 h-4'; // Slightly larger icon when alone
    
    return (
        <div
        className={containerClasses}
        title={showLabel ? badge.description : `${badge.name}: ${badge.description}`} // More descriptive title for icon-only
        >
        {IconComponent ? (
            <IconComponent className={iconSize} />
        ) : (
            <Icon className={`text-base ${iconSize}`}>{badge.icon}</Icon>
        )}
        {showLabel && <span>{badge.name}</span>}
        </div>
    );
};