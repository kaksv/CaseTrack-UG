import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-ink-400', className)} aria-hidden="true" />;
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-ink-100 bg-paper px-6 py-14 text-sm text-ink-500">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-ink-100/80', className)} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-100 bg-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="mt-4 h-6 w-3/4" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <div className="mt-5 flex gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function FullPageLoader({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-950">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-gold-500/20" />
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-ink-500">{children ?? 'Loading your workspace…'}</p>
    </div>
  );
}
