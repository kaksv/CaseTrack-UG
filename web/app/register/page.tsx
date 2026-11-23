'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FilePlus2,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/api';
import { AuthAside, AuthMobileHeader } from '@/components/AuthAside';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const errors: Record<string, string> = {};
    if (name.trim().length < 2) errors.name = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address.';
    if (password.length < 8) errors.password = 'Use at least 8 characters.';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    if (!acknowledged) errors.acknowledged = 'Please confirm this is a demo account.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setPending(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      router.replace('/dashboard');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[1.02fr_1fr]">
      <AuthAside
        eyebrow="Create a citizen account"
        title="One tracking ID."
        accent="Every update in one place."
        description="Register a Local Council matter, then follow its status, hearings and officer updates from any phone."
      >
        <div className="space-y-3">
          {[
            {
              icon: FilePlus2,
              title: 'Register your case',
              text: 'Choose the LC court and describe the matter in your own words.',
            },
            {
              icon: CheckCircle2,
              title: 'Get a tracking ID',
              text: 'A unique CTUG-YYYY-XXXXXX reference you can keep or share.',
            },
            {
              icon: UserRound,
              title: 'Follow the file',
              text: 'See a dated timeline and receive in-app notifications.',
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-gold-400 ring-1 ring-inset ring-white/10">
                <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[12px] font-semibold text-cream">{item.title}</p>
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-white/40">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </AuthAside>

      <main className="flex min-h-screen flex-col">
        <AuthMobileHeader />

        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-[29rem] animate-fade-up">
            <div className="mb-7">
              <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold-700">
                Citizen registration
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-ink-950 sm:text-[2.1rem]">
                Create your account.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Public registration is for citizens only. Court officer accounts are provisioned
                separately and cannot be created here.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && <Alert tone="error">{error}</Alert>}

              <Field label="Full name" htmlFor="name" required error={fieldErrors.name}>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="e.g. Namusoke Aisha"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.name)}
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email address" htmlFor="email" required error={fieldErrors.email}>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.email)}
                    required
                  />
                </Field>

                <Field label="Phone number" htmlFor="phone" optional>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+256 7…"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </Field>
              </div>

              <Field
                label="Password"
                htmlFor="password"
                required
                error={fieldErrors.password}
                hint="At least 8 characters. Use a password you do not use elsewhere."
              >
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="pr-11"
                    aria-invalid={Boolean(fieldErrors.password)}
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

              <Field
                label="Confirm password"
                htmlFor="confirm-password"
                required
                error={fieldErrors.confirmPassword}
              >
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  required
                />
              </Field>

              <div>
                <label
                  htmlFor="demo-ack"
                  className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-ink-100 bg-white/60 p-3"
                >
                  <input
                    id="demo-ack"
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-ink-300 accent-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                    aria-invalid={Boolean(fieldErrors.acknowledged)}
                  />
                  <span className="text-[11px] leading-relaxed text-ink-500">
                    I understand this is a Hack4Justice 2026 demo prototype and I will not enter real
                    personal or case information.
                  </span>
                </label>
                {fieldErrors.acknowledged && (
                  <p className="mt-1 text-xs font-medium text-red-600" role="alert">
                    {fieldErrors.acknowledged}
                  </p>
                )}
              </div>

              <Button type="submit" loading={pending} className="w-full" size="lg">
                {pending ? 'Creating account…' : 'Create account'}
                {!pending && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-[12.5px] text-ink-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-ink-900 underline decoration-gold-400 decoration-2 underline-offset-4 hover:text-ink-700"
              >
                Sign in
              </Link>
            </p>

            <div className="mt-8 flex items-start gap-2 rounded-xl border border-ink-100 bg-white/60 px-3.5 py-3">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
              <p className="text-[10.5px] leading-relaxed text-ink-400">
                Demo accounts are available on the sign-in page if you only want to explore the
                prototype.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
