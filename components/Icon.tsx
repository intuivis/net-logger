import React from 'react';

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: string; // The name of the material icon
}

export const Icon: React.FC<IconProps> = ({ children, className, ...props }) => {
  return (
    <span
      className={`material-symbols-rounded select-none ${className || ''}`}
      {...props}
      aria-hidden="true" // Icons are decorative
    >
      {children}
    </span>
  );
};
