
'use client';

import Link from 'next/link';

import {
  Building2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { Card, PageHeader } from '@/components/ui/Card';

const modules = [
  {
    title: 'Institutions',
    description:
      'Register and manage Local Council court institutions.',
    href: '/admin/institutions',
    icon: Building2,
  },
  {
    title: 'Court administrators',
    description:
      'Appoint authorized administrators to court institutions.',
    href: '/admin/court-admins',
    icon: ShieldCheck,
  },
];

export default function SystemAdminPage() {
  const { user } = useAuth();

  if (!user || user.role !== 'SYSTEM_ADMIN') {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="System administration"
        title={`Welcome, ${user.name}.`}
        description="Manage court institutions and administrative accounts across CaseTrack UG."
      />

      <div className="rounded-2xl bg-ink-950 p-6 text-cream">
        <p className="text-xs font-bold uppercase tracking-widest text-gold-400">
          Platform administration
        </p>

        <h2 className="mt-3 font-display text-2xl font-semibold">
          Justice system management
        </h2>

        <p className="mt-2 text-sm text-white/60">
          Manage institutions and authorized personnel
          without accessing confidential case records.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
    </div>
  );
}
