import type { ReactNode } from 'react';
import { colors } from '@/lib/constants';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 style={{ color: colors.textPrimary }} className="text-2xl font-serif">
          {title}
        </h2>
        {subtitle ? (
          <p style={{ color: colors.textSecondary }} className="mt-1 text-sm">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
