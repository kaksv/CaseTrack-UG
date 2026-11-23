import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

export function AuthAside({
  eyebrow,
  title,
  accent,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <aside className="relative hidden overflow-hidden bg-ink-950 p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
      <div
        className="pointer-events-none absolute inset-0 bg-dot-grid opacity-[0.13]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold-500/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-ink-500/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <Logo variant="light" href="/" />
      </div>

      <div className="relative my-10 max-w-md">
        <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-gold-400">{eyebrow}</p>
        <h1 className="mt-3 font-display text-[2.6rem] font-semibold leading-[1.08] tracking-[-0.03em] text-cream xl:text-[3rem]">
          {title}
          <br />
          <span className="italic text-gold-400">{accent}</span>
        </h1>
        <p className="mt-4 text-[13.5px] leading-relaxed text-white/55">{description}</p>
        {children && <div className="mt-8">{children}</div>}
      </div>

      <div className="relative space-y-3">
        <div className="flex gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-500/80" aria-hidden="true" />
          <p className="text-[10.5px] leading-relaxed text-white/45">
            Independent Hack4Justice 2026 prototype. Not connected to any official government
            system. All demo records are synthetic.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-white/40 transition hover:text-white/70"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Back to the landing page
        </Link>
      </div>
    </aside>
  );
}

export function AuthMobileHeader() {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 lg:hidden">
      <Logo size="sm" href="/" />
      <Link href="/" className="text-[11.5px] font-medium text-ink-500 hover:text-ink-900">
        Back home
      </Link>
    </div>
  );
}
