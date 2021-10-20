import { Text } from 'ink';
import React from 'react';
import { useCalendar } from '../../hooks/useCalendar';
import { SHOW_SCHEDULE_SECTION } from '../../utils/breakpoints';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { Pane } from './Pane';
import { PaneContent } from './PaneContent';
import { Schedule } from './schedule/Schedule';

export const SchedulePane = () => {
  const {
    loading,
    error,
    data,
    register,
    unregister,
    joinedSessions,
    calendar,
  } = useCalendar();

  return (
    <Pane headline="SIGNAL 2021">
      <PaneContent breakpoint={SHOW_SCHEDULE_SECTION}>
        {loading && <LoadingIndicator text="Loading Schedule..." />}
        {error && <Text>{error.toString()}</Text>}
        {data && (
          <Schedule
            sessions={joinedSessions}
            calendarSessions={calendar}
            register={register}
            unregister={unregister}
          />
        )}
      </PaneContent>
    </Pane>
  );
};
