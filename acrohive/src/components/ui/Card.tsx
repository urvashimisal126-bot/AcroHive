import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
}) => {
  return (
    <div className={`cyber-card ${hover ? '' : 'hover:border-primary-border hover:shadow-none'} ${className}`}>
      {children}
    </div>
  );
};
