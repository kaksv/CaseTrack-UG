'use client';

import { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  StickyNote,
  type LucideIcon,
} from 'lucide-react';
import { api, errorMessage } from '@/lib/api';
import { OFFICER_STATUS_OPTIONS, STATUS_META } from '@/lib/constants';
import { defaultHearingValue } from '@/lib/format';
import type { CaseStatus, CaseSummary } from '@/lib/types';
import { Alert } from './ui/Alert';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Field, Input, Select, Textarea } from './ui/Field';
import { cn } from '@/lib/cn';

type Tab = 'status' | 'hearing' | 'note';

const TABS: Array<{ id: Tab; label: string; Icon: LucideIcon }> = [
  { id: 'status', label: 'Status', Icon: ClipboardList },
  { id: 'hearing', label: 'Hearing', Icon: CalendarDays },
  { id: 'note', label: 'Update', Icon: StickyNote },
];

export function OfficerActions({
  caseItem,
  onChanged,
}: {
  caseItem: CaseSummary;
  onChanged: () => Promise<void> | void;
}) {
  const [tab, setTab] = useState<Tab>('status');

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-ink-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-900 text-cream">
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Case actions</h2>
            <p className="text-[11px] text-ink-400">Assigned officer access only</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div
          role="tablist"
          aria-label="Case actions"
          className="grid grid-cols-3 gap-1 rounded-xl bg-ink-50 p-1"
        >
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              id={`tab-${id}`}
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11.5px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
                tab === id
                  ? 'bg-white text-ink-900 shadow-sm ring-1 ring-ink-100'
                  : 'text-ink-500 hover:text-ink-800'
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === 'status' && (
            <div role="tabpanel" id="panel-status" aria-labelledby="tab-status">
              <StatusForm caseItem={caseItem} onChanged={onChanged} />
            </div>
          )}
          {tab === 'hearing' && (
            <div role="tabpanel" id="panel-hearing" aria-labelledby="tab-hearing">
              <HearingForm caseItem={caseItem} onChanged={onChanged} />
            </div>
          )}
          {tab === 'note' && (
            <div role="tabpanel" id="panel-note" aria-labelledby="tab-note">
              <NoteForm caseItem={caseItem} onChanged={onChanged} />
            </div>
          )}
        </div>

        <p className="mt-4 border-t border-ink-100 pt-3 text-[11px] leading-relaxed text-ink-400">
          Every update records your name, role and the time it was made. Citizens are notified
          automatically.
        </p>
      </div>
    </Card>
  );
}

function StatusForm({
  caseItem,
  onChanged,
}: {
  caseItem: CaseSummary;
  onChanged: () => Promise<void> | void;
}) {
  const options = OFFICER_STATUS_OPTIONS[caseItem.status];
  const [status, setStatus] = useState<CaseStatus | ''>('');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (options.length === 0) {
    return (
      <Alert tone="info" title="This case is closed">
        Closed cases cannot be moved to another status. You can still add a note for the record.
      </Alert>
    );
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!status) {
      setError('Choose a new status first.');
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      await api.updateStatus(caseItem.id, { status, note: note.trim() || undefined });
      setSuccess(`Status updated to “${STATUS_META[status].label}”.`);
      setStatus('');
      setNote('');
      await onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <Field label="New status" htmlFor="status-select" required>
        <Select
          id="status-select"
          value={status}
          onChange={(event) => setStatus(event.target.value as CaseStatus | '')}
        >
          <option value="">Choose a status…</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {STATUS_META[option].label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Officer note"
        htmlFor="status-note"
        optional
        hint="This note is visible to the citizen in the case timeline."
      >
        <Textarea
          id="status-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={1000}
          placeholder="Explain the reason for this status change…"
        />
      </Field>

      <Button type="submit" loading={pending} className="w-full">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Update status
      </Button>
    </form>
  );
}

function HearingForm({
  caseItem,
  onChanged,
}: {
  caseItem: CaseSummary;
  onChanged: () => Promise<void> | void;
}) {
  const [hearingDate, setHearingDate] = useState(defaultHearingValue);
  const [title, setTitle] = useState('Hearing scheduled');
  const [description, setDescription] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!hearingDate) {
      setError('Choose a hearing date and time.');
      return;
    }
    const date = new Date(hearingDate);
    if (Number.isNaN(date.getTime())) {
      setError('That hearing date is not valid.');
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      await api.addEvent(caseItem.id, {
        type: 'HEARING_SCHEDULED',
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        hearingDate: date.toISOString(),
      });
      setSuccess('Hearing scheduled. The citizen has been notified.');
      setDescription('');
      await onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <Field
        label="Hearing date and time"
        htmlFor="hearing-date"
        required
        hint="Times are shown in East Africa Time (EAT)."
      >
        <Input
          id="hearing-date"
          type="datetime-local"
          value={hearingDate}
          min={new Date().toISOString().slice(0, 16)}
          onChange={(event) => setHearingDate(event.target.value)}
          required
        />
      </Field>

      <Field label="Title" htmlFor="hearing-title" optional>
        <Input
          id="hearing-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={160}
        />
      </Field>

      <Field
        label="Notes for the citizen"
        htmlFor="hearing-description"
        optional
        hint="For example: what to bring, which office to attend, or who should come."
      >
        <Textarea
          id="hearing-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={4000}
          placeholder="Bring your survey documents and a witness…"
        />
      </Field>

      <Button type="submit" variant="gold" loading={pending} className="w-full">
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Schedule hearing
      </Button>
    </form>
  );
}

function NoteForm({
  caseItem,
  onChanged,
}: {
  caseItem: CaseSummary;
  onChanged: () => Promise<void> | void;
}) {
  const [kind, setKind] = useState<'NOTE' | 'MILESTONE'>('NOTE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!description.trim()) {
      setError('Write the note or milestone details first.');
      return;
    }
    if (kind === 'MILESTONE' && title.trim().length < 3) {
      setError('Give the milestone a short title.');
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      if (kind === 'MILESTONE') {
        await api.addEvent(caseItem.id, {
          type: 'MILESTONE',
          title: title.trim(),
          description: description.trim() || undefined,
        });
      } else {
        await api.addEvent(caseItem.id, {
          type: 'NOTE',
          title: title.trim() || undefined,
          description: description.trim(),
        });
      }
      setSuccess(kind === 'MILESTONE' ? 'Milestone added to the timeline.' : 'Note added to the case file.');
      setTitle('');
      setDescription('');
      await onChanged();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-ink-50 p-1">
        {(['NOTE', 'MILESTONE'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setKind(option)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
              kind === option
                ? 'bg-white text-ink-900 shadow-sm ring-1 ring-ink-100'
                : 'text-ink-500 hover:text-ink-800'
            )}
          >
            {option === 'NOTE' ? 'Officer note' : 'Milestone'}
          </button>
        ))}
      </div>

      <Field
        label="Title"
        htmlFor="note-title"
        optional={kind === 'NOTE'}
        required={kind === 'MILESTONE'}
      >
        <Input
          id="note-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={160}
          placeholder={kind === 'MILESTONE' ? 'e.g. Site visit completed' : 'e.g. Documents received'}
        />
      </Field>

      <Field
        label={kind === 'MILESTONE' ? 'Milestone details' : 'Note'}
        htmlFor="note-description"
        required
        hint="This is shared with the citizen on their case timeline."
      >
        <Textarea
          id="note-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={4000}
          placeholder={
            kind === 'MILESTONE'
              ? 'Describe what was completed and what happens next…'
              : 'Add a clear update for the case file…'
          }
        />
      </Field>

      <Button type="submit" variant="secondary" loading={pending} className="w-full">
        <StickyNote className="h-4 w-4" aria-hidden="true" />
        {kind === 'MILESTONE' ? 'Add milestone' : 'Add note'}
      </Button>
    </form>
  );
}
