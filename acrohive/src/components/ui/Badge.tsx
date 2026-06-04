import React from 'react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'badge-success',
  danger: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'info',
  children,
  className = '',
}) => {
  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
