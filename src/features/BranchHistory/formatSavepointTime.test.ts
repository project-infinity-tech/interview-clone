import { describe, expect, test } from 'bun:test';
import { formatSavepointTime } from './formatSavepointTime';

const now = new Date(2026, 9, 29, 15, 30).getTime();

describe('formatSavepointTime', () => {
  test('shows the clock time for a savepoint taken today', () => {
    expect(formatSavepointTime(new Date(2026, 9, 29, 9, 5).getTime(), now)).toBe('09:05');
  });

  test('says yesterday for a savepoint taken the day before', () => {
    expect(formatSavepointTime(new Date(2026, 9, 28, 23, 0).getTime(), now)).toBe('yesterday');
  });

  test('counts days for the past week', () => {
    expect(formatSavepointTime(new Date(2026, 9, 26, 12, 0).getTime(), now)).toBe('3 days ago');
  });

  test('counts weeks after a week', () => {
    expect(formatSavepointTime(new Date(2026, 9, 15, 12, 0).getTime(), now)).toBe('2 weeks ago');
  });

  test('says last month for the second month', () => {
    expect(formatSavepointTime(new Date(2026, 8, 20, 12, 0).getTime(), now)).toBe('last month');
  });

  test('shows the date once it is older than two months', () => {
    expect(formatSavepointTime(new Date(2026, 6, 4, 12, 0).getTime(), now)).toBe('04/07/26');
  });
});
