import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ReactNode } from 'react';

type Tone = 'error' | 'success' | 'info' | 'warning';

const tones: Record<Tone, { wrapper: string; icon: string; Icon: typeof Info }> = {
  error: {
    wrapper: 'border-red-200 bg-red-50/80 text-red-800',
    icon: 'text-red-600',
    Icon: AlertCircle,
  },
  success: {
    wrapper: 'border-gold-300 bg-gold-50/80 text-ink-900',
    icon: 'text-ink-700',
    Icon: CheckCircle2,
  },
  info: {
    wrapper: 'border-sky-200 bg-sky-50/80 text-sky-900',
    icon: 'text-sky-600',
    Icon: Info,
  },
  warning: {
    wrapper: 'border-gold-300 bg-gold-50/80 text-gold-900',
    icon: 'text-gold-700',
    Icon: TriangleAlert,
  },
};

export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const style = tones[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl border px-4 py-3 text-sm', style.wrapper, className)}
    >
      <style.Icon className={cn('mt-0.5 h-4 w-4 shrink-0', style.icon)} aria-hidden="true" />
      <div className="min-w-0 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        <div className="leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
