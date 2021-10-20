import { useQuery } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { useTerminalInfo } from '../hooks/useTerminalInfo';
import { UserProfileQuery } from '../queries/user';
import { Role } from '../types/chat';
import { urlToBuffer } from '../utils/urlToBuffer';

export type UserResponse = {
  currentAttendee: {
    id: string;
    avatarUrl?: string;
    attendeeType: Role;
    email: string;
    firstName: string;
    lastName: string;
  };
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  accountSid?: string | null;
  twilioUsername?: string | null;
  twilioPassword?: string | null;
  avatarUrl?: string;
  heroImage?: Buffer | null;
};

const defaultUser: User = {
  id: '',
  name: 'Operator',
  email: 'operator@twilio.com',
  role: 'Explorer',
};

const UserContext = React.createContext<User>(defaultUser);

export const useUser = () => React.useContext(UserContext);

export type UserProviderProps = {
  defaultValue?: Partial<User>;
};

export const UserProvider: React.FC<UserProviderProps> = ({
  defaultValue,
  children,
}) => {
  const [value, setValue] = useState<User>({ ...defaultUser, ...defaultValue });
  const { data } = useQuery<UserResponse>(UserProfileQuery);
  const { isGitBash } = useTerminalInfo();
  const noColors = process.env.FORCE_COLOR === '0';

  useEffect(() => {
    (async () => {
      if (data && data.currentAttendee) {
        const heroImage = isGitBash
          ? undefined
          : noColors
          ? null
          : await urlToBuffer(data.currentAttendee.avatarUrl);

        setValue((currentValue) => ({
          ...currentValue,
          heroImage,
          id: data.currentAttendee.id,
          avatarUrl: data.currentAttendee.avatarUrl,
          email: data.currentAttendee.email,
          name: `${data.currentAttendee.firstName} ${
            data.currentAttendee.lastName?.[0] ?? ''
          }`.trim(),
          role: data.currentAttendee.attendeeType,
        }));
      }
    })();
  }, [data]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
