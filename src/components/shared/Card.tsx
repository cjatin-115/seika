import type { ReactNode, CSSProperties, HTMLAttributes } from 'react';
import { colors } from '@/lib/constants';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function Card({ children, className = '', style, ...props }: CardProps) {
  return (
    <div
      className={`soft-card ${className}`.trim()}
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
