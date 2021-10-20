import ms from 'ms';
import { Session } from '../types/session';

export function sortByDate(a: Session, b: Session): number {
  const timeSorted = a.startDate.getTime() - b.startDate.getTime();

  if (timeSorted === 0) {
    return a.name.localeCompare(b.name);
  }
  return timeSorted;
}

export function timeToText(time: number): string {
  let rest = time;
  const hours = Math.floor(rest / ms('1h'));
  rest = rest % ms('1h');
  const minutes = Math.floor(rest / ms('1m'));
  rest = rest % ms('1m');
  const seconds = Math.floor(rest / 1000);
  return `${hours}:${minutes > 9 ? '' : '0'}${minutes}:${
    seconds > 9 ? '' : '0'
  }${seconds}`;
}

export function isDST(): boolean {
  const now = new Date();
  const jan = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) != now.getTimezoneOffset();
}
