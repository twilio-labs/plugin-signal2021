import { Text } from 'ink';
import React from 'react';
import { AugmentedSession } from '../../../../types/session';
import { isPaid, isSignalTv } from '../../../../utils/scheduleUtils';
import { PaidTag } from './PaidTag';
import { SignalTvTag } from './SignalTvTag';

export type SessionTags = {
  session: AugmentedSession;
};
export function SessionTags({ session }: SessionTags) {
  const paid = isPaid(session);
  const signalTv = isSignalTv(session);

  return (
    <Text>
      {paid && <PaidTag />}
      {signalTv && <SignalTvTag />}
    </Text>
  );
}
