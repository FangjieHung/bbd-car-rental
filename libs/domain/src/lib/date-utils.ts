export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function isoAt(daysFromToday: number, hour: number): string {
  const d = addDays(startOfDay(new Date()), daysFromToday);
  d.setHours(hour);
  return d.toISOString();
}
