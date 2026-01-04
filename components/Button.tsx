
import React from 'react';
import classNames from 'classnames';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'success';
type ButtonSize = 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className,
  ...props
}) => {
  const baseClasses =
    'font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-dark-900 disabled:bg-gray-500 disabled:cursor-wait disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-md';

  const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-brand-primary text-white hover:bg-brand-secondary',
    secondary: 'bg-dark-700 text-dark-text hover:bg-dark-600',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };
  
  const sizeClasses: Record<ButtonSize, string> = {
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'py-3 px-4 text-base font-medium',
  };

  const fullWidthClass = fullWidth ? 'w-full' : '';

  const combinedClasses = classNames(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidthClass,
    className
  );

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
