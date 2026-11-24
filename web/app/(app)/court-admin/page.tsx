
'use client';

import Link from 'next/link';

import {
  Users,
  UserPlus,
  FolderOpen,
  ArrowRight,
  Building2,
} from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { Card, PageHeader } from '@/components/ui/Card';

const modules = [
  {
    title: 'Court officers',
    description:
      'View and manage officers within your institution.',
    href: '/court-admin/officers',
    icon: Users,
  },
  {
    title: 'Register an officer',
    description:
      'Provision a new authorized court officer account.',
    href: '/court-admin/officers/new',
    icon: UserPlus,
  },
  {
    title: 'Case assignments',
    description:
      'Assign and reassign cases to eligible court officers.',
    href: '/court-admin/cases',
    icon: FolderOpen,
  },
];

export default function CourtAdminPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'COURT_ADMIN') {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="Court administration"
        title={`Welcome, ${user.name}.`}
        description="Manage your court officers and institutional case assignments."
      />

      <div className="rounded-2xl bg-ink-950 p-6 text-cream">
        <div className="flex items-center gap-2 text-gold-400">
          <Building2 className="h-5 w-5" />

          <span className="text-xs font-bold uppercase tracking-widest">
            Your institution
          </span>
        </div>

        <h2 className="mt-3 font-display text-2xl font-semibold">
          {user.institution?.name ?? 'No court assigned'}
        </h2>

        <p className="mt-2 text-sm text-white/60">
          {user.institution?.district ?? 'Contact the system administrator'}
        </p>
      </div>

      {!user.institution ? (
        <Card className="p-6">
          <p className="text-sm text-ink-600">
            Your account must be assigned to an institution
            before you can manage officers or cases.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="h-full p-6 transition hover:shadow-lift">
                <item.icon className="h-6 w-6 text-gold-700" />

                <h2 className="mt-4 font-semibold text-ink-950">
                  {item.title}
                </h2>

                <p className="mt-2 text-sm text-ink-500">
                  {item.description}
                </p>

                <span className="mt-5 flex items-center gap-2 text-xs font-semibold text-ink-800">
                  Open module
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
