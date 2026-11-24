'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Building2,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';
import { Avatar } from './ui/Card';
import {
  ROLE_DASHBOARDS,
  ROLE_WORKSPACES,
} from '@/lib/permissions';

interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  Icon: LucideIcon;
  badge?: number;
}

function isActivePath(pathname: string, href: string): boolean {
  if (
  href === '/dashboard' ||
  href === '/admin' ||
  href === '/court-admin'
) {
  return pathname === href;
}
  if (href === '/cases/new') return pathname === '/cases/new';
  if (href === '/cases') return pathname === '/cases' || /^\/cases\/(?!new$).+/.test(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(() => {
    api
      .notifications({ limit: 1 })
      .then((response) => setUnread(response.meta.unreadCount ?? 0))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshUnread();
    const interval = window.setInterval(refreshUnread, 60_000);
    const handler = () => refreshUnread();
    window.addEventListener('casetrack:notifications', handler);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('casetrack:notifications', handler);
    };
  }, [refreshUnread, pathname]);

  if (!user) return null;


const dashboardHref = ROLE_DASHBOARDS[user.role];

const navItems: NavItem[] = [
  {
    href: dashboardHref,
    label: 'Overview',
    shortLabel: 'Home',
    Icon: LayoutDashboard,
  },
];

if (user.role === 'SYSTEM_ADMIN') {
  navItems.push(
    {
      href: '/admin/institutions',
      label: 'Institutions',
      shortLabel: 'Courts',
      Icon: Building2,
    },
    {
      href: '/admin/court-admins',
      label: 'Court administrators',
      shortLabel: 'Admins',
      Icon: ShieldCheck,
    },
  );
} else if (user.role === 'COURT_ADMIN') {
  navItems.push(
    {
      href: '/court-admin/cases',
      label: 'Case assignments',
      shortLabel: 'Cases',
      Icon: FolderOpen,
    },
    {
      href: '/court-admin/officers',
      label: 'Court officers',
      shortLabel: 'Officers',
      Icon: UserRound,
    },
  );
} else {
  navItems.push({
    href: '/cases',
    label:
      user.role === 'OFFICER'
        ? 'Assigned cases'
        : 'My cases',
    shortLabel: 'Cases',
    Icon: FolderOpen,
  });

  if (user.role === 'CITIZEN') {
    navItems.push({
      href: '/cases/new',
      label: 'Register a case',
      shortLabel: 'New',
      Icon: PlusCircle,
    });
  }
}

navItems.push(
  {
    href: '/notifications',
    label: 'Notifications',
    shortLabel: 'Alerts',
    Icon: Bell,
    badge: unread,
  },
  {
    href: '/profile',
    label: 'Profile',
    shortLabel: 'Profile',
    Icon: UserRound,
  },
);


  function handleLogout() {
    logout();
    router.replace('/');
  }

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-hidden bg-ink-950 md:flex">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/20 to-transparent"
          aria-hidden="true"
        />

        <div className="relative px-6 pb-6 pt-7">
          <Logo variant="light" href={dashboardHref} />
        </div>

        <div className="relative mx-4 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
              {ROLE_WORKSPACES[user.role]}
            </span>
            {user.isDemo && (
              <span className="ml-auto rounded border border-dashed border-gold-500/50 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-gold-400">
                Demo
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-white/45">
            {user.role === 'SYSTEM_ADMIN'
              ? 'Platform and institution management'
              : user.role === 'COURT_ADMIN'
                ? user.institution?.name ?? 'Court administration'
                : user.role === 'OFFICER'
                  ? user.institution?.name ?? 'Assigned LC court cases'
                  : 'Your Local Council case file'}
          </p>
        </div>

        <nav className="relative mt-6 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
                  active
                    ? 'bg-white/[0.09] text-cream'
                    : 'text-white/55 hover:bg-white/[0.05] hover:text-cream'
                )}
              >
                {active && (
                  <span
                    className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold-500"
                    aria-hidden="true"
                  />
                )}
                <item.Icon
                  className={cn(
                    'h-[17px] w-[17px] transition-colors',
                    active ? 'text-gold-400' : 'text-white/40 group-hover:text-white/70'
                  )}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="ml-auto rounded-full bg-gold-500 px-1.5 py-0.5 text-[9.5px] font-bold text-ink-950">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {(user.role === 'OFFICER' ||
            user.role === 'COURT_ADMIN') &&
            user.institution && (
            <div className="mt-6 rounded-xl border border-white/10 px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
                <Building2 className="h-3 w-3" aria-hidden="true" />
                Duty station
              </p>
              <p className="mt-1 text-[11.5px] font-medium leading-snug text-white/65">
                {user.institution.name}
              </p>
              <p className="text-[10px] text-white/35">{user.institution.district}</p>
            </div>
          )}
        </nav>

        <div className="relative px-4 pb-4">
          <div className="mb-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
            <div className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500/80" aria-hidden="true" />
              <p className="text-[10px] leading-relaxed text-white/40">
                Independent civic-tech prototype. Not an official government system.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.06] p-2.5">
            <Avatar name={user.name} size="sm" className="ring-white/10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-semibold text-cream">{user.name}</p>
              <p className="truncate text-[10px] text-white/40">
                {ROLE_LABELS[user.role]}
                {user.isDemo ? ' · Demo account' : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-2 text-white/40 transition hover:bg-white/10 hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-ink-100 bg-cream/90 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo size="sm" href={dashboardHref} />
          <div className="flex items-center gap-1">
            <Link
              href="/notifications"
              className="relative rounded-full p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold text-ink-950">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
            <Link
              href="/profile"
              className="rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
              aria-label="Profile"
            >
              <Avatar name={user.name} size="sm" />
            </Link>
          </div>
        </div>
      </header>

      <div className="md:pl-72">
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          {children}

          <footer className="mt-12 hidden items-center justify-between gap-4 border-t border-ink-100 pt-5 text-[10.5px] text-ink-400 md:flex">
            <span>CaseTrack UG · Hack4Justice 2026</span>
            <span>Independent prototype — not an official government system.</span>
          </footer>
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="Main navigation"
      >
        <div className="flex items-stretch">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[9.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500',
                  active ? 'text-ink-950' : 'text-ink-400'
                )}
              >
                <span className="relative">
                  <item.Icon
                    className={cn('h-[19px] w-[19px]', active ? 'text-ink-900' : 'text-ink-400')}
                    aria-hidden="true"
                  />
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-gold-500 px-0.5 text-[8px] font-bold text-ink-950">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </span>
                <span>{item.shortLabel}</span>
                {active && (
                  <span
                    className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-gold-500"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
