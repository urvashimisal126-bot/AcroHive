import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: 'cyber-btn',
  outline: 'cyber-btn-outline',
  danger:
    'bg-danger text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,23,68,0.3)] active:scale-[0.97]',
  ghost:
    'bg-transparent text-muted hover:text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200',
};

const sizeClasses: Record<string, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: '',
  lg: 'text-base px-8 py-4',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
