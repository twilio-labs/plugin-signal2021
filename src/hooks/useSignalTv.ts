import format from 'date-fns/format';
import parse from 'date-fns/parse';
import { useMemo } from 'react';
import { SignalTvApiResponse } from '../types/signalTvSchedule';
import config from '../utils/config';
import { nonPaidTicketTypeId } from '../utils/scheduleUtils';
import { useGot } from './useApi';

function extractNormalizedSchedule(data?: SignalTvApiResponse) {
  if (typeof data == 'undefined') {
    return undefined;
  }

  const sessions = [];

  data
    .filter((entry) => entry.has_cam)
    .forEach((entry, index) => {
      const speakers = entry.talent.map((name) => {
        const parts = name.trim().split(' ', 2);
        return {
          firstName: parts[0],
          lastName: parts[1],
        };
      });

      const startDate = parse(entry.start.toString(), 't', new Date());
      let endDate: Date;

      const nextEntry = data[index + 1];
      if (nextEntry) {
        // each session ends whenever the subsequent session begins
        endDate = parse(nextEntry.start.toString(), 't', new Date());
      } else {
        // except for the final session, which ends 10 minutes after it starts
        endDate = parse((entry.start + 600).toString(), 't', new Date());
      }

      const date = format(startDate, 'yyyy-MM-dd');

      sessions.push({
        id: entry.id,
        date,
        startTime: entry.start,
        endTime: entry.start,
        startDate,
        endDate,
        name: entry.title,
        description: entry.description,
        speakers,
        ticketType: [nonPaidTicketTypeId],
        level: [],
        url: 'https://twitch.tv/twilio',
        signalTv: true,
      });
    });

  return sessions;
}

export function useSignalTv() {
  const apiResponse = useGot<SignalTvApiResponse>(config.signalTvSchedule);
  const signalTvSchedule = useMemo(
    () => extractNormalizedSchedule(apiResponse?.data),
    [apiResponse.data]
  );

  return { ...apiResponse, signalTvSchedule };
}
