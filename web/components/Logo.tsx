import Link from 'next/link';
import { cn } from '@/lib/cn';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  withWordmark?: boolean;
  href?: string;
  className?: string;
}

const sizes = {
  sm: { mark: 'h-8 w-8', text: 'text-lg', badge: 'text-[9px]' },
  md: { mark: 'h-10 w-10', text: 'text-xl', badge: 'text-[10px]' },
  lg: { mark: 'h-12 w-12', text: 'text-2xl', badge: 'text-[11px]' },
};

export function Logo({
  variant = 'dark',
  size = 'md',
  withWordmark = true,
  href = '/',
  className,
}: LogoProps) {
  const dims = sizes[size];
  const onDark = variant === 'light';

  const content = (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 40 40"
        role="img"
        aria-label="CaseTrack UG"
        className={cn('shrink-0', dims.mark)}
      >
        <rect
          width="40"
          height="40"
          rx="12"
          fill={onDark ? '#c9a227' : '#0e1f19'}
        />
        <path
          d="M20 8.5v23"
          stroke={onDark ? '#0e1f19' : '#c9a227'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M12 12.5h16"
          stroke={onDark ? '#0e1f19' : '#c9a227'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M12.5 12.5 9 20.5a3.9 3.9 0 0 0 7 0l-3.5-8Z"
          fill="none"
          stroke={onDark ? '#0e1f19' : '#c9a227'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M27.5 12.5 24 20.5a3.9 3.9 0 0 0 7 0l-3.5-8Z"
          fill="none"
          stroke={onDark ? '#0e1f19' : '#c9a227'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M14.5 31.5h11"
          stroke={onDark ? '#0e1f19' : '#c9a227'}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      {withWordmark && (
        <span className="flex items-baseline gap-1.5">
          <span
            className={cn(
              'font-semibold tracking-[-0.02em]',
              dims.text,
              onDark ? 'text-cream' : 'text-ink-950'
            )}
          >
            CaseTrack
          </span>
          <span
            className={cn(
              'rounded-md px-1.5 py-0.5 font-bold uppercase tracking-[0.14em]',
              dims.badge,
              onDark ? 'bg-gold-500 text-ink-950' : 'bg-gold-100 text-gold-800'
            )}
          >
            UG
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="inline-flex rounded-xl focus-visible:outline-none">
      {content}
    </Link>
  );
}
