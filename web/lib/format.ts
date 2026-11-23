const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Africa/Kampala',
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Kampala',
});

const TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Kampala',
});

const WEEKDAY_FORMAT = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Kampala',
});

function parse(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | Date | null | undefined): string {
  const date = parse(value);
  return date ? DATE_FORMAT.format(date) : '—';
}

export function formatDateTime(value: string | Date | null | undefined): string {
  const date = parse(value);
  return date ? `${DATE_TIME_FORMAT.format(date)} EAT` : '—';
}

export function formatTime(value: string | Date | null | undefined): string {
  const date = parse(value);
  return date ? TIME_FORMAT.format(date) : '—';
}

export function formatLongDate(value: string | Date | null | undefined): string {
  const date = parse(value);
  return date ? WEEKDAY_FORMAT.format(date) : '—';
}

export function daysUntil(value: string | Date | null | undefined): number | null {
  const date = parse(value);
  if (!date) return null;
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

export function hearingCountdown(value: string | Date | null | undefined): string {
  const days = daysUntil(value);
  if (days === null) return '';
  if (days < 0) return 'Date passed';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function firstName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

export function toDateTimeLocalValue(value: string | Date): string {
  const date = parse(value);
  if (!date) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function defaultHearingValue(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(10, 0, 0, 0);
  return toDateTimeLocalValue(date);
}

export function truncate(value: string, max = 120): string {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural ?? `${singular}s`;
}
