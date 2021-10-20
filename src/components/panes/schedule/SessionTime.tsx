import format from 'date-fns/format';
import { Text } from 'ink';
import React from 'react';
import { AugmentedSession } from '../../../types/session';

export type SessionTimeProps = {
  session: AugmentedSession;
};
export function SessionTime({ session }: SessionTimeProps) {
  const startTime = format(session.startDate, 'hh:mm');
  const endTime = format(session.endDate, 'hh:mm');

  if (!session.hasEnded) {
    return (
      <>
        {startTime} <Text dimColor>- {endTime} </Text>
        {' │ '}
      </>
    );
  }

  const label = session.isSignalTv ? ' off air ' : 'on demand';

  return (
    <>
      <Text dimColor>{'[ ' + label + ' ] '}</Text>
      {' │ '}
    </>
  );
}
