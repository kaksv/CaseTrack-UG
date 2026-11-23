import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  FileText,
  FolderOpen,
  Landmark,
  Lock,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  StickyNote,
  UserRound,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { buttonClasses } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDateTime } from '@/lib/format';

const stats = [
  { value: '6', label: 'clear case stages', hint: 'Registered → Closed' },
  { value: '1', label: 'tracking ID', hint: 'CTUG-YYYY-XXXXXX' },
  { value: '10', label: 'demo LC courts', hint: 'Across Uganda' },
  { value: '0', label: 'official integrations', hint: 'Honest by design' },
];

const steps = [
  {
    icon: FilePlus2,
    title: 'Register once',
    text: 'Describe the matter, choose your LC court and get a unique tracking ID you can keep or share.',
  },
  {
    icon: Search,
    title: 'Follow every update',
    text: 'See each status change, officer note, milestone and hearing date in one chronological timeline.',
  },
  {
    icon: CalendarDays,
    title: 'Arrive prepared',
    text: 'Know the next hearing date, what changed and who recorded it — without chasing paperwork.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-50 border-b border-ink-100/80 bg-cream/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo size="md" />

          <nav
            className="hidden items-center gap-7 text-[13px] font-medium text-ink-500 lg:flex"
            aria-label="Landing navigation"
          >
            <a href="#how-it-works" className="whitespace-nowrap transition hover:text-ink-900">
              How it works
            </a>
            <a href="#roles" className="whitespace-nowrap transition hover:text-ink-900">
              For citizens & officers
            </a>
            <a href="#trust" className="whitespace-nowrap transition hover:text-ink-900">
              Trust & limits
            </a>
          </nav>

          <div className="flex items-center gap-1.5">
            <Link href="/login" className={buttonClasses('ghost', 'sm')}>
              Sign in
            </Link>
            <Link href="/register" className={buttonClasses('primary', 'sm')}>
              <span className="hidden sm:inline">Register a case</span>
              <span className="sm:hidden">Register</span>
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="relative overflow-hidden bg-hero-glow">
          <div
            className="pointer-events-none absolute inset-0 bg-dot-grid opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]"
            aria-hidden="true"
          />

          <div className="relative mx-auto grid max-w-6xl gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-28 lg:pt-20">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/70 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-600 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-500" aria-hidden="true" />
                Hack4Justice 2026 · Uganda
              </span>

              <h1 className="mt-6 font-display text-[2.7rem] font-semibold leading-[1.02] tracking-[-0.035em] text-ink-950 sm:text-6xl lg:text-[4.15rem]">
                Follow your LC case.
                <br />
                <span className="italic text-ink-600">From filing to decision.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-500 sm:text-[17px]">
                CaseTrack UG gives citizens and Local Council Court officers one clear, shared
                record — a tracking ID, a live timeline, hearing dates and updates you can actually
                follow.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/register" className={buttonClasses('primary', 'lg')}>
                  Register a case
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/login" className={buttonClasses('secondary', 'lg')}>
                  Sign in to your file
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-ink-400">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Synthetic demo data only
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  No government integration
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Free civic-tech prototype
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms] lg:max-w-none">
              <div
                className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-gold-200/50 via-transparent to-ink-200/50 blur-2xl"
                aria-hidden="true"
              />

              <div className="relative rounded-[1.75rem] border border-ink-100 bg-paper p-5 shadow-lift sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] font-medium tracking-tight text-ink-400">
                    CTUG-2026-DEM001
                  </span>
                  <StatusBadge status="HEARING_SCHEDULED" />
                </div>

                <h2 className="mt-3 font-display text-[1.35rem] font-semibold leading-snug tracking-[-0.02em] text-ink-950">
                  Boundary dispute over family plot
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-ink-400">
                  <Landmark className="h-3 w-3" aria-hidden="true" />
                  Kawempe LC II Court · Kampala
                </p>

                <div className="mt-5 space-y-4 border-t border-ink-100 pt-5">
                  {[
                    {
                      icon: FilePlus2,
                      title: 'Case registered',
                      date: '30 Oct 2026 · 09:10',
                      tone: 'bg-ink-900 text-cream',
                    },
                    {
                      icon: ClipboardList,
                      title: 'Moved to review',
                      date: '3 Nov 2026 · 11:40',
                      tone: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
                    },
                    {
                      icon: CalendarDays,
                      title: 'Hearing scheduled',
                      date: '27 Nov 2026 · 10:00',
                      tone: 'bg-gold-50 text-gold-700 ring-1 ring-inset ring-gold-300',
                    },
                  ].map((item, index) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.tone}`}
                      >
                        <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-[12.5px] font-semibold text-ink-900">{item.title}</p>
                        <p className="text-[10.5px] text-ink-400">{item.date} EAT</p>
                      </div>
                      {index === 2 && (
                        <span className="mt-1 rounded-full bg-ink-900 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-cream">
                          Latest
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-xl bg-ink-950 px-4 py-3.5 text-cream">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-400">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-gold-400/80">
                      Next hearing
                    </p>
                    <p className="text-[12.5px] font-semibold">Fri, 27 Nov 2026 · 10:00 EAT</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/30" aria-hidden="true" />
                </div>
              </div>

              <div className="absolute -bottom-7 -left-4 hidden w-60 rounded-2xl border border-ink-100 bg-white p-3.5 shadow-lift sm:block">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700 ring-1 ring-inset ring-gold-200">
                    <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gold-700">
                      New update
                    </p>
                    <p className="mt-0.5 text-[11.5px] font-medium leading-snug text-ink-800">
                      Hearing scheduled for your case.
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-2 -top-4 hidden rotate-3 rounded-xl border border-gold-300 bg-gold-50 px-3 py-2 shadow-card sm:block">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-gold-800">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  Demo record
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-ink-100 bg-paper/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-ink-100 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((stat) => (
              <div key={stat.label} className="px-2 py-6 text-center sm:px-4 lg:py-7">
                <p className="font-display text-3xl font-semibold tracking-[-0.03em] text-ink-950 sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11.5px] font-semibold text-ink-700">{stat.label}</p>
                <p className="mt-0.5 text-[10px] text-ink-400">{stat.hint}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-700">
              A clearer process
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-ink-950 sm:text-4xl">
              Three steps. One shared record.
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
              The same case file follows the citizen and the assigned officer — with every entry
              attributed, dated and labelled.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-paper p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <span className="absolute right-5 top-5 font-display text-4xl font-semibold text-ink-100">
                  0{index + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-cream">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em] text-ink-950">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="roles" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl border border-ink-100 bg-paper p-7 shadow-card sm:p-9">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-200/30 blur-3xl"
                aria-hidden="true"
              />
              <span className="inline-flex items-center gap-2 rounded-full bg-ink-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-600 ring-1 ring-inset ring-ink-100">
                <UserRound className="h-3 w-3" aria-hidden="true" />
                For citizens
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-3xl">
                Know where your case stands.
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-500">
                Register a Local Council matter, keep your tracking ID and follow the file without
                repeated visits to the office.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  'Register a case and receive a unique tracking ID',
                  'Search and revisit every case you filed',
                  'See hearing dates and a chronological progress timeline',
                  'Get in-app notifications when the officer updates your file',
                ].map((item) => (
                  <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/register" className={buttonClasses('primary', 'md', 'mt-7 w-full sm:w-auto')}>
                Start with a case
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-ink-950 p-7 text-cream shadow-lift sm:p-9">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-gold-500/15 blur-3xl"
                aria-hidden="true"
              />
              <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold-400 ring-1 ring-inset ring-white/10">
                <Scale className="h-3 w-3" aria-hidden="true" />
                For court officers
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.02em] text-cream sm:text-3xl">
                One caseload. A clean audit trail.
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-white/55">
                Officers only see cases explicitly assigned to them, and every action is recorded
                with a name, source and timestamp.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  'A focused dashboard of assigned cases and upcoming hearings',
                  'Update case status through a controlled workflow',
                  'Schedule hearings and add milestones or notes',
                  'Review the full history of every case file',
                ].map((item) => (
                  <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-white/65">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-500/80" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={buttonClasses('gold', 'md', 'mt-7 w-full sm:w-auto')}
              >
                Open the officer demo
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="mt-3 text-[10.5px] text-white/35">
                Public officer registration is disabled. Demo access is provided on the sign-in page.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-ink-100 bg-paper/50">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8 lg:py-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-700">
                The timeline
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-ink-950 sm:text-4xl">
                A record both sides can follow.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
                No more “I was told to come back.” Each entry shows what happened, who recorded it,
                where it came from and exactly when.
              </p>

              <ul className="mt-7 space-y-4">
                {[
                  {
                    icon: ClipboardList,
                    title: 'Chronological by design',
                    text: 'Events are ordered from registration to closure.',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Source-labelled',
                    text: 'Citizen-reported, officer updates and demo records are visibly distinct.',
                  },
                  {
                    icon: Bell,
                    title: 'Notification-backed',
                    text: 'Citizens see a new in-app notification when their file changes.',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-ink-600 ring-1 ring-inset ring-ink-100">
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-500">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div
                className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-gold-200/30 to-ink-200/30 blur-2xl"
                aria-hidden="true"
              />
              <div className="rounded-3xl border border-ink-100 bg-paper p-5 shadow-lift sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-4">
                  <div>
                    <p className="font-mono text-[10px] text-ink-400">CTUG-2026-DEM004</p>
                    <p className="mt-1 text-sm font-semibold text-ink-900">
                      Family land inheritance disagreement
                    </p>
                  </div>
                  <StatusBadge status="DECISION_RECORDED" />
                </div>

                <div className="mt-5 space-y-5">
                  {[
                    {
                      icon: FileText,
                      tone: 'bg-ink-900 text-cream',
                      label: 'Case registered',
                      text: 'Submitted by the family spokesperson.',
                      time: '25 Sep 2026 · 09:05',
                    },
                    {
                      icon: CalendarDays,
                      tone: 'bg-gold-50 text-gold-700 ring-1 ring-inset ring-gold-300',
                      label: 'Mediation hearing scheduled',
                      text: 'All family members invited to attend.',
                      time: '15 Oct 2026 · 10:00',
                    },
                    {
                      icon: StickyNote,
                      tone: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
                      label: 'Decision recorded',
                      text: 'Land to be shared in three portions with access paths.',
                      time: '30 Oct 2026 · 11:20',
                    },
                  ].map((item, index, array) => (
                    <div key={item.label} className="flex gap-3.5">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.tone}`}
                        >
                          <item.icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        {index < array.length - 1 && (
                          <span className="mt-1 w-px flex-1 bg-ink-100" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pb-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                          {item.time} EAT
                        </p>
                        <p className="mt-0.5 text-[13px] font-semibold text-ink-900">{item.label}</p>
                        <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-500">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-xl border border-dashed border-gold-300 bg-gold-50/60 px-3 py-2.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-gold-700" aria-hidden="true" />
                  <p className="text-[10px] leading-relaxed text-gold-900">
                    Demo record. Names, places and events are synthetic.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="trust" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-3xl border border-gold-200 bg-gold-50/50 p-6 sm:p-9 lg:grid-cols-[auto_1fr] lg:gap-8">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-950 text-gold-400">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-ink-950 sm:text-3xl">
                Built for trust. Honest about its limits.
              </h2>
              <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-ink-600">
                CaseTrack UG is an independent Hack4Justice 2026 prototype. It is not connected to
                the Judiciary, KCCA, the Ministry of Justice, or any official government system. It
                does not send SMS, give legal advice, or make decisions. Every record in this demo is
                synthetic.
              </p>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {[
                  'Demo data is clearly labelled throughout',
                  'Every event records author, source and timestamp',
                  'Officers only access explicitly assigned cases',
                  'No real personal or case data is required',
                  'No payment, SMS or AI integration',
                  'Public officer registration is disabled',
                ].map((item) => (
                  <p key={item} className="flex gap-2 text-[12px] leading-relaxed text-ink-600">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" aria-hidden="true" />
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-12 text-center sm:px-12 sm:py-16">
            <div
              className="pointer-events-none absolute inset-0 bg-dot-grid opacity-[0.12]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl"
              aria-hidden="true"
            />
            <p className="relative text-[11px] font-bold uppercase tracking-[0.16em] text-gold-400">
              Start with a clear record
            </p>
            <h2 className="relative mx-auto mt-3 max-w-2xl font-display text-3xl font-semibold tracking-[-0.03em] text-cream sm:text-[2.75rem] sm:leading-[1.1]">
              Your case deserves to be easy to follow.
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/55">
              Explore the citizen experience, or open the officer demo to see how an assigned case
              is managed.
            </p>
            <div className="relative mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className={buttonClasses('gold', 'lg')}>
                Register a case
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className={buttonClasses(
                  'secondary',
                  'lg',
                  'bg-white/5 text-cream ring-white/20 hover:bg-white/10 hover:ring-white/30'
                )}
              >
                Try the demo accounts
              </Link>
            </div>
            <p className="relative mt-4 text-[10.5px] text-white/30">
              Demo credentials are available with one click on the sign-in page.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-100 bg-paper/50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <Logo size="md" />
              <p className="mt-3 text-[12px] leading-relaxed text-ink-500">
                A mobile-first civic-tech prototype for Local Council Court case tracking in Uganda.
                Built for Hack4Justice 2026 with synthetic data only.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-6 text-[12px]">
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                  Product
                </p>
                <a href="#how-it-works" className="block text-ink-600 hover:text-ink-950">
                  How it works
                </a>
                <a href="#roles" className="block text-ink-600 hover:text-ink-950">
                  For citizens & officers
                </a>
                <a href="#trust" className="block text-ink-600 hover:text-ink-950">
                  Trust & limits
                </a>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                  Access
                </p>
                <Link href="/register" className="block text-ink-600 hover:text-ink-950">
                  Register a case
                </Link>
                <Link href="/login" className="block text-ink-600 hover:text-ink-950">
                  Sign in
                </Link>
                <Link href="/login" className="block text-ink-600 hover:text-ink-950">
                  Officer demo
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-ink-100 pt-5 text-[10.5px] text-ink-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 CaseTrack UG · Hack4Justice 2026 prototype</p>
            <p className="flex items-center gap-1.5">
              <Lock className="h-3 w-3" aria-hidden="true" />
              Not an official government system. No real case data.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
