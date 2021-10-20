import { useInput } from 'ink';
import { useState, useEffect, useCallback } from 'react';
import { SyncClient, SyncDocument, SyncListItem } from 'twilio-sync';
import { User } from '../context/user';
import {
  Group,
  ChannelData,
  UserChannel,
  Message,
  MessageData,
  ChatState,
} from '../types/chat';
import {
  nextIdxWithRollover,
  prevIdxWithRollover,
} from '../utils/arrayHelpers';
import { usePrevious } from './usePrevious';

const INITIAL_MESSAGES_COUNT = 50;

export type ItemEvent = { item: SyncListItem };

export const parseMessageItem = ({
  data,
  index,
  revision,
}: SyncListItem): Message => ({
  ...(data as MessageData),
  index,
  revision,
});

export const markReadState = (channelName?: string, unread = true) => (
  userChannels: UserChannel[]
) => {
  if (channelName) {
    const channel = userChannels.find(
      (channel) => channel.name === channelName
    );
    if (channel) channel.unread = unread;

    return userChannels.slice();
  }
  return userChannels;
};

export function useChat(syncClient: SyncClient | undefined, user: User) {
  const [userChannels, setUserChannels] = useState<UserChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string | undefined>();
  const prevActiveChannel = usePrevious(activeChannel);
  const [activeChannelIndex, setActiveChannelIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [chatState, setChatState] = useState<ChatState>({
    creators: false,
    channels: false,
  });

  const currentChannel = userChannels.find(
    (userChannel) => userChannel.name === activeChannel
  );

  const joinChat = (channelName?: string) => {
    setActiveChannel(channelName);
  };

  // New message optimistic update
  const addMessageToChat = (message: string, isUserMod: boolean) => {
    setMessages((currentMessages) => {
      if (user) {
        const newMessage: Message = {
          avatar: user.avatarUrl,
          text: message,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          visible: true,
          flagged: false,
          isUserMod,
        };
        return currentMessages.concat(newMessage);
      }
      return currentMessages;
    });
  };

  useInput((_, key) => {
    if (key.tab && userChannels.length) {
      const isPrev = key.shift;

      const nextIdx = isPrev
        ? prevIdxWithRollover(activeChannelIndex, userChannels)
        : nextIdxWithRollover(activeChannelIndex, userChannels);
      const nextChannelName = userChannels[nextIdx].name;
      setActiveChannelIndex(nextIdx);
      joinChat(nextChannelName);
    }
  });

  // check if user is a moderator of a specific channel
  const checkIfModerator = useCallback(
    (channelName, userId) => {
      const channel = userChannels.find(
        (userChannel) => userChannel.name === channelName
      );

      if (channel) {
        const moderator = channel.moderators.find(
          (moderator) => moderator.id === userId
        );

        if (moderator) return true;
      }
      return false;
    },
    [userChannels]
  );

  // Load up channel list
  useEffect(() => {
    let chatStateDocument: SyncDocument;
    (async () => {
      if (syncClient && user?.role && user?.id) {
        try {
          setChannelsLoading(true);
          const [groupsMap, channelsMap] = await Promise.all([
            syncClient.map('groups'),
            syncClient.map('channels'),
          ]);
          chatStateDocument = await syncClient.document('chatState');

          const [{ items: groups }, { items: channels }] = await Promise.all([
            groupsMap.getItems(),
            channelsMap.getItems(),
          ]);

          // Create a mapping of the valid groups for the user
          const groupMap = groups.reduce((acc: Record<string, Group>, item) => {
            const group = item.data as Group;
            if (!group.whoCanRead.includes(user.role)) return acc;

            acc[group.id] = group;
            return acc;
          }, {});

          const liveChannels: UserChannel[] = (
            await Promise.all(
              channels.map(async (item) => {
                const channel = item.data as ChannelData;
                // groupMap only contains groups that the user can read, so this acts as a filter
                const validGroup = groupMap[channel.groups[0]];
                if (!validGroup) return undefined;

                const list = await syncClient.list(channel.name);

                return {
                  ...channel,
                  list,
                  unread: false,
                  // Limit write access based on allowed roles
                  canWrite: validGroup.whoCanWrite.includes(user.role),
                };
              })
            )
          )
            .filter(Boolean)
            .sort((a, b) => {
              const { order: aOrder } = groupMap[a.groups[0]];
              const { order: bOrder } = groupMap[b.groups[0]];
              return aOrder - bOrder;
            });

          if (chatStateDocument) {
            setChatState(chatStateDocument.data as ChatState);
            chatStateDocument.on('updated', (updated) => {
              setChatState(updated.data as ChatState);
            });
          }

          setUserChannels(liveChannels);
          setError(undefined);
        } catch (error) {
          setError(error);
        } finally {
          setChannelsLoading(false);
        }
      }
    })();

    // Close out all sync list/document handles on unmount or client update
    return () => {
      chatStateDocument?.close();
      userChannels.forEach((channel) => {
        channel.list?.close();
      });
    };
  }, [syncClient, user?.role, user?.id]);

  useEffect(() => {
    // Adds message to chat or marks channel unread if no active channel
    userChannels.forEach((channel) => {
      // Stop memory leaks by cleaning up old listeners before attaching new ones due to channel updates
      channel.list?.removeAllListeners();

      channel.list?.on('itemAdded', ({ item }: ItemEvent) => {
        const newMessage = parseMessageItem(item);
        // Check by userId instead of name to avoid naming collisions
        if (newMessage.userId !== user.id) {
          channel.name === activeChannel
            ? setMessages((currentMessages) => [...currentMessages, newMessage])
            : setUserChannels(markReadState(channel.name));
        }
      });

      // Remove moderated messages from active chat ui
      channel.list?.on('itemUpdated', ({ item }: ItemEvent) => {
        if (channel.name === activeChannel) {
          const updatedMessage = parseMessageItem(item);
          if (updatedMessage.visible === false) {
            setMessages((currentMessages) =>
              currentMessages.filter((message) => message.index !== item.index)
            );
          }
        }
      });
    });

    // Fetch most recent messages when joining a chat
    // Check against previous value of activeChannel to avoid re-fetching messages in the current channel every time another channel updates 😅
    if (activeChannel && activeChannel !== prevActiveChannel) {
      const channelItem = userChannels.find(
        (channel) => channel.name === activeChannel
      );

      if (channelItem?.list) {
        setMessagesLoading(true);
        channelItem.list
          .getItems({ pageSize: INITIAL_MESSAGES_COUNT })
          .then(({ items }) => {
            const initialMessages = items.reduce((acc: Message[], item) => {
              const message = parseMessageItem(item);
              return message.visible ? acc.concat(message) : acc;
            }, []);

            setMessages(initialMessages);
            setUserChannels(markReadState(channelItem.name, false));
            setError(undefined);
          })
          .catch((error) => {
            setError(error);
          })
          .finally(() => {
            setMessagesLoading(false);
          });
      }
    }
  }, [activeChannel, userChannels, user?.name]);

  return {
    activeChannel,
    activeChannelIndex,
    addMessageToChat,
    checkIfModerator,
    currentChannel,
    joinChat,
    messages,
    userChannels,
    chatState,
    messagesLoading,
    channelsLoading,
    error,
  };
}
