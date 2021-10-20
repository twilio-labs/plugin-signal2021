export type SessionSpeaker = {
  firstName: string;
  lastName: string;
};

export interface RawSession {
  id: string;
  date: string;
  startTime: number;
  endTime: number;
  name: string;
  description: string | null;
  speakers: SessionSpeaker[] | null;
  ticketType: string[] | null;
  level: string[] | null;
  url?: string;
  signalTv?: boolean;
}

export interface Session extends RawSession {
  startDate: Date;
  endDate: Date;
}

export interface AugmentedSession extends Session {
  isSignalTv: boolean;
  canRegister: boolean;
  hasEnded: boolean;
}
