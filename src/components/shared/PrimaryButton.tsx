import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { colors } from '@/lib/constants';

type Variant = 'primary' | 'secondary' | 'danger';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
}

export default function PrimaryButton({
  children,
  variant = 'primary',
  className = '',
  style,
  ...props
}: PrimaryButtonProps) {
  const variantStyles =
    variant === 'secondary'
      ? {
          backgroundColor: colors.surface,
          color: colors.textSecondary,
          border: `1px solid ${colors.border}`,
        }
      : variant === 'danger'
        ? {
            backgroundColor: '#ef4444',
            color: 'white',
            border: '1px solid #ef4444',
          }
        : {
            backgroundColor: colors.accentCherry,
            color: 'white',
            border: `1px solid ${colors.accentCherry}`,
          };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${className}`.trim()}
      style={{ ...variantStyles, ...style }}
      {...props}
    >
      {children}
    </button>
  );
}
