'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Avatar, Card, PageHeader } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { RoleBadge } from '@/components/ui/StatusBadge';

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  if (!user) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const errors: Record<string, string> = {};
    if (name.trim().length < 2) errors.name = 'Enter your full name.';
    if (phone.trim() && !/^\+?[0-9 ()-]{7,20}$/.test(phone.trim())) {
      errors.phone = 'Enter a valid phone number.';
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setPending(true);

    try {
      const response = await api.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      setUser(response.data);
      setSuccess('Your profile has been updated.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  function handleLogout() {
    logout();
    router.replace('/');
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Manage the details attached to your CaseTrack account. Your email address is used to sign in."
      />

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-ink-950 p-6 text-cream shadow-lift">
            <div
              className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-gold-500/15 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative flex items-start gap-4">
              <Avatar name={user.name} size="lg" className="ring-white/10" />
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-xl font-semibold tracking-[-0.02em]">
                  {user.name}
                </h2>
                <p className="mt-0.5 truncate text-[11px] text-white/45">{user.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <RoleBadge role={user.role} />
                  {user.isDemo && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-gold-500/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-gold-400">
                      <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                      Demo account
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="relative mt-5 space-y-2 border-t border-white/10 pt-4 text-[11px]">
              <p className="flex items-center gap-2 text-white/50">
                <CalendarDays className="h-3.5 w-3.5 text-white/30" aria-hidden="true" />
                Joined {formatDate(user.createdAt)}
              </p>
              {user.role === 'OFFICER' && (
                <p className="flex items-center gap-2 text-white/50">
                  <Building2 className="h-3.5 w-3.5 text-white/30" aria-hidden="true" />
                  {user.institution?.name ?? 'No duty station recorded'}
                </p>
              )}
              <p className="flex items-center gap-2 text-white/50">
                <ShieldCheck className="h-3.5 w-3.5 text-white/30" aria-hidden="true" />
                {user.role === 'OFFICER'
                  ? 'Access limited to explicitly assigned cases'
                  : 'Access limited to cases you registered'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="relative mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2.5 text-[12px] font-semibold text-cream transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </div>

          {user.isDemo && (
            <div className="rounded-xl border border-dashed border-gold-300 bg-gold-50/60 p-4">
              <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-gold-900">
                <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-700" aria-hidden="true" />
                This is a seeded demo account. Its cases, notifications and personal details are
                synthetic and exist only to demonstrate the prototype.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-cream">
                <UserRound className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink-900">Personal details</h2>
                <p className="text-[10.5px] text-ink-400">Shown only to you and assigned officers.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
              {error && <Alert tone="error">{error}</Alert>}
              {success && <Alert tone="success">{success}</Alert>}

              <Field label="Full name" htmlFor="profile-name" required error={fieldErrors.name}>
                <Input
                  id="profile-name"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.name)}
                  required
                />
              </Field>

              <Field
                label="Email address"
                htmlFor="profile-email"
                hint="Email changes are not available in this MVP."
              >
                <div className="relative">
                  <Input
                    id="profile-email"
                    value={user.email}
                    readOnly
                    disabled
                    className="pr-10"
                  />
                  <Lock
                    className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-300"
                    aria-hidden="true"
                  />
                </div>
              </Field>

              <Field
                label="Phone number"
                htmlFor="profile-phone"
                optional
                error={fieldErrors.phone}
                hint="Used only as a contact detail in this prototype. No SMS is sent."
              >
                <Input
                  id="profile-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+256 7…"
                  aria-invalid={Boolean(fieldErrors.phone)}
                />
              </Field>

              <div className="flex justify-end border-t border-ink-100 pt-4">
                <Button type="submit" loading={pending} size="md">
                  <Save className="h-4 w-4" aria-hidden="true" />
                  Save changes
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-50 text-ink-500 ring-1 ring-inset ring-ink-100">
                <KeyRound className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="text-sm font-semibold text-ink-900">Account & security</h2>
            </div>

            <dl className="mt-4 divide-y divide-ink-50">
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-400">
                  Account type
                </dt>
                <dd className="text-[11.5px] font-medium text-ink-700">
                  {ROLE_LABELS[user.role]}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-400">
                  Session
                </dt>
                <dd className="text-[11.5px] font-medium text-ink-700">JWT in this browser</dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-2.5">
                <dt className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-400">
                  Password change
                </dt>
                <dd className="text-[11.5px] font-medium text-ink-400">Not in this MVP</dd>
              </div>
            </dl>

            <p className="mt-4 rounded-xl bg-ink-50/70 px-3 py-2.5 text-[10px] leading-relaxed text-ink-400">
              Signing out removes the session token from this browser. Because this is a demo, do not
              reuse a password from another service.
            </p>
          </Card>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-[10px] text-ink-400">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" aria-hidden="true" />
              {user.email}
            </span>
            {user.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" aria-hidden="true" />
                {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
