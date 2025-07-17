
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
}

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    star: StarIcon,
    trending_up: TrendingUpIcon,
    award: AwardIcon,
    moon: MoonIcon,
    sunrise: SunriseIcon,
};

export const Badge: React.FC<BadgeProps> = ({ badge }) => {
    const IconComponent = iconMap[badge.icon];
    return (
        <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${badge.color_classes}`}
        title={badge.description}
        >
        {IconComponent ? (
            <IconComponent className="w-3.5 h-3.5" />
        ) : (
            <Icon className="text-base w-3.5 h-3.5">{badge.icon}</Icon>
        )}
        <span>{badge.name}</span>
        </div>
    );
};
