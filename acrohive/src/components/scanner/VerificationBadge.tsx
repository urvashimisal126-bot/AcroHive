import React from 'react';
import { Satellite, Wifi, Wrench } from 'lucide-react';
import type { VerificationMethod } from '@/types';

interface VerificationBadgeProps {
  method: VerificationMethod;
}

/**
 * Pill badge showing the verification method: GPS / Network / Demo
 */
export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ method }) => {
  if (!method) return null;

  const config: Record<
    NonNullable<VerificationMethod>,
    { icon: React.ReactNode; label: string; className: string }
  > = {
    gps: {
      icon: <Satellite className="w-3 h-3" />,
      label: 'GPS',
      className: 'badge-success',
    },
    ip: {
      icon: <Wifi className="w-3 h-3" />,
      label: 'Campus Network',
      className: 'badge-success',
    },
    demo: {
      icon: <Wrench className="w-3 h-3" />,
      label: 'Demo',
      className: 'badge-warning',
    },
  };

  const { icon, label, className } = config[method];

  return (
    <span className={className} id="verification-badge">
      {icon}
      {label}
    </span>
  );
};
