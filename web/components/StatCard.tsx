import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: 'default' | 'gold' | 'sky' | 'violet';
  href?: string;
}) {
  const tones = {
    default: 'bg-ink-50 text-ink-600 ring-ink-100',
    gold: 'bg-gold-50 text-gold-700 ring-gold-200',
    sky: 'bg-sky-50 text-sky-600 ring-sky-100',
    violet: 'bg-violet-50 text-violet-600 ring-violet-100',
  };

  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-paper p-4 shadow-card transition hover:border-ink-200 hover:shadow-lift sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-ink-400">{label}</p>
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset',
            tones[tone]
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold leading-none tracking-[-0.02em] text-ink-950">
        {value}
      </p>
      {hint && <p className="mt-2 text-[11.5px] leading-relaxed text-ink-400">{hint}</p>}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        {content}
      </Link>
    );
  }

  return content;
}
