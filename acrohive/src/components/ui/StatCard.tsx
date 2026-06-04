import React, { useEffect, useRef } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  variant?: 'primary' | 'danger' | 'warning' | 'info';
}

const variantStyles: Record<string, { text: string; border: string; glow: string }> = {
  primary: {
    text: 'text-primary',
    border: 'border-primary/20',
    glow: 'shadow-[0_0_20px_rgba(0,212,255,0.08)]',
  },
  danger: {
    text: 'text-danger',
    border: 'border-danger/20',
    glow: 'shadow-[0_0_20px_rgba(255,23,68,0.08)]',
  },
  warning: {
    text: 'text-warning',
    border: 'border-warning/20',
    glow: 'shadow-[0_0_20px_rgba(255,152,0,0.08)]',
  },
  info: {
    text: 'text-primary',
    border: 'border-primary/10',
    glow: '',
  },
};

/**
 * Animated stat card with a pulse animation on value change.
 */
export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  variant = 'primary',
}) => {
  const valueRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef(value);

  // Trigger bump animation on value change
  useEffect(() => {
    if (prevValueRef.current !== value && valueRef.current) {
      valueRef.current.classList.remove('animate-counter-bump');
      // Force reflow to restart animation
      void valueRef.current.offsetHeight;
      valueRef.current.classList.add('animate-counter-bump');
    }
    prevValueRef.current = value;
  }, [value]);

  const styles = variantStyles[variant];

  return (
    <div
      className={`stat-card ${styles.border} ${styles.glow} hover:${styles.border}`}
      id={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={styles.text}>{icon}</span>
        <span className="text-xs text-muted font-mono uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span
        ref={valueRef}
        className={`text-3xl font-bold tabular-nums ${styles.text}`}
      >
        {value}
      </span>
    </div>
  );
};
