

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
  size?: 'sm' | 'base';
}

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    star: StarIcon,
    moon: MoonIcon,
    sun: SunIcon,
};

export const Badge: React.FC<BadgeProps> = ({ badge, variant = 'pill', size = 'base' }) => {
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
    
    if (variant === 'pill') {
        const pillSizeClasses = {
            base: "px-4 py-2 text-sm",
            sm: "px-2.5 py-1 text-xs"
        };
        const containerClasses = `inline-flex items-center gap-2 font-semibold rounded-lg ${style.color_classes} ${pillSizeClasses[size]}`;
        const iconSize = size === 'sm' ? 'text-base' : 'text-lg';

        return (
            <div
                className={containerClasses}
                title={badge.description}
            >
                {IconComponent ? (
                    <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
                ) : (
                    <Icon className={iconSize}>{style.icon}</Icon>
                )}
                <span>{badge.name}</span>
            </div>
        )
    }

    // Icon variant
    const containerClasses = `inline-flex items-center justify-center p-1 rounded-full ${style.color_classes}`;
    const iconContainerSize = 'w-4 h-4';
    const iconFontSize = 'text-base';
    
    return (
        <div
            className={containerClasses}
            title={`${badge.name}: ${badge.description}`}
        >
            {IconComponent ? (
                <IconComponent className={iconContainerSize} />
            ) : (
                <Icon className={`${iconFontSize} ${iconContainerSize}`}>{style.icon}</Icon>
            )}
        </div>
    );
};