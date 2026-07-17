import { DayType, SeasonCalendar, DateRange } from '../models';
function inRange(date: string, r: DateRange): boolean { return date >= r.start && date <= r.end; }
export function classifyDay(date: string, calendar: SeasonCalendar): DayType {
  if (calendar.peakSeasons.some((r) => inRange(date, r))) return 'peak';
  if (calendar.holidays.some((r) => inRange(date, r))) return 'holiday';
  const dow = new Date(date + 'T00:00:00').getDay();
  return dow === 0 || dow === 6 ? 'weekend' : 'weekday';
}
