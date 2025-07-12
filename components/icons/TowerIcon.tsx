
import React from 'react';

export const TowerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 2L12 9"/>
        <path d="M16 9L8 9"/>
        <path d="M12 14L12 22"/>
        <path d="M9 14L15 14"/>
        <path d="M19 14L17 14"/>
        <path d="M7 14L5 14"/>
        <path d="M16 18L8 18"/>
        <path d="M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
    </svg>
);