'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FilePlus2,
  Info,
  Landmark,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api, ApiError, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { CATEGORY_OPTIONS, LEVEL_LABELS } from '@/lib/constants';
import type { CaseCategory, Institution } from '@/lib/types';
import { Alert } from '@/components/ui/Alert';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Card, PageHeader } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Skeleton } from '@/components/ui/Loading';

export default function NewCasePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(true);
  const [institutionsError, setInstitutionsError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CaseCategory | ''>('');
  const [institutionId, setInstitutionId] = useState('');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function loadInstitutions() {
    setInstitutionsLoading(true);
    setInstitutionsError(null);
    api
      .institutions()
      .then((response) => setInstitutions(response.data))
      .catch((err) => setInstitutionsError(errorMessage(err)))
      .finally(() => setInstitutionsLoading(false));
  }

  useEffect(() => {
    loadInstitutions();
  }, []);

  if (user?.role === 'OFFICER') {
    return (
      <div className="mx-auto max-w-2xl animate-fade-up">
        <Card className="p-7 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-50 text-ink-500 ring-1 ring-inset ring-ink-100">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-[-0.02em] text-ink-950">
            Case registration is for citizens
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500">
            Officer accounts manage cases that are explicitly assigned to them. Use the assigned
            caseload to open and update a case file.
          </p>
          <Link href="/cases" className={buttonClasses('primary', 'md', 'mt-6')}>
            Go to assigned cases
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Card>
      </div>
    );
  }

  const grouped = institutions.reduce<Record<string, Institution[]>>((groups, institution) => {
    const key = institution.district;
    groups[key] = groups[key] ? [...groups[key], institution] : [institution];
    return groups;
  }, {});
  const districts = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (title.trim().length < 6) errors.title = 'Give the case a descriptive title (at least 6 characters).';
    if (!category) errors.category = 'Choose a case category.';
    if (!institutionId) errors.institutionId = 'Choose the LC court handling the matter.';
    if (description.trim().length < 20) {
      errors.description = 'Describe the matter in at least 20 characters.';
    }
    if (reference.trim().length > 80) errors.reference = 'Keep the reference under 80 characters.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!validate()) return;

    setPending(true);
    try {
      const response = await api.createCase({
        title: title.trim(),
        category: category as CaseCategory,
        institutionId,
        description: description.trim(),
        reference: reference.trim() || undefined,
      });
      router.push(`/cases/${response.data.id}?created=1`);
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        const mapped: Record<string, string> = {};
        for (const detail of err.details) mapped[detail.field] = detail.message;
        setFieldErrors(mapped);
      }
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-500 transition hover:text-ink-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to my cases
        </Link>
      </div>

      <PageHeader
        eyebrow="Register a case"
        title="Start a tracked case file."
        description="Give the LC court a clear summary. You will receive a unique tracking ID as soon as the case is registered."
      />

      <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
        <Card className="p-5 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && <Alert tone="error">{error}</Alert>}

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 text-cream">
                  <FilePlus2 className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <h2 className="text-sm font-semibold text-ink-900">The matter</h2>
              </div>

              <Field
                label="Case title"
                htmlFor="title"
                required
                error={fieldErrors.title}
                hint="A short summary, for example “Boundary dispute over family plot”."
              >
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={160}
                  placeholder="What is the case about?"
                  aria-invalid={Boolean(fieldErrors.title)}
                  required
                />
              </Field>

              <Field label="Category" htmlFor="category" required error={fieldErrors.category}>
                <Select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as CaseCategory | '')}
                  aria-invalid={Boolean(fieldErrors.category)}
                  required
                >
                  <option value="">Choose a category…</option>
                  {CATEGORY_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </section>

            <div className="h-px bg-ink-100" />

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 text-cream">
                  <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <h2 className="text-sm font-semibold text-ink-900">Where it was filed</h2>
              </div>

              {institutionsError && (
                <Alert tone="error" title="Could not load LC courts">
                  <p>{institutionsError}</p>
                  <Button variant="secondary" size="sm" className="mt-2" onClick={loadInstitutions}>
                    Try again
                  </Button>
                </Alert>
              )}

              {institutionsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ) : (
                <Field
                  label="Local Council court"
                  htmlFor="institution"
                  required
                  error={fieldErrors.institutionId}
                  hint="Choose the LC court that is handling or should handle the matter."
                >
                  <Select
                    id="institution"
                    value={institutionId}
                    onChange={(event) => setInstitutionId(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.institutionId)}
                    required
                  >
                    <option value="">Choose an LC court…</option>
                    {districts.map((district) => (
                      <optgroup key={district} label={district}>
                        {grouped[district].map((institution) => (
                          <option key={institution.id} value={institution.id}>
                            {institution.name} · {LEVEL_LABELS[institution.level]} ·{' '}
                            {institution.subcounty}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </Field>
              )}

              <Field
                label="LC court reference"
                htmlFor="reference"
                optional
                error={fieldErrors.reference}
                hint="If the court gave you a paper reference, add it here."
              >
                <Input
                  id="reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  maxLength={80}
                  placeholder="e.g. KWP/LC2/2026/041"
                  aria-invalid={Boolean(fieldErrors.reference)}
                />
              </Field>
            </section>

            <div className="h-px bg-ink-100" />

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 text-cream">
                  <Info className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <h2 className="text-sm font-semibold text-ink-900">What happened</h2>
              </div>

              <Field
                label="Description"
                htmlFor="description"
                required
                error={fieldErrors.description}
                hint="Include dates, places and what outcome you are asking the LC court to consider. Do not include sensitive information such as ID numbers."
              >
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={4000}
                  rows={7}
                  placeholder="Describe the matter in your own words…"
                  aria-invalid={Boolean(fieldErrors.description)}
                  required
                />
              </Field>
              <p className="-mt-2 text-right text-[10px] text-ink-300">
                {description.length} / 4000 characters
              </p>
            </section>

            <div className="flex flex-col-reverse gap-2 border-t border-ink-100 pt-5 sm:flex-row sm:justify-end">
              <Link href="/cases" className={buttonClasses('ghost', 'md')}>
                Cancel
              </Link>
              <Button type="submit" loading={pending} size="lg">
                Register case
                {!pending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink-900">What happens next</h2>
            <ol className="mt-4 space-y-4">
              {[
                {
                  title: 'A tracking ID is created',
                  text: 'You will receive a reference like CTUG-2026-AB12CD immediately.',
                },
                {
                  title: 'The court reviews the file',
                  text: 'An assigned officer can move the case to review and add notes.',
                },
                {
                  title: 'You follow the timeline',
                  text: 'Hearing dates, milestones and status changes appear on the case page.',
                },
              ].map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[10px] font-bold text-ink-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-ink-800">{step.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-ink-400">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-5 text-cream">
            <div
              className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gold-500/15 blur-2xl"
              aria-hidden="true"
            />
            <p className="relative flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-gold-400">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Your tracking ID
            </p>
            <p className="relative mt-2 font-mono text-lg font-semibold tracking-tight">
              CTUG-2026-AB12CD
            </p>
            <p className="relative mt-2 text-[10.5px] leading-relaxed text-white/45">
              Yours will be unique. Keep it safe — it is the quickest way to find your case.
            </p>
          </div>

          <Alert tone="warning" title="Demo prototype">
            Do not enter real personal or case information. This Hack4Justice 2026 prototype is not
            connected to any official court system.
          </Alert>

          <div className="flex gap-2.5 rounded-xl border border-ink-100 bg-white/50 p-4">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
            <p className="text-[10.5px] leading-relaxed text-ink-400">
              Registering here does not send a message to the court. Bring your tracking ID when you
              visit the LC court office.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
