'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  CheckCheck,
  Inbox,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import type { AppNotification, PaginationMeta } from '@/lib/types';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Loading';
import { cn } from '@/lib/cn';

type Filter = 'all' | 'unread';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.notifications({
        page,
        limit: 15,
        unread: filter === 'unread' ? true : undefined,
      });
      setItems(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  function changeFilter(next: Filter) {
    setFilter(next);
    setPage(1);
  }

  async function markRead(notification: AppNotification) {
    if (notification.read) return;
    setItems((current) =>
      current.map((item) => (item.id === notification.id ? { ...item, read: true } : item))
    );
    setMeta((current) =>
      current ? { ...current, unreadCount: Math.max(0, (current.unreadCount ?? 1) - 1) } : current
    );
    window.dispatchEvent(new Event('casetrack:notifications'));
    try {
      await api.markNotificationRead(notification.id);
      if (filter === 'unread') {
        setItems((current) => current.filter((item) => item.id !== notification.id));
      }
    } catch {
      void load();
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setMeta((current) => (current ? { ...current, unreadCount: 0 } : current));
      window.dispatchEvent(new Event('casetrack:notifications'));
      if (filter === 'unread') {
        setItems([]);
        setMeta((current) =>
          current ? { ...current, total: 0, pages: 1, unreadCount: 0 } : current
        );
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = meta?.unreadCount ?? 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="In-app updates about your Local Council cases. This prototype does not send SMS or email."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void markAllRead()}
            loading={markingAll}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Mark all as read
          </Button>
        }
      />

      {user?.isDemo && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-gold-300 bg-gold-50/60 px-3.5 py-2.5 text-[11px] text-gold-900">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-gold-700" aria-hidden="true" />
          <span className="font-semibold">Demo inbox.</span>
          <span className="text-gold-800/80">These notifications relate to synthetic cases only.</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-full bg-ink-50 p-1" role="tablist" aria-label="Filter notifications">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => changeFilter('all')}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
              filter === 'all'
                ? 'bg-white text-ink-900 shadow-sm ring-1 ring-ink-100'
                : 'text-ink-500 hover:text-ink-800'
            )}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'unread'}
            onClick={() => changeFilter('unread')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
              filter === 'unread'
                ? 'bg-white text-ink-900 shadow-sm ring-1 ring-ink-100'
                : 'text-ink-500 hover:text-ink-800'
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className="rounded-full bg-gold-500 px-1.5 text-[9px] font-bold text-ink-950">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
        <p className="ml-auto text-[11px] text-ink-400" aria-live="polite">
          {loading
            ? 'Loading…'
            : `${meta?.total ?? 0} ${meta?.total === 1 ? 'notification' : 'notifications'}`}
        </p>
      </div>

      {error && (
        <Alert tone="error" title="Could not load notifications">
          <p>{error}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-2"
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Try again
          </Button>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={filter === 'unread' ? 'You are all caught up' : 'No notifications yet'}
          description={
            filter === 'unread'
              ? 'There are no unread updates. New case activity will appear here.'
              : 'When an officer updates one of your cases or schedules a hearing, you will see it here.'
          }
          action={
            filter === 'unread' ? (
              <Button variant="secondary" size="sm" onClick={() => changeFilter('all')}>
                View all notifications
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((notification) => (
            <article
              key={notification.id}
              className={cn(
                'relative overflow-hidden rounded-2xl border p-4 transition sm:p-5',
                notification.read
                  ? 'border-ink-100 bg-paper'
                  : 'border-gold-200 bg-gold-50/40'
              )}
            >
              {!notification.read && (
                <span className="absolute inset-y-0 left-0 w-0.5 bg-gold-500" aria-hidden="true" />
              )}
              <div className="flex gap-3">
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ring-inset',
                    notification.read
                      ? 'bg-ink-50 text-ink-400 ring-ink-100'
                      : 'bg-gold-100 text-gold-700 ring-gold-200'
                  )}
                >
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <h2
                      className={cn(
                        'text-[13px] leading-snug',
                        notification.read
                          ? 'font-medium text-ink-700'
                          : 'font-semibold text-ink-900'
                      )}
                    >
                      {notification.title}
                      {!notification.read && (
                        <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-gold-500 align-middle" aria-label="Unread" />
                      )}
                    </h2>
                    <time className="shrink-0 text-[9.5px] text-ink-400">
                      {formatDateTime(notification.createdAt)}
                    </time>
                  </div>

                  <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
                    {notification.body}
                  </p>

                  {notification.case && (
                    <div className="mt-2.5 inline-flex max-w-full items-center gap-1.5 rounded-lg bg-white/70 px-2.5 py-1.5 text-[10px] ring-1 ring-inset ring-ink-100">
                      <span className="font-mono font-medium text-ink-500">
                        {notification.case.trackingId}
                      </span>
                      <span className="text-ink-300" aria-hidden="true">·</span>
                      <span className="truncate text-ink-600">{notification.case.title}</span>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {notification.case && (
                      <Link
                        href={`/cases/${notification.case.id}`}
                        onClick={() => void markRead(notification)}
                        className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-ink-700 transition hover:text-ink-950"
                      >
                        View case
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    )}
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => void markRead(notification)}
                        className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-ink-400 transition hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                      >
                        {markingAll ? (
                          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                        ) : (
                          <CheckCheck className="h-3 w-3" aria-hidden="true" />
                        )}
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {meta && meta.pages > 1 && !loading && (
        <div className="flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </Button>
          <p className="text-[11.5px] text-ink-500">
            Page <span className="font-semibold text-ink-800">{page}</span> of {meta.pages}
          </p>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= meta.pages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
