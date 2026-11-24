import { STATUS_META, ROLE_LABELS } from '@/lib/constants';
import type { CaseStatus, Role } from '@/lib/types';
import { cn } from '@/lib/cn';

export function StatusBadge({
  status,
  withDot = true,
  className,
}: {
  status: CaseStatus;
  withDot?: boolean;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        meta.badge,
        className
      )}
    >
      {withDot && <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} aria-hidden="true" />}
      {meta.label}
    </span>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-dashed border-gold-400 bg-gold-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold-800',
        className
      )}
      title="Synthetic demo record — not a real case"
    >
      Demo
    </span>
  );
}


export function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    CITIZEN: 'bg-ink-100 text-ink-700 ring-ink-200',
    OFFICER: 'bg-ink-900 text-cream ring-ink-900',
    COURT_ADMIN: 'bg-gold-50 text-gold-800 ring-gold-300',
    SYSTEM_ADMIN: 'bg-violet-50 text-violet-700 ring-violet-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset',
        styles[role],
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
