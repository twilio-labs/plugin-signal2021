import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { Box, Text } from 'ink';
import ms from 'ms';
import React, { useEffect, useMemo, useState } from 'react';
import { useCalendar } from '../../hooks/useCalendar';
import { useBreakpointForElement } from '../../hooks/useResize';
import { Session } from '../../types/session';
import { sortByDate } from '../../utils/dateHelpers';
import { Bold } from '../common/Bold';
import { Divider } from '../common/Divider';
import { LoadingIndicator } from '../common/LoadingIndicator';

function retrieveNextSessions(sessions: Session[], count: number) {
  const currentTime = Date.now();
  const futureSessions = sessions.filter((session) => {
    return session.endDate.getTime() > currentTime;
  });
  return futureSessions.slice(0, count);
}

function useNextSessions(
  sessions: Session[],
  count = 2,
  refreshRate = ms('1m')
) {
  const sortedSessions = useMemo(() => [...sessions].sort(sortByDate), [
    sessions.length,
  ]);

  const [nextSessions, setNextSessions] = useState(
    retrieveNextSessions(sortedSessions, count)
  );

  // update times every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextUpSessions = retrieveNextSessions(sortedSessions, count);
      setNextSessions(nextUpSessions);
    }, refreshRate);
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  // update if user registers for a session
  useEffect(() => {
    setNextSessions(retrieveNextSessions(sortedSessions, count));
  }, [sortedSessions.length]);

  return nextSessions;
}

type ShortSessionEntryProps = {
  session: Session;
};
function ShortSessionEntry({ session }: ShortSessionEntryProps) {
  const startTime = formatDistanceToNow(session.startDate, {
    addSuffix: true,
  });
  return (
    <>
      <Text wrap="truncate-end">
        <Bold>{startTime}:</Bold>
      </Text>
      <Text wrap="truncate-end">{session.name}</Text>
    </>
  );
}

export type NextUpProps = {
  sessions: Session[];
};
export function NextUp({ sessions }: NextUpProps) {
  const { ref, shouldRender } = useBreakpointForElement({ minHeight: 7 });
  const nextSessions = useNextSessions(sessions);
  return (
    <Box ref={ref} flexDirection="column" padding={1} height={7}>
      {shouldRender && (
        <>
          <Divider title="Next Up" />
          {nextSessions.map((session) => (
            <ShortSessionEntry session={session} key={session.id} />
          ))}
        </>
      )}
    </Box>
  );
}

export const NextUpSection = () => {
  const { loading, error, calendar } = useCalendar();

  if (Array.isArray(calendar)) {
    return <NextUp sessions={calendar} />;
  } else if (typeof error !== 'undefined') {
    return <Text>{error.toString()}</Text>;
  } else if (typeof loading !== 'undefined') {
    return <LoadingIndicator text="Loading agenda..." />;
  } else {
    return null;
  }
};
