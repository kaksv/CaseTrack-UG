const kampalaFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Africa/Kampala',
});

export function formatKampala(date: Date): string {
  return `${kampalaFormatter.format(date)} (EAT)`;
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
