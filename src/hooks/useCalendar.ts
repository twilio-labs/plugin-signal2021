import { parse } from 'date-fns';
import { useMutation, useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import {
  RegisterForSessionQuery,
  SessionsQuery,
  UnregisterForSessionQuery,
} from '../queries/calendar';
import { RawSession, Session } from '../types/session';
import { useSignalTv } from './useSignalTv';
import { isDST } from '../utils/dateHelpers';

const apiDateTimeFormat = 'yyyy-MM-dd:HH:mm:ss xxxxx';

function normalizeSession(rawSession: RawSession): Session {
  if (rawSession.date && rawSession.startTime && rawSession.endTime) {
    // The swoogo/signalTV api both return dates in PDT/PST only.
    // Consider this when parsing, so that they'll format correctly across timezones
    const swoogoOffset = isDST() ? '-07:00' : '-08:00';
    const startDate = parse(
      `${rawSession.date}:${rawSession.startTime} ${swoogoOffset}`,
      apiDateTimeFormat,
      new Date()
    );
    const endDate = parse(
      `${rawSession.date}:${rawSession.endTime} ${swoogoOffset}`,
      apiDateTimeFormat,
      new Date()
    );

    return {
      ...rawSession,
      startDate,
      endDate,
    };
  }
  return null;
}

function normalizeSessions(rawSessions: RawSession[]): Session[] {
  return rawSessions
    .map((rawSession) => normalizeSession(rawSession))
    .filter((session) => session != null);
}

export function useCalendar() {
  const { signalTvSchedule } = useSignalTv();
  const { data, error, loading } = useQuery(SessionsQuery);

  const joinedSessions = useMemo(() => {
    let sessions: Session[] = [];
    if (data && Array.isArray(data.swoogoSessions.nodes)) {
      sessions = [...sessions, ...normalizeSessions(data.swoogoSessions.nodes)];
    }
    if (Array.isArray(signalTvSchedule)) {
      sessions = [...sessions, ...signalTvSchedule];
    }
    return sessions;
  }, [data, signalTvSchedule]);

  const registeredSessions = useMemo(() => {
    let sessions: Session[] = [];
    if (data && Array.isArray(data.currentAttendee.sessions)) {
      sessions = [
        ...sessions,
        ...normalizeSessions(data.currentAttendee.sessions),
      ];
    } else {
      sessions = null;
    }
    return sessions;
  }, [data]);

  const [registerMutation] = useMutation(RegisterForSessionQuery, {});
  const [unregisterMutation] = useMutation(UnregisterForSessionQuery, {});

  const attendeeId = data?.currentAttendee.id;

  const register = useCallback(
    (sessionId) => {
      registerMutation({
        variables: { attendeeId, sessionId },
        refetchQueries: [{ query: SessionsQuery }],
      });
    },
    [registerMutation, attendeeId]
  );
  const unregister = useCallback(
    (sessionId) =>
      unregisterMutation({
        variables: { attendeeId, sessionId },
        refetchQueries: [{ query: SessionsQuery }],
      }),
    [unregisterMutation, attendeeId]
  );

  return {
    unregister,
    register,
    error,
    loading,
    data,
    joinedSessions,
    calendar: registeredSessions,
  };
}
