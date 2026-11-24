
'use client';

import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import {
  Building2,
  PlusCircle,
  Pencil,
  Search,
  CheckCircle2,
  CirclePause,
  RefreshCw,
} from 'lucide-react';

import {
  api,
  errorMessage,
  type AdminInstitutionInput,
} from '@/lib/api';

import { useAuth } from '@/lib/auth';
import { LEVEL_LABELS } from '@/lib/constants';

import type {
  AdminInstitution,
  AdminPaginationMeta,
  InstitutionLevel,
} from '@/lib/types';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, PageHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingBlock } from '@/components/ui/Loading';

type StatusFilter = 'all' | 'true' | 'false';

const EMPTY_FORM: AdminInstitutionInput = {
  name: '',
  level: 'LC_III',
  district: '',
  subcounty: '',
  address: '',
};

const PAGE_SIZE = 20;

export default function InstitutionsPage() {
  const { user } = useAuth();

  const [institutions, setInstitutions] =
    useState<AdminInstitution[]>([]);

  const [meta, setMeta] =
    useState<AdminPaginationMeta | null>(null);

  const [stats, setStats] = useState<{
    total: number;
    active: number;
    inactive: number;
  } | null>(null);

  const [statsError, setStatsError] =
    useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [q, setQ] = useState('');

  const [districtInput, setDistrictInput] =
    useState('');

  const [district, setDistrict] = useState('');

  const [status, setStatus] =
    useState<StatusFilter>('all');

  const [page, setPage] = useState(1);

  const [reloadKey, setReloadKey] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [editing, setEditing] =
    useState<AdminInstitution | null>(null);

  const [form, setForm] =
    useState<AdminInstitutionInput>({
      ...EMPTY_FORM,
    });

  const [saving, setSaving] = useState(false);

  const [formError, setFormError] =
    useState<string | null>(null);

  // Load the institution directory.
  useEffect(() => {
    if (user?.role !== 'SYSTEM_ADMIN') return;

    let current = true;

    setLoading(true);
    setError(null);

    api.adminInstitutions({
      q: q || undefined,
      district: district || undefined,
      active: status,
      page,
      limit: PAGE_SIZE,
    })
      .then((response) => {
        if (!current) return;

        setInstitutions(response.data);
        setMeta(response.meta);
      })
      .catch((err) => {
        if (!current) return;

        setInstitutions([]);
        setMeta(null);
        setError(errorMessage(err));
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, [
    user?.id,
    user?.role,
    q,
    district,
    status,
    page,
    reloadKey,
  ]);

  // Load global counts independently of list filters.
  useEffect(() => {
    if (user?.role !== 'SYSTEM_ADMIN') return;

    let current = true;

    setStats(null);
    setStatsError(null);

    Promise.all([
      api.adminInstitutions({
        active: 'all',
        limit: 1,
      }),

      api.adminInstitutions({
        active: 'true',
        limit: 1,
      }),

      api.adminInstitutions({
        active: 'false',
        limit: 1,
      }),
    ])
      .then(([all, active, inactive]) => {
        if (!current) return;

        setStats({
          total: all.meta.total,
          active: active.meta.total,
          inactive: inactive.meta.total,
        });
      })
      .catch((err) => {
        if (current) {
          setStatsError(errorMessage(err));
        }
      });

    return () => {
      current = false;
    };
  }, [user?.id, user?.role, reloadKey]);

  function refresh() {
    setReloadKey((value) => value + 1);
  }

  function applyFilters(event: FormEvent) {
    event.preventDefault();

    setQ(searchInput.trim());
    setDistrict(districtInput.trim());
    setPage(1);
  }

  function clearFilters() {
    setSearchInput('');
    setDistrictInput('');
    setQ('');
    setDistrict('');
    setStatus('all');
    setPage(1);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setFormError(null);
    setSuccess(null);
    setShowForm(true);
  }

  function openEdit(institution: AdminInstitution) {
    setEditing(institution);

    setForm({
      name: institution.name,
      level: institution.level,
      district: institution.district,
      subcounty: institution.subcounty,
      address: institution.address ?? '',
    });

    setFormError(null);
    setSuccess(null);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditing(null);
    setFormError(null);
    setForm({ ...EMPTY_FORM });
  }

  function updateField<
    K extends keyof AdminInstitutionInput
  >(
    key: K,
    value: AdminInstitutionInput[K],
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  async function saveInstitution(event: FormEvent) {
    event.preventDefault();

    if (saving) return;

    setFormError(null);
    setSuccess(null);

    const input: AdminInstitutionInput = {
      name: form.name.trim(),
      level: form.level,
      district: form.district.trim(),
      subcounty: form.subcounty.trim(),
      address: form.address?.trim() ?? '',
    };

    if (input.name.length < 3) {
      setFormError(
        'Enter an institution name of at least 3 characters.',
      );
      return;
    }

    if (input.district.length < 2) {
      setFormError('Enter a valid district.');
      return;
    }

    if (input.subcounty.length < 2) {
      setFormError(
        'Enter a valid subcounty or division.',
      );
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        await api.updateInstitution(
          editing.id,
          input,
        );

        setSuccess(
          `${input.name} was updated successfully.`,
        );
      } else {
        await api.createInstitution(input);

        setSuccess(
          `${input.name} was registered successfully.`,
        );

        clearFilters();
      }

      setShowForm(false);
      setEditing(null);
      setForm({ ...EMPTY_FORM });

      refresh();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (!user || user.role !== 'SYSTEM_ADMIN') {
    return null;
  }

  const hasFilters = Boolean(
    q || district || status !== 'all',
  );

  return (
    <div className="space-y-6 animate-fade-up">

      <PageHeader
        eyebrow="System administration"
        title="Court institutions"
        description="Register, discover and manage Local Council court institutions across CaseTrack UG."
        actions={
          <Button
            type="button"
            onClick={openCreate}
            disabled={showForm || saving}
          >
            <PlusCircle className="h-4 w-4" />
            Add institution
          </Button>
        }
      />

      {user.isDemo && (
        <Alert tone="warning" title="Demo environment">
          You are managing demonstration institutions.
          Do not enter confidential or real case information.
        </Alert>
      )}

      {success && (
        <Alert tone="success">{success}</Alert>
      )}

      {/* Institution registration and editing */}

      {showForm && (
        <Card className="p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-700">
              Institution management
            </p>

            <h2 className="mt-2 font-display text-2xl font-semibold text-ink-950">
              {editing
                ? 'Edit institution'
                : 'Register a new institution'}
            </h2>

            <p className="mt-2 text-sm text-ink-500">
              Provide the court name, level and
              administrative location.
            </p>
          </div>

          <form
            onSubmit={saveInstitution}
            className="space-y-5"
          >
            {formError && (
              <Alert tone="error">
                {formError}
              </Alert>
            )}

            <fieldset
              disabled={saving}
              className="space-y-5"
            >
              <Field
                label="Institution name"
                htmlFor="institution-name"
                required
              >
                <Input
                  id="institution-name"
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      'name',
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Example LC III Court"
                  minLength={3}
                  maxLength={160}
                  required
                />
              </Field>

              <Field
                label="Local Council level"
                htmlFor="institution-level"
                required
              >
                <Select
                  id="institution-level"
                  value={form.level}
                  onChange={(event) =>
                    updateField(
                      'level',
                      event.target.value as InstitutionLevel,
                    )
                  }
                  required
                >
                  <option value="LC_I">
                    LC I — Village
                  </option>

                  <option value="LC_II">
                    LC II — Parish
                  </option>

                  <option value="LC_III">
                    LC III — Subcounty / Division
                  </option>
                </Select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="District"
                  htmlFor="institution-district"
                  required
                >
                  <Input
                    id="institution-district"
                    value={form.district}
                    onChange={(event) =>
                      updateField(
                        'district',
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Kampala"
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </Field>

                <Field
                  label="Subcounty / Division"
                  htmlFor="institution-subcounty"
                  required
                >
                  <Input
                    id="institution-subcounty"
                    value={form.subcounty}
                    onChange={(event) =>
                      updateField(
                        'subcounty',
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Nakawa"
                    minLength={2}
                    maxLength={120}
                    required
                  />
                </Field>
              </div>

              <Field
                label="Physical address"
                htmlFor="institution-address"
                optional
              >
                <Input
                  id="institution-address"
                  value={form.address ?? ''}
                  onChange={(event) =>
                    updateField(
                      'address',
                      event.target.value,
                    )
                  }
                  placeholder="Court office location"
                  maxLength={240}
                />
              </Field>
            </fieldset>

            <div className="flex flex-wrap justify-end gap-3 border-t border-ink-100 pt-5">
              <Button
                type="button"
                variant="secondary"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                loading={saving}
              >
                {editing
                  ? 'Save changes'
                  : 'Register institution'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Institution statistics */}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: 'Total institutions',
            value: stats?.total,
            icon: Building2,
            color: 'text-gold-700',
          },
          {
            label: 'Active institutions',
            value: stats?.active,
            icon: CheckCircle2,
            color: 'text-emerald-700',
          },
          {
            label: 'Inactive institutions',
            value: stats?.inactive,
            icon: CirclePause,
            color: 'text-ink-400',
          },
        ].map((item) => (
          <Card
            key={item.label}
            className="p-5"
          >
            <item.icon
              className={`h-5 w-5 ${item.color}`}
              aria-hidden="true"
            />

            <p className="mt-4 font-display text-3xl font-semibold text-ink-950">
              {item.value ?? '—'}
            </p>

            <p className="mt-1 text-xs text-ink-500">
              {item.label}
            </p>
          </Card>
        ))}
      </div>

      {statsError && (
        <Alert tone="warning">
          Institution counts could not be loaded.
          {' '}{statsError}
        </Alert>
      )}

      {/* Search and filters */}

      <Card className="p-4 sm:p-5">
        <form
          onSubmit={applyFilters}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Field
            label="Search"
            htmlFor="institution-search"
          >
            <Input
              id="institution-search"
              type="search"
              value={searchInput}
              maxLength={100}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search courts..."
            />
          </Field>

          <Field
            label="District"
            htmlFor="district-filter"
          >
            <Input
              id="district-filter"
              value={districtInput}
              maxLength={80}
              onChange={(event) =>
                setDistrictInput(event.target.value)
              }
              placeholder="All districts"
            />
          </Field>

          <Field
            label="Status"
            htmlFor="status-filter"
          >
            <Select
              id="status-filter"
              value={status}
              onChange={(event) => {
                setStatus(
                  event.target.value as StatusFilter,
                );
                setPage(1);
              }}
            >
              <option value="all">
                All statuses
              </option>
              <option value="true">
                Active
              </option>
              <option value="false">
                Inactive
              </option>
            </Select>
          </Field>

          <div className="flex items-end">
            <Button
              type="submit"
              className="w-full"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </form>

        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        )}
      </Card>

      {/* Directory heading */}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-950">
            Institution directory
          </h2>

          <p
            className="mt-1 text-xs text-ink-500"
            aria-live="polite"
          >
            {loading
              ? 'Loading institutions...'
              : error
                ? 'Institution directory unavailable'
                : `${meta?.total ?? 0} institutions found`}
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={refresh}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Loading, error and empty states */}

      {error && (
        <Alert
          tone="error"
          title="Could not load institutions"
        >
          <p>{error}</p>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={refresh}
          >
            Try again
          </Button>
        </Alert>
      )}

      {loading ? (
        <LoadingBlock label="Loading court institutions..." />
      ) : error ? null : institutions.length === 0 ? (
        <EmptyState
          icon={hasFilters ? Search : Building2}
          title="No institutions found"
          description={
            hasFilters
              ? 'Try a different search or clear your filters.'
              : 'Register a court institution to get started.'
          }
          action={
            <Button
              type="button"
              variant="secondary"
              disabled={!hasFilters && showForm}
              onClick={
                hasFilters
                  ? clearFilters
                  : openCreate
              }
            >
              {hasFilters
                ? 'Clear filters'
                : 'Add institution'}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {institutions.map((institution) => (
            <Card
              key={institution.id}
              className="p-5"
              as="article"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink-50 text-ink-700">
                  <Building2
                    className="h-6 w-6"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-semibold text-ink-950">
                    {institution.name}
                  </h3>

                  <p className="mt-1 text-xs text-ink-500">
                    {institution.district}
                    {' · '}
                    {institution.subcounty}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-semibold text-ink-700">
                      {LEVEL_LABELS[institution.level]}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        institution.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      {institution.active
                        ? 'Active'
                        : 'Inactive'}
                    </span>

                    {institution.isDemo && (
                      <span className="rounded-md border border-dashed border-gold-400 bg-gold-50 px-2 py-1 text-[10px] font-bold uppercase text-gold-800">
                        Demo
                      </span>
                    )}
                  </div>

                  {institution.address && (
                    <p className="mt-3 break-words text-xs leading-relaxed text-ink-500">
                      {institution.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex justify-end border-t border-ink-100 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={showForm || saving}
                  onClick={() =>
                    openEdit(institution)
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit institution
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}

      {!loading && !error && meta && (
        <div className="flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() =>
              setPage((value) =>
                Math.max(1, value - 1),
              )
            }
          >
            Previous
          </Button>

          <p className="text-xs text-ink-500">
            Page {page} of {Math.max(1, meta.totalPages)}
          </p>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() =>
              setPage((value) => value + 1)
            }
          >
            Next
          </Button>
        </div>
      )}

      <p className="text-center text-xs leading-relaxed text-ink-400">
        Institutions are preserved to maintain historical
        records. Permanent deletion and status changes
        are not available in this version.
      </p>
    </div>
  );
}
