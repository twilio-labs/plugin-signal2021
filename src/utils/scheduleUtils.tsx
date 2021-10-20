import format from 'date-fns/format';
import { AugmentedSession, Session } from '../types/session';
import { sortByDate } from './dateHelpers';

export const nonPaidTicketTypeId = '56556';

const levelIds = {
  '56558': 'Beginner',
  '56559': 'Intermediate',
  '56560': 'Advanced',
};

export function getLevels(session: Session): string {
  const levels = session.level.map((x) => levelIds[x]);
  return levels.join(', ');
}

export function isPaid(session: Session): boolean {
  return !(session.ticketType || []).includes(nonPaidTicketTypeId);
}

export function isSignalTv(session: Session): boolean {
  return session.signalTv || session.name.startsWith('SIGNAL TV:');
}

function augmentSession(session: Session): AugmentedSession {
  const signalTv = isSignalTv(session);
  const sessionEnded = Date.now() > session.endDate.getTime();
  return {
    ...session,
    canRegister: !session.signalTv && !sessionEnded,
    isSignalTv: signalTv,
    hasEnded: sessionEnded,
  };
}

type GroupedSessions = {
  [key: string]: AugmentedSession[];
};

export function groupSessionsByTypeOrDate(
  sessions: Session[]
): GroupedSessions {
  const groupedSets: { [key: string]: Set<AugmentedSession> } = {};
  for (const baseSession of sessions) {
    const session = augmentSession(baseSession);

    if (!groupedSets[session.date]) {
      groupedSets[session.date] = new Set();
    }

    groupedSets[session.date].add(session);
  }

  const grouped: GroupedSessions = {};
  for (const date of Object.keys(groupedSets)) {
    grouped[date] = [...groupedSets[date]].sort(sortByDate);
  }

  return grouped;
}
