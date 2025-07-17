
import React from 'react';
import { Badge as BadgeType } from '../types';
import { Icon } from './Icon';
import { StarIcon } from './icons/StarIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';

interface BadgeProps {
  badge: BadgeType;
  showLabel?: boolean;
}

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    star: StarIcon,
    moon: MoonIcon,
    sun: SunIcon,
};

export const Badge: React.FC<BadgeProps> = ({ badge, showLabel = true }) => {
    const IconComponent = iconMap[badge.icon];

    const containerClasses = showLabel
      ? `inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${badge.color_classes}`
      : `inline-flex items-center justify-center p-1 rounded-full ${badge.color_classes}`;

    // Define container and font sizes separately to ensure they match
    const iconContainerSize = showLabel ? 'w-3.5 h-3.5' : 'w-4 h-4';
    const iconFontSize = showLabel ? 'text-sm' : 'text-base'; // text-sm is 14px, text-base is 16px
    
    return (
        <div
        className={containerClasses}
        title={showLabel ? badge.description : `${badge.name}: ${badge.description}`} // More descriptive title for icon-only
        >
        {IconComponent ? (
            <IconComponent className={iconContainerSize} />
        ) : (
            <Icon className={`${iconFontSize} ${iconContainerSize}`}>{badge.icon}</Icon>
        )}
        {showLabel && <span>{badge.name}</span>}
        </div>
    );
};
