
import React from 'react';
import { Badge as BadgeType } from '../types';
import { Icon } from './Icon';
import { StarIcon } from './icons/StarIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';
import { BADGE_STYLES } from '../constants';

interface BadgeProps {
  badge: BadgeType;
  variant?: 'pill' | 'icon' | 'profile';
}

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    star: StarIcon,
    moon: MoonIcon,
    sun: SunIcon,
};

export const Badge: React.FC<BadgeProps> = ({ badge, variant = 'pill' }) => {
    const style = BADGE_STYLES[badge.id] || BADGE_STYLES.default;
    const IconComponent = iconMap[style.icon];

    if (variant === 'profile') {
        return (
            <div
                className={`flex flex-col items-center justify-center w-28 h-28 rounded-full p-2 text-center transition-transform hover:scale-105 ${style.color_classes}`}
                title={`${badge.name}: ${badge.description}`}
            >
                {IconComponent ? (
                    <IconComponent className="w-10 h-10 mb-1" />
                ) : (
                    <Icon className="text-5xl mb-1">{style.icon}</Icon>
                )}
                <span className="text-sm font-semibold leading-snug">{badge.name}</span>
            </div>
        );
    }

    const containerClasses = variant === 'pill'
      ? `inline-flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full ${style.color_classes}`
      : `inline-flex items-center justify-center p-1 rounded-full ${style.color_classes}`;

    const iconContainerSize = variant === 'pill' ? 'w-3.5 h-3.5' : 'w-4 h-4';
    const iconFontSize = variant === 'pill' ? 'text-sm' : 'text-base';
    
    return (
        <div
            className={containerClasses}
            title={variant === 'pill' ? badge.description : `${badge.name}: ${badge.description}`}
        >
            {IconComponent ? (
                <IconComponent className={iconContainerSize} />
            ) : (
                <Icon className={`${iconFontSize} ${iconContainerSize}`}>{style.icon}</Icon>
            )}
            {variant === 'pill' && <span>{badge.name}</span>}
        </div>
    );
};
