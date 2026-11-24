'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  FolderOpen,
  Inbox,
  MessageCircle,
  MapPin,
  PlusCircle,
  Scale,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { CATEGORY_LABELS, STATUS_META } from '@/lib/constants';
import { formatDate, formatDateTime, formatTime, firstName, hearingCountdown } from '@/lib/format';
import type { AppNotification, CaseStats, CaseSummary, CaseStatus } from '@/lib/types';
import { Alert } from '@/components/ui/Alert';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Card, PageHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton, Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatCard } from '@/components/StatCard';
import { cn } from '@/lib/cn';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CaseStats | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsResponse, notificationsResponse] = await Promise.all([
        api.stats(),
        api.notifications({ limit: 4 }),
      ]);
      setStats(statsResponse.data);
      setNotifications(notificationsResponse.data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user) return null;

  const isOfficer = user.role === 'OFFICER';
  const nextHearing = stats?.upcomingHearings[0] ?? null;

  return (
    <div className="space-y-6 animate-fade-up sm:space-y-8">
      <PageHeader
        eyebrow={isOfficer ? 'Officer workspace' : 'Citizen dashboard'}
        title={`Welcome back, ${firstName(user.name)}.`}
        description={
          isOfficer
            ? 'Review your assigned caseload, keep hearing dates on track and record clear updates.'
            : 'Follow every Local Council case you have registered, with hearing dates and updates in one place.'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/legal-assistant" className={buttonClasses('primary', 'md')}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Ask legal questions
            </Link>
            {isOfficer ? (
              <Link href="/cases" className={buttonClasses('secondary', 'md')}>
                <FolderOpen className="h-4 w-4" aria-hidden="true" />
                Assigned cases
              </Link>
            ) : (
              <Link href="/cases/new" className={buttonClasses('secondary', 'md')}>
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                Register a case
              </Link>
            )}
          </div>
        }
      />

      {user.isDemo && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-dashed border-gold-300 bg-gold-50/60 px-3.5 py-2.5 text-[11px] text-gold-900">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-gold-700" aria-hidden="true" />
          <span className="font-semibold">Demo workspace.</span>
          <span className="text-gold-800/80">
            All cases, people and notifications shown here are synthetic.
          </span>
          <Link
            href="/profile"
            className="ml-auto font-semibold underline decoration-gold-400 underline-offset-2 hover:text-gold-950"
          >
            Account details
          </Link>
        </div>
      )}

      {error && (
        <Alert tone="error" title="We could not load your dashboard">
          <p>{error}</p>
          <Button variant="secondary" size="sm" className="mt-2" onClick={() => void load()}>
            Try again
          </Button>
        </Alert>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label={isOfficer ? 'Assigned cases' : 'Total cases'}
              value={stats.total}
              hint={isOfficer ? 'Explicitly assigned to you' : 'Cases you have registered'}
              icon={FolderOpen}
            />
            <StatCard
              label="Active"
              value={stats.active}
              hint="Not yet closed"
              icon={ClipboardList}
              tone="sky"
            />
            <StatCard
              label="Hearings"
              value={stats.statusCounts.HEARING_SCHEDULED}
              hint="Hearing scheduled"
              icon={CalendarDays}
              tone="gold"
            />
            <StatCard
              label="Unread updates"
              value={stats.unreadNotifications}
              hint="In-app notifications"
              icon={Bell}
              tone="violet"
              href="/notifications"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
            <div className="space-y-5">
              {nextHearing ? (
                <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-5 text-cream shadow-lift sm:p-6">
                  <div
                    className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-gold-500/15 blur-3xl"
                    aria-hidden="true"
                  />
                  <div className="relative flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-gold-400">
                        <CalendarDays className="h-3 w-3" aria-hidden="true" />
                        Next hearing
                      </p>
                      <p className="mt-2 font-display text-[1.7rem] font-semibold leading-tight tracking-[-0.02em] sm:text-3xl">
                        {formatDate(nextHearing.nextHearingAt)}
                      </p>
                      <p className="mt-0.5 text-[12px] text-white/50">
                        {formatTime(nextHearing.nextHearingAt)} EAT · {nextHearing.institution.name}
                      </p>
                    </div>
                    <span className="rounded-full bg-gold-500 px-3 py-1 text-[10.5px] font-bold text-ink-950">
                      {hearingCountdown(nextHearing.nextHearingAt)}
                    </span>
                  </div>

                  <div className="relative mt-5 border-t border-white/10 pt-4">
                    <p className="text-[13px] font-medium text-white/85">{nextHearing.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-white/40">
                      <span className="font-mono">{nextHearing.trackingId}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {nextHearing.institution.subcounty}, {nextHearing.institution.district}
                      </span>
                    </div>
                    <Link
                      href={`/cases/${nextHearing.id}`}
                      className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-gold-400 transition hover:text-gold-300"
                    >
                      View case and hearing details
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ) : (
                <Card className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-500 ring-1 ring-inset ring-ink-100">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-ink-900">No upcoming hearings</h2>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
                        {isOfficer
                          ? 'Schedule a hearing from an assigned case to see it here.'
                          : 'When an officer schedules a hearing for one of your cases, the date will appear here.'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-ink-900">
                      {isOfficer ? 'Recent in your caseload' : 'Your recent cases'}
                    </h2>
                    <p className="mt-0.5 text-[11px] text-ink-400">Sorted by latest activity</p>
                  </div>
                  <Link
                    href="/cases"
                    className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-ink-600 hover:text-ink-950"
                  >
                    View all
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>

                {stats.recentCases.length === 0 ? (
                  <div className="mt-4">
                    <EmptyState
                      icon={FolderOpen}
                      title={isOfficer ? 'No assigned cases yet' : 'No cases yet'}
                      description={
                        isOfficer
                          ? 'Cases explicitly assigned to you will appear here.'
                          : 'Register your first Local Council case to start a tracked file.'
                      }
                      action={
                        !isOfficer ? (
                          <Link href="/cases/new" className={buttonClasses('primary', 'sm')}>
                            Register a case
                          </Link>
                        ) : undefined
                      }
                      className="py-8"
                    />
                  </div>
                ) : (
                  <div className="mt-4 divide-y divide-ink-100">
                    {stats.recentCases.slice(0, 5).map((caseItem) => (
                      <CaseRow key={caseItem.id} caseItem={caseItem} />
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-5">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-ink-900">Latest updates</h2>
                  <Link
                    href="/notifications"
                    className="text-[11.5px] font-semibold text-ink-600 hover:text-ink-950"
                  >
                    All
                  </Link>
                </div>

                {notifications.length === 0 ? (
                  <div className="mt-4 flex flex-col items-center py-7 text-center">
                    <Inbox className="h-6 w-6 text-ink-300" aria-hidden="true" />
                    <p className="mt-2 text-[12px] font-medium text-ink-600">No updates yet</p>
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      Case changes will show up here.
                    </p>
                  </div>
                ) : (
                  <ul className="mt-3 divide-y divide-ink-100">
                    {notifications.map((notification) => (
                      <li key={notification.id} className="py-2.5 first:pt-1 last:pb-0">
                        <NotificationPreview notification={notification} />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card className="p-5">
                <h2 className="text-sm font-semibold text-ink-900">Caseload by stage</h2>
                <div className="mt-4 space-y-2.5">
                  {(Object.keys(STATUS_META) as CaseStatus[]).map((status) => {
                    const count = stats.statusCounts[status] ?? 0;
                    const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5 font-medium text-ink-600">
                            <span
                              className={cn('h-1.5 w-1.5 rounded-full', STATUS_META[status].dot)}
                              aria-hidden="true"
                            />
                            {STATUS_META[status].label}
                          </span>
                          <span className="font-semibold text-ink-800">{count}</span>
                        </div>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink-100">
                          <div
                            className={cn('h-full rounded-full', STATUS_META[status].dot)}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <div className="rounded-2xl border border-ink-100 bg-white/50 p-4">
                <div className="flex gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                  <div>
                    <p className="text-[11.5px] font-semibold text-ink-700">
                      {isOfficer ? 'Assignment policy' : 'About your tracking ID'}
                    </p>
                    <p className="mt-0.5 text-[10.5px] leading-relaxed text-ink-400">
                      {isOfficer
                        ? 'You can only open and update cases explicitly assigned to you. Contact the court administrator to change an assignment.'
                        : 'Keep your CTUG-YYYY-XXXXXX tracking ID safe. Anyone with the ID and access to your account can view the case.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function CaseRow({ caseItem }: { caseItem: CaseSummary }) {
  return (
    <Link
      href={`/cases/${caseItem.id}`}
      className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0 focus-visible:outline-none"
    >
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-500 ring-1 ring-inset ring-ink-100'
        )}
      >
        <Scale className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-semibold text-ink-900 group-hover:text-ink-700">
          {caseItem.title}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[10.5px] text-ink-400">
          <span className="font-mono">{caseItem.trackingId}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{caseItem.institution.name}</span>
          <span aria-hidden="true">·</span>
          <span>{CATEGORY_LABELS[caseItem.category]}</span>
        </p>
      </div>
      <StatusBadge status={caseItem.status} withDot={false} className="hidden sm:inline-flex" />
      <ArrowRight
        className="h-3.5 w-3.5 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-ink-500"
        aria-hidden="true"
      />
    </Link>
  );
}

function NotificationPreview({ notification }: { notification: AppNotification }) {
  function markRead() {
    if (notification.read) return;
    api
      .markNotificationRead(notification.id)
      .then(() => window.dispatchEvent(new Event('casetrack:notifications')))
      .catch(() => undefined);
  }

  const content = (
    <div className="flex gap-2.5">
      <span
        className={cn(
          'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
          notification.read ? 'bg-ink-200' : 'bg-gold-500'
        )}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-[11.5px] leading-snug',
            notification.read ? 'font-medium text-ink-600' : 'font-semibold text-ink-900'
          )}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-ink-400">
          {notification.body}
        </p>
        <p className="mt-1 flex items-center gap-1 text-[9.5px] text-ink-300">
          <Clock className="h-2.5 w-2.5" aria-hidden="true" />
          {formatDate(notification.createdAt)}
        </p>
      </div>
    </div>
  );

  if (notification.case) {
    return (
      <Link
        href={`/cases/${notification.case.id}`}
        onClick={markRead}
        className="block rounded-lg transition hover:bg-ink-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
      >
        {content}
      </Link>
    );
  }

  return content;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-ink-100 bg-paper p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-8 w-12" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-5">
          <div className="rounded-2xl bg-ink-950 p-6">
            <Skeleton className="h-3 w-24 bg-white/10" />
            <Skeleton className="mt-3 h-9 w-52 bg-white/10" />
            <Skeleton className="mt-2 h-3 w-40 bg-white/10" />
          </div>
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="space-y-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
