import { SyncList } from 'twilio-sync';

export type Role = 'Explorer' | 'Attendee' | 'Creator' | 'Employee' | 'Sponsor';

export interface MessageData {
  avatar?: string | null;
  userId: string;
  userRole?: Role;
  userName: string;
  text: string;
  visible: boolean;
  flagged: boolean;
  isUserMod: boolean;
}

export interface Message extends MessageData {
  index?: number;
  revision?: string;
}

export interface Group {
  name: string;
  id: string;
  order: number;
  whoCanWrite: string[];
  whoCanRead: string[];
}

export interface Moderator {
  id: number;
  name: string;
  title: string;
  avatar: string;
}

export interface ChannelData {
  sid: string;
  name: string;
  displayName: string;
  description: string;
  groups: string[];
  moderators: Moderator[];
}

export interface UserChannel extends ChannelData {
  list?: SyncList;
  unread: boolean;
  canWrite: boolean;
}

export interface ChannelGroup extends Group {
  channels?: ChannelData[];
}

export interface ChatState {
  creators: boolean;
  channels: boolean;
}

export interface MessageInput {
  avatar?: string;
  isUserMod: boolean;
  quote?: MessageInput;
  text: string;
  userId: string;
  userName: string;
  userRole?: Role;
}

export interface AddMessageInput {
  channelId: string;
  message: MessageInput;
}

export interface ChatState {
  creators: boolean;
  channels: boolean;
}
