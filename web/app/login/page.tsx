'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resolvePostLoginPath } from '@/lib/permissions';
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Landmark,
  Loader2,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/api';
import { AuthAside, AuthMobileHeader } from '@/components/AuthAside';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { cn } from '@/lib/cn';

const DEMO_ACCOUNTS = {
  citizen: {
    email: 'citizen.demo@casetrack.ug',
    password: 'DemoCitizen2026!',
    label: 'Citizen demo',
    description: 'Namusoke Aisha · 8 demo cases',
  },
  officer: {
    email: 'officer.demo@casetrack.ug',
    password: 'DemoOfficer2026!',
    label: 'Officer demo',
    description: 'Ssemakula Daniel · assigned caseload',
  },
};

function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
  return value;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream">
      <Loader2 className="h-5 w-5 animate-spin text-ink-400" aria-hidden="true" />
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNext(searchParams.get('next'));
  const { login, user, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
  router.replace(
    resolvePostLoginPath(user.role, nextPath),
  );
}
  }, [loading, user, router, nextPath]);

  function fillDemo(role: keyof typeof DEMO_ACCOUNTS) {
    const account = DEMO_ACCOUNTS[role];
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
    setNotice(`${account.label} credentials filled. Press “Sign in” to continue.`);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const authenticatedUser = await login(
        email.trim(),
        password,
      );

      router.replace(
        resolvePostLoginPath(
          authenticatedUser.role,
          nextPath,
        ),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[1.02fr_1fr]">
      <AuthAside
        eyebrow="Welcome back"
        title="A clear record,"
        accent="from filing to decision."
        description="Sign in to follow a Local Council case, review hearing dates, and keep every update in one place."
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
          <p className="flex items-center gap-2 text-[9.5px] font-bold uppercase tracking-[0.14em] text-gold-400">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Demo access
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-white/45">
            One-click credentials are available on the sign-in form. All accounts and cases are
            clearly labelled DEMO.
          </p>
        </div>
      </AuthAside>

      <main className="flex min-h-screen flex-col">
        <AuthMobileHeader />

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-[27rem] animate-fade-up">
            <div className="mb-7">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold-700">
                Sign in
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-ink-950 sm:text-[2.1rem]">
                Welcome back.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Use the email and password you registered with, or try a demo account below.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <DemoButton
                icon={UserRound}
                label={DEMO_ACCOUNTS.citizen.label}
                description="8 demo cases"
                onClick={() => fillDemo('citizen')}
              />
              <DemoButton
                icon={Landmark}
                label={DEMO_ACCOUNTS.officer.label}
                description="Assigned caseload"
                onClick={() => fillDemo('officer')}
              />
            </div>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-ink-100" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink-300">
                or sign in manually
              </span>
              <span className="h-px flex-1 bg-ink-100" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && <Alert tone="error">{error}</Alert>}
              {notice && <Alert tone="info">{notice}</Alert>}

              <Field label="Email address" htmlFor="email" required>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>

              <Field label="Password" htmlFor="password" required>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-400 transition hover:bg-ink-50 hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </Field>

              <Button type="submit" loading={pending} className="w-full" size="lg">
                {pending ? 'Signing in…' : 'Sign in'}
                {!pending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-[12.5px] text-ink-500">
              New to CaseTrack?{' '}
              <Link
                href="/register"
                className="font-semibold text-ink-900 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-ink-700"
              >
                Create a citizen account
              </Link>
            </p>

            <div className="mt-8 rounded-xl border border-ink-100 bg-white/60 px-3.5 py-3">
              <p className="flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-400">
                <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Officer accounts cannot be registered publicly. The seeded officer account is for
                demo purposes only.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DemoButton({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: typeof UserRound;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex flex-col items-start gap-1 rounded-xl border border-ink-200 bg-white/70 p-3 text-left transition',
        'hover:border-gold-400 hover:bg-gold-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500'
      )}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 text-cream transition group-hover:bg-gold-500 group-hover:text-ink-950">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <span className="mt-1 text-[11.5px] font-semibold text-ink-900">{label}</span>
      <span className="text-[9.5px] text-ink-400">{description}</span>
    </button>
  );
}
