'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FolderOpen, PlusCircle, Search, SlidersHorizontal, X } from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { STATUS_META } from '@/lib/constants';
import { pluralize } from '@/lib/format';
import { CASE_STATUSES, type CaseStatus, type CaseSummary, type PaginationMeta } from '@/lib/types';
import { Alert } from '@/components/ui/Alert';
import { Button, buttonClasses } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Loading';
import { Input } from '@/components/ui/Field';
import { CaseCard } from '@/components/CaseCard';
import { cn } from '@/lib/cn';

export default function CasesPage() {
  return (
    <Suspense fallback={<CasesLoading />}>
      <CasesContent />
    </Suspense>
  );
}

function CasesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const q = searchParams.get('q') ?? '';
  const statusParam = searchParams.get('status') ?? '';
  const status = (CASE_STATUSES as readonly string[]).includes(statusParam)
    ? (statusParam as CaseStatus)
    : '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const [searchInput, setSearchInput] = useState(q);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    api
      .cases({ q: q || undefined, status: status || undefined, page, limit: 10 })
      .then((response) => {
        if (!active) return;
        setCases(response.data);
        setMeta(response.meta);
      })
      .catch((err) => {
        if (!active) return;
        setError(errorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [q, status, page, reloadKey]);

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.replace(query ? `/cases?${query}` : '/cases', { scroll: false });
  }

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    updateParams({ q: searchInput.trim() || undefined, page: undefined });
  }

  function clearFilters() {
    setSearchInput('');
    router.replace('/cases', { scroll: false });
  }

  const isOfficer = user?.role === 'OFFICER';
  const hasFilters = Boolean(q || status);

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow={isOfficer ? 'Officer workspace' : 'Your case file'}
        title={isOfficer ? 'Assigned cases' : 'My cases'}
        description={
          isOfficer
            ? 'Cases explicitly assigned to you. Open a file to update its status, schedule a hearing or add a note.'
            : 'Every Local Council case you have registered, with its latest status and hearing date.'
        }
        actions={
          !isOfficer ? (
            <Link href="/cases/new" className={buttonClasses('primary', 'md')}>
              <PlusCircle className="h-4 w-4" aria-hidden="true" />
              Register a case
            </Link>
          ) : undefined
        }
      />

      <div className="space-y-3">
        <form onSubmit={submitSearch} className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by title, tracking ID or reference…"
            aria-label="Search cases"
            className="h-12 pl-10 pr-24 text-sm"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2"
          >
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-300">
            <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
            Filter
          </span>
          <FilterChip active={!status} onClick={() => updateParams({ status: undefined, page: undefined })}>
            All
          </FilterChip>
          {CASE_STATUSES.map((option) => (
            <FilterChip
              key={option}
              active={status === option}
              onClick={() => updateParams({ status: option, page: undefined })}
            >
              {STATUS_META[option].short}
            </FilterChip>
          ))}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-1 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-semibold text-ink-500 transition hover:bg-ink-100 hover:text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] text-ink-500" aria-live="polite">
          {loading
            ? 'Searching cases…'
            : `${meta?.total ?? 0} ${pluralize(meta?.total ?? 0, 'case')}${
                hasFilters ? ' match your filters' : ''
              }`}
        </p>
        {q && (
          <p className="text-[11px] text-ink-400">
            Results for <span className="font-semibold text-ink-600">“{q}”</span>
          </p>
        )}
      </div>

      {error && (
        <Alert tone="error" title="We could not load your cases">
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
        <CasesLoading />
      ) : error ? null : cases.length === 0 ? (
        <EmptyState
          icon={hasFilters ? Search : FolderOpen}
          title={hasFilters ? 'No cases match these filters' : isOfficer ? 'No assigned cases yet' : 'No cases yet'}
          description={
            hasFilters
              ? 'Try a different status, or search with fewer words. Tracking IDs look like CTUG-2026-AB12CD.'
              : isOfficer
                ? 'When a case is explicitly assigned to you, it will appear here. Contact the court administrator if you expect a case.'
                : 'Register your first Local Council case to create a tracked file and receive a unique tracking ID.'
          }
          action={
            hasFilters ? (
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : !isOfficer ? (
              <Link href="/cases/new" className={buttonClasses('primary', 'sm')}>
                <PlusCircle className="h-4 w-4" aria-hidden="true" />
                Register a case
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {cases.map((caseItem) => (
            <CaseCard key={caseItem.id} caseItem={caseItem} />
          ))}
        </div>
      )}

      {meta && meta.pages > 1 && !loading && (
        <div className="flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => updateParams({ page: page - 1 > 1 ? String(page - 1) : undefined })}
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
            onClick={() => updateParams({ page: String(page + 1) })}
          >
            Next
          </Button>
        </div>
      )}

      {!isOfficer && (
        <p className="text-center text-[10.5px] leading-relaxed text-ink-400">
          Demo cases are labelled <span className="font-semibold text-gold-700">DEMO</span>. Cases
          you register are labelled as citizen-reported.
        </p>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
        active
          ? 'bg-ink-900 text-cream shadow-sm'
          : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 hover:text-ink-800'
      )}
    >
      {children}
    </button>
  );
}

function CasesLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
