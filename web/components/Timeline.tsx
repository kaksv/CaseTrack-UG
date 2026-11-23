import {
  ArrowRight,
  CalendarDays,
  FilePlus2,
  Flag,
  RefreshCw,
  StickyNote,
  type LucideIcon,
} from 'lucide-react';
import { EVENT_LABELS, SOURCE_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';
import type { CaseEvent, CaseEventType } from '@/lib/types';
import { DemoBadge, StatusBadge } from './ui/StatusBadge';
import { EmptyState } from './ui/EmptyState';
import { History } from 'lucide-react';
import { cn } from '@/lib/cn';

const EVENT_STYLES: Record<CaseEventType, { Icon: LucideIcon; wrapper: string }> = {
  CASE_CREATED: { Icon: FilePlus2, wrapper: 'bg-ink-900 text-cream ring-ink-900' },
  STATUS_CHANGE: { Icon: RefreshCw, wrapper: 'bg-sky-50 text-sky-700 ring-sky-200' },
  HEARING_SCHEDULED: { Icon: CalendarDays, wrapper: 'bg-gold-50 text-gold-700 ring-gold-300' },
  MILESTONE: { Icon: Flag, wrapper: 'bg-violet-50 text-violet-700 ring-violet-200' },
  NOTE: { Icon: StickyNote, wrapper: 'bg-ink-50 text-ink-600 ring-ink-200' },
};

export function Timeline({ events }: { events: CaseEvent[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No timeline entries yet"
        description="Updates from the LC court will appear here in chronological order."
      />
    );
  }

  const ordered = [...events].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <ol className="relative">
      {ordered.map((event, index) => {
        const isLast = index === ordered.length - 1;
        const style = EVENT_STYLES[event.type];
        const Icon = style.Icon;

        return (
          <li key={event.id} className="relative flex gap-4 sm:gap-5">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ring-inset',
                  style.wrapper
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              {!isLast && (
                <span
                  className="w-px flex-1 bg-gradient-to-b from-ink-200 via-ink-100 to-ink-100"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className={cn('min-w-0 flex-1 pt-0.5', isLast ? 'pb-0' : 'pb-8')}>
              <div className="flex flex-wrap items-center gap-2">
                <time
                  dateTime={event.createdAt}
                  className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-400"
                >
                  {formatDateTime(event.createdAt)}
                </time>
                <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-ink-500 ring-1 ring-inset ring-ink-100">
                  {EVENT_LABELS[event.type]}
                </span>
                {isLast && (
                  <span className="rounded-full bg-ink-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-cream">
                    Latest
                  </span>
                )}
                {event.source === 'DEMO' && <DemoBadge />}
              </div>

              <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink-900">
                {event.title}
              </h3>

              {event.description && (
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{event.description}</p>
              )}

              {event.hearingDate && (
                <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-gold-200 bg-gold-50/70 px-3.5 py-2.5">
                  <CalendarDays className="h-4 w-4 shrink-0 text-gold-700" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold-700">
                      Hearing date
                    </p>
                    <p className="text-sm font-semibold text-ink-900">
                      {formatDateTime(event.hearingDate)}
                    </p>
                  </div>
                </div>
              )}

              {event.statusFrom && event.statusTo && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <StatusBadge status={event.statusFrom} withDot={false} />
                  <ArrowRight className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
                  <StatusBadge status={event.statusTo} withDot={false} />
                </div>
              )}

              <p className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-ink-400">
                <span className="font-medium text-ink-500">{event.authorName}</span>
                <span aria-hidden="true">·</span>
                <span>{SOURCE_LABELS[event.source]}</span>
                {event.authorRole === 'OFFICER' && SOURCE_LABELS[event.source] !== 'Court officer' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Court officer</span>
                  </>
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
