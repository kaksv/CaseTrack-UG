import Link from 'next/link';
import { CalendarDays, ChevronRight, MapPin } from 'lucide-react';
import { CATEGORY_LABELS, LEVEL_LABELS } from '@/lib/constants';
import { formatDate, hearingCountdown, truncate } from '@/lib/format';
import type { CaseSummary } from '@/lib/types';
import { DemoBadge, StatusBadge } from './ui/StatusBadge';
import { cn } from '@/lib/cn';

export function CaseCard({
  caseItem,
  compact = false,
  className,
}: {
  caseItem: CaseSummary;
  compact?: boolean;
  className?: string;
}) {
  const showHearing = caseItem.status === 'HEARING_SCHEDULED' && caseItem.nextHearingAt;

  return (
    <Link
      href={`/cases/${caseItem.id}`}
      className={cn(
        'group block rounded-2xl border border-ink-100 bg-paper p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:p-5',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={caseItem.status} />
        {caseItem.isDemo && <DemoBadge />}
        <span className="ml-auto font-mono text-[10.5px] font-medium tracking-tight text-ink-400">
          {caseItem.trackingId}
        </span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink-900 transition-colors group-hover:text-ink-700 sm:text-base">
            {caseItem.title}
          </h3>
          {!compact && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-500">
              {truncate(caseItem.description, 180)}
            </p>
          )}
        </div>
        <ChevronRight
          className="mt-1 h-4 w-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-500"
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11.5px] text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
          {caseItem.institution.name}
          <span className="text-ink-300">·</span>
          {LEVEL_LABELS[caseItem.institution.level]}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-ink-300" aria-hidden="true" />
          {CATEGORY_LABELS[caseItem.category]}
        </span>
        {showHearing ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-50 px-2 py-0.5 font-semibold text-gold-800 ring-1 ring-inset ring-gold-200">
            <CalendarDays className="h-3 w-3" aria-hidden="true" />
            {formatDate(caseItem.nextHearingAt)} · {hearingCountdown(caseItem.nextHearingAt)}
          </span>
        ) : (
          <span className="ml-auto text-ink-400">
            Updated {formatDate(caseItem.lastEventAt)}
          </span>
        )}
      </div>
    </Link>
  );
}
