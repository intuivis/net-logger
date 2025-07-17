
import React from 'react';
import { NetType } from '../types';
import { NET_TYPE_INFO } from '../constants';
import { Icon } from './Icon';

interface NetTypeBadgeProps {
  type: NetType;
  size?: 'sm' | 'base';
}

export const NetTypeBadge: React.FC<NetTypeBadgeProps> = ({ type, size = 'sm' }) => {
    const info = NET_TYPE_INFO[type];
    if (!info) return null;

    const baseClasses = "inline-flex items-center gap-1.5 font-semibold rounded-full";

    const sizeStyles = {
        sm: {
            container: "px-2.5 py-1 text-xs",
            icon: "text-sm"
        },
        base: {
            container: "px-4 py-1.5 text-xs",
            icon: "text-base"
        }
    }

    return (
        <div 
            className={`${baseClasses} ${info.classes} ${sizeStyles[size].container}`}
            title={type}
        >
            <Icon className={sizeStyles[size].icon}>{info.icon}</Icon>
            {size === 'base' && <span>{type}</span>}
        </div>
    );
};
