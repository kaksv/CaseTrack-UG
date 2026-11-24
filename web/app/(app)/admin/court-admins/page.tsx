
'use client';

import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  Building2,
  ClipboardList,
  ArrowLeft,
} from 'lucide-react';

import { Card, PageHeader } from '@/components/ui/Card';
import { buttonClasses } from '@/components/ui/Button';

const plannedFeatures = [
  {
    title: 'Court administrator appointments',
    description:
      'Appoint authorized administrators to specific court institutions.',
    icon: ShieldCheck,
  },
  {
    title: 'Court officer management',
    description:
      'Register and manage authorized court officers.',
    icon: Users,
  },
  {
    title: 'Institution-based administration',
    description:
      'Restrict administrative responsibilities to assigned institutions.',
    icon: Building2,
  },
  {
    title: 'Case assignment and accountability',
    description:
      'Assign cases to officers and maintain administrative audit trails.',
    icon: ClipboardList,
  },
];

export default function CourtAdministratorsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <PageHeader
        eyebrow="System administration"
        title="Court administrators"
        description="Manage authorized court leadership and administrative responsibilities."
      />

      <Card className="p-8 text-center sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-800">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <span className="mt-5 inline-flex rounded-full bg-gold-50 px-3 py-1 text-xs font-semibold text-gold-800">
          Planned expansion
        </span>

        <h2 className="mt-4 font-display text-2xl font-semibold text-ink-950">
          Court administration management
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-500">
          This module is part of the next phase of
          CaseTrack UG. It will enable institution-level
          administration, secure officer onboarding
          and accountable case assignment.
        </p>

        <Link
          href="/admin"
          className={buttonClasses(
            'secondary',
            'md',
            'mt-6',
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to administration
        </Link>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {plannedFeatures.map((feature) => (
          <Card key={feature.title} className="p-5">
            <feature.icon className="h-6 w-6 text-gold-700" />

            <h3 className="mt-4 font-semibold text-ink-950">
              {feature.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              {feature.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
