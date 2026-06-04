import React from 'react';
import { Hexagon } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { icon: 18, text: 'text-lg' },
  md: { icon: 24, text: 'text-xl' },
  lg: { icon: 32, text: 'text-3xl' },
};

/**
 * AcroHive logo wordmark.
 * "ACRO" in white, "HIVE" in cyber blue (#00D4FF).
 */
export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Hexagon
        className="text-primary"
        size={icon}
        strokeWidth={2}
      />
      <span className={`${text} font-extrabold tracking-tight`}>
        <span className="text-white">ACRO</span>
        <span className="text-primary">HIVE</span>
      </span>
    </div>
  );
};
