import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  badge: string;
  description: string;
  buttonLabel: string;
  buttonVariant: 'primary' | 'outline';
  route: string;
}

/**
 * Role selector card used on the /auth page.
 * Two cards side by side: Student and Admin.
 */
export const RoleCard: React.FC<RoleCardProps> = ({
  icon,
  title,
  badge,
  description,
  buttonLabel,
  buttonVariant,
  route,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="
        bg-surface-card rounded-xl p-8 w-full max-w-[360px]
        border border-primary/20 
        transition-all duration-300 ease-out
        hover:border-primary/60 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]
        group cursor-pointer
      "
      onClick={() => navigate(route)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(route)}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-6
        group-hover:bg-primary/12 transition-colors duration-300">
        <div className="text-primary">{icon}</div>
      </div>

      {/* Title + Badge */}
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <span className="badge-success text-[10px]">{badge}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted leading-relaxed mb-8">{description}</p>

      {/* CTA */}
      <button
        className={`
          w-full py-3 rounded-lg font-semibold text-sm
          transition-all duration-200 active:scale-[0.97]
          ${
            buttonVariant === 'primary'
              ? 'bg-primary text-black hover:shadow-[0_0_20px_rgba(0,212,255,0.3)]'
              : 'bg-transparent border border-primary text-primary hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]'
          }
        `}
        onClick={(e) => {
          e.stopPropagation();
          navigate(route);
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
};
