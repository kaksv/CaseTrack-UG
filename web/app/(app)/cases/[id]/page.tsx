'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock,
  FileQuestion,
  History,
  Info,
  Landmark,
  Lock,
  MapPin,
  Printer,
  ShieldCheck,
  Tag,
  UserRound,
} from 'lucide-react';
import { api, ApiError, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { CATEGORY_LABELS, LEVEL_LABELS, STATUS_META } from '@/lib/constants';
import {
  formatDate,
  formatDateTime,
  formatLongDate,
  formatTime,
  hearingCountdown,
} from '@/lib/format';
import type { CaseEvent, CaseSummary } from '@/lib/types';
import { Alert } from '@/components/ui/Alert';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Loading';
import { DemoBadge, StatusBadge } from '@/components/ui/StatusBadge';
import { Timeline } from '@/components/Timeline';
import { OfficerActions } from '@/components/OfficerActions';

export default function CaseDetailPage() {
  return (
    <Suspense fallback={<DetailLoading />}>
      <CaseDetailContent />
    </Suspense>
  );
}

function CaseDetailContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const id = params?.id;
  const created = searchParams.get('created') === '1';

  const [caseItem, setCaseItem] = useState<CaseSummary | null>(null);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!id) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const [caseResponse, eventsResponse] = await Promise.all([
          api.case(id),
          api.events(id),
        ]);
        setCaseItem(caseResponse.data);
        setEvents(eventsResponse.data);
        setErrorStatus(null);
      } catch (err) {
        setError(errorMessage(err));
        setErrorStatus(err instanceof ApiError ? err.status : null);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <DetailLoading />;

  if (!caseItem) {
    const forbidden = errorStatus === 403;
    const missing = errorStatus === 404;
    return (
      <div className="space-y-6 animate-fade-up">
        <BackLink isOfficer={user?.role === 'OFFICER'} />
        <EmptyState
          icon={forbidden ? Lock : missing ? FileQuestion : FileQuestion}
          title={
            forbidden
              ? 'This case is not assigned to you'
              : missing
                ? 'Case not found'
                : 'We could not load this case'
          }
          description={
            forbidden
              ? 'Officers can only open cases explicitly assigned to them. If you expected access, contact the court administrator.'
              : missing
                ? 'The tracking link may be wrong, or the case no longer exists in this demo.'
                : error ?? 'Check your connection and try again.'
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {!forbidden && !missing && (
                <Button variant="secondary" size="sm" onClick={() => void load()}>
                  Try again
                </Button>
              )}
              <Link href="/cases" className={buttonClasses('primary', 'sm')}>
                Back to cases
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const isOfficer = user?.role === 'OFFICER';
  const hasUpcomingHearing =
    caseItem.status === 'HEARING_SCHEDULED' && Boolean(caseItem.nextHearingAt);

  return (
    <div className="space-y-5 animate-fade-up">
      <BackLink isOfficer={isOfficer} />

      {created && (
        <Alert tone="success" title="Case registered successfully">
          Your tracking ID is{' '}
          <span className="font-mono font-semibold">{caseItem.trackingId}</span>. Keep it safe — you
          can use it to find this case again.
        </Alert>
      )}

      {error && (
        <Alert tone="error" title="Some case information may be out of date">
          {error}
        </Alert>
      )}

      <section className="relative overflow-hidden rounded-2xl border border-ink-100 bg-paper p-5 shadow-card sm:p-6">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-gold-200/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap items-center gap-2">
          <StatusBadge status={caseItem.status} />
          {caseItem.isDemo ? (
            <DemoBadge />
          ) : (
            <span className="inline-flex items-center rounded-md bg-ink-50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-ink-500 ring-1 ring-inset ring-ink-100">
              Citizen reported
            </span>
          )}
          <span className="ml-auto font-mono text-[10.5px] font-medium text-ink-400">
            {caseItem.trackingId}
          </span>
        </div>

        <h1 className="relative mt-3 font-display text-[1.8rem] font-semibold leading-[1.15] tracking-[-0.025em] text-ink-950 sm:text-[2.15rem]">
          {caseItem.title}
        </h1>

        <p className="relative mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-500">
          <MapPin className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
          {caseItem.institution.name}
          <span className="text-ink-300" aria-hidden="true">·</span>
          {LEVEL_LABELS[caseItem.institution.level]}
          <span className="text-ink-300" aria-hidden="true">·</span>
          {caseItem.institution.subcounty}, {caseItem.institution.district}
        </p>
        <p className="relative mt-1 text-[11px] leading-relaxed text-ink-400">
          {STATUS_META[caseItem.status].description}
        </p>

        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1 text-[10.5px] font-medium text-ink-600 ring-1 ring-inset ring-ink-100">
            <Tag className="h-3 w-3 text-ink-400" aria-hidden="true" />
            {CATEGORY_LABELS[caseItem.category]}
          </span>
          {caseItem.reference && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1 text-[10.5px] font-medium text-ink-600 ring-1 ring-inset ring-ink-100">
              <Landmark className="h-3 w-3 text-ink-400" aria-hidden="true" />
              Ref {caseItem.reference}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1 text-[10.5px] font-medium text-ink-600 ring-1 ring-inset ring-ink-100">
            <Clock className="h-3 w-3 text-ink-400" aria-hidden="true" />
            Filed {formatDate(caseItem.createdAt)}
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className={buttonClasses('ghost', 'sm', 'no-print ml-auto')}
          >
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            Print
          </button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-ink-900">What the case is about</h2>
            <p className="mt-2.5 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-600">
              {caseItem.description}
            </p>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-ink-900">Progress timeline</h2>
                <p className="mt-0.5 text-[11px] text-ink-400">
                  {events.length} {events.length === 1 ? 'entry' : 'entries'} · oldest first
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-50 px-2.5 py-1 text-[10px] font-semibold text-ink-500 ring-1 ring-inset ring-ink-100">
                <History className="h-3 w-3" aria-hidden="true" />
                Chronological
              </span>
            </div>

            <div className="mt-6">
              <Timeline events={events} />
            </div>

            <p className="mt-6 border-t border-ink-100 pt-3 text-[10px] leading-relaxed text-ink-400">
              Each entry records its author, source and timestamp. Entries marked{' '}
              <span className="font-semibold text-gold-700">DEMO</span> are synthetic records created
              for this prototype.
            </p>
          </Card>
        </div>

        <div className="space-y-4">
          {hasUpcomingHearing && caseItem.nextHearingAt && (
            <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-5 text-cream shadow-lift">
              <div
                className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-gold-500/15 blur-3xl"
                aria-hidden="true"
              />
              <p className="relative flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-gold-400">
                <CalendarDays className="h-3 w-3" aria-hidden="true" />
                Next hearing
              </p>
              <p className="relative mt-2 font-display text-2xl font-semibold leading-tight tracking-[-0.02em]">
                {formatLongDate(caseItem.nextHearingAt)}
              </p>
              <p className="relative mt-1 text-[12px] text-white/50">
                {formatTime(caseItem.nextHearingAt)} EAT · {caseItem.institution.name}
              </p>
              <span className="relative mt-4 inline-flex rounded-full bg-gold-500 px-2.5 py-1 text-[10px] font-bold text-ink-950">
                {hearingCountdown(caseItem.nextHearingAt)}
              </span>
            </div>
          )}

          {isOfficer && <OfficerActions caseItem={caseItem} onChanged={() => load(true)} />}

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink-900">Case file</h2>
            <dl className="mt-3 divide-y divide-ink-50">
              <DetailRow label="Court">{caseItem.institution.name}</DetailRow>
              <DetailRow label="Level">{LEVEL_LABELS[caseItem.institution.level]}</DetailRow>
              <DetailRow label="Location">
                {caseItem.institution.subcounty}, {caseItem.institution.district}
              </DetailRow>
              <DetailRow label="Category">{CATEGORY_LABELS[caseItem.category]}</DetailRow>
              <DetailRow label="Reference">{caseItem.reference ?? '—'}</DetailRow>
              <DetailRow label="Filed">{formatDate(caseItem.createdAt)}</DetailRow>
              <DetailRow label="Last update">{formatDateTime(caseItem.lastEventAt)}</DetailRow>
              <DetailRow label="Assigned officer">
                {caseItem.assignedOfficer?.name ?? 'Awaiting assignment'}
              </DetailRow>
              {isOfficer && <DetailRow label="Citizen">{caseItem.citizen.name}</DetailRow>}
              <DetailRow label="Record source">
                {caseItem.isDemo ? 'Synthetic demo' : 'Citizen reported'}
              </DetailRow>
            </dl>
          </Card>

          {isOfficer ? (
            <div className="flex gap-2.5 rounded-xl border border-ink-100 bg-white/50 p-4">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
              <p className="text-[10.5px] leading-relaxed text-ink-400">
                You can view and update this case because it is explicitly assigned to you. Every
                action is recorded against your name and timestamp.
              </p>
            </div>
          ) : (
            <Card className="p-5">
              <div className="flex gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500 ring-1 ring-inset ring-ink-100">
                  <Info className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[12px] font-semibold text-ink-900">
                    Need to add information?
                  </h2>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-ink-400">
                    This prototype does not include messaging or SMS. Visit the LC court office and
                    quote your tracking ID. This is not legal advice.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {caseItem.isDemo && (
            <div className="rounded-xl border border-dashed border-gold-300 bg-gold-50/60 p-4">
              <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-gold-900">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-700" aria-hidden="true" />
                Demo record. The people, locations and events in this case are synthetic and do not
                represent a real dispute or court file.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 px-1 text-[10px] text-ink-400">
            <UserRound className="h-3 w-3" aria-hidden="true" />
            Citizen: {caseItem.citizen.name}
            {isOfficer && (
              <>
                <span aria-hidden="true">·</span>
                <Building2 className="h-3 w-3" aria-hidden="true" />
                {caseItem.institution.district}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BackLink({ isOfficer }: { isOfficer: boolean }) {
  return (
    <Link
      href="/cases"
      className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-500 transition hover:text-ink-900"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
      {isOfficer ? 'Back to assigned cases' : 'Back to my cases'}
    </Link>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-400">
        {label}
      </dt>
      <dd className="text-right text-[11.5px] font-medium leading-relaxed text-ink-700">
        {children}
      </dd>
    </div>
  );
}

function DetailLoading() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-3 w-32" />
      <div className="rounded-2xl border border-ink-100 bg-paper p-6">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>
        <Skeleton className="mt-4 h-9 w-3/4" />
        <Skeleton className="mt-3 h-4 w-1/2" />
        <div className="mt-5 flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-32 rounded-full" />
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-ink-100 bg-paper p-6">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </div>
          <div className="rounded-2xl border border-ink-100 bg-paper p-6">
            <Skeleton className="h-4 w-36" />
            <div className="mt-6 space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl bg-ink-950 p-5">
            <Skeleton className="h-3 w-24 bg-white/10" />
            <Skeleton className="mt-3 h-7 w-48 bg-white/10" />
          </div>
          <div className="rounded-2xl border border-ink-100 bg-paper p-5">
            <Skeleton className="h-4 w-24" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex justify-between gap-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
