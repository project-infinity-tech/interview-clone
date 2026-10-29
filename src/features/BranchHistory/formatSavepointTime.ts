const DAYS_BEFORE_WEEKS = 7;
const DAYS_BEFORE_MONTHS = 28;
const DAYS_BEFORE_DATE = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

const relativeTime = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' });

const startOfDay = (time: number): number => new Date(time).setHours(0, 0, 0, 0);

const twoDigits = (value: number): string => String(value).padStart(2, '0');

/**
 * The history list's timestamp ladder: a clock time for today, then days, then weeks, a flat
 * "last month" for the second month, and a date once it is older than that.
 */
export const formatSavepointTime = (createdAt: number, now: number): string => {
  const date = new Date(createdAt);
  const days = Math.round((startOfDay(now) - startOfDay(createdAt)) / DAY_MS);

  if (days === 0) {
    return `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
  }

  if (days >= DAYS_BEFORE_DATE) {
    return `${twoDigits(date.getDate())}/${twoDigits(date.getMonth() + 1)}/${twoDigits(date.getFullYear() % 100)}`;
  }

  if (days >= DAYS_BEFORE_MONTHS) {
    return 'last month';
  }

  if (days >= DAYS_BEFORE_WEEKS) {
    return relativeTime.format(-Math.floor(days / DAYS_BEFORE_WEEKS), 'week');
  }

  return relativeTime.format(-days, 'day');
};
