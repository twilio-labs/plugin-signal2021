import { Box, Text, useInput } from 'ink';
import React, { useCallback, useEffect } from 'react';
import figures from 'figures';
import { useMode } from '../../context/mode';
import { ModeEvents } from '../../machines/modeMachine';
import { SHOW_CHAT } from '../../utils/breakpoints';
import { ChatWindow } from '../chat/ChatWindow';
import { Bold } from '../common/Bold';
import { Key } from '../common/Key';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { Pane } from './Pane';
import { PaneContent } from './PaneContent';
import { useMutation } from '@apollo/client';
import { AddMessageMutation } from '../../queries/chat';
import { useSyncClient } from '../../hooks/useSyncClient';
import { useChat } from '../../hooks/useChat';
import { AddMessageInput, MessageData } from '../../types/chat';
import { useUser } from '../../context/user';

const chatFallback = (
  <Text>
    Your terminal is too small to support the best experience for chat mode. Try
    hiding the sidebar using <Key>Ctrl</Key>+<Key>b</Key> or increase the size
    of your terminal until this message disappears.
  </Text>
);

const offlineContent = (
  <>
    <Bold>Welcome to chat!</Bold>
    <Text>
      Chat rooms are only open during conference hours. Please return during
      those times. Thank you!
    </Text>
    <Text>
      Use <Key>Ctrl</Key> + <Key>d</Key> to leave the chat
    </Text>
  </>
);

const errorContent = (
  <Text>
    <Bold>Error</Bold>
    <Text>There was an error loading the chat. Please try again later.</Text>
  </Text>
);

const loadingContent = <LoadingIndicator text="Connecting to SIGNAL Chat..." />;

export const ChatPane = () => {
  const { dispatch: modeDispatch } = useMode();
  const user = useUser();
  const [addMessage] = useMutation<MessageData, AddMessageInput>(
    AddMessageMutation
  );
  const { error: syncError, loading: syncLoading, syncClient } = useSyncClient(
    'NETWORKING_CHAT'
  );
  const {
    activeChannel,
    activeChannelIndex,
    addMessageToChat,
    checkIfModerator,
    currentChannel,
    joinChat,
    messages,
    messagesLoading,
    userChannels,
    chatState,
    channelsLoading,
    error: chatError,
  } = useChat(syncClient, user);

  const back = useCallback(() => {
    modeDispatch({ type: ModeEvents.exitChat });
  }, []);

  useInput((input, key) => {
    if (key.ctrl && input.toLowerCase() === 'b') {
      modeDispatch({ type: ModeEvents.toggleSideBar });
    }

    if (key.ctrl && input.toLowerCase() === 'd') {
      back();
    }
  });

  useEffect(() => {
    if (!activeChannel) {
      const nextChannelName = userChannels?.[activeChannelIndex]?.name;
      if (nextChannelName) {
        joinChat(nextChannelName);
      }
    }
  }, [userChannels, joinChat, activeChannelIndex]);

  const canWrite = currentChannel?.canWrite;

  // Use Explorer as fallback role in case they don't have one, as Explorer has the lowest permissions
  if (!user.role) {
    user.role = 'Explorer';
  }

  const isOffline =
    activeChannel === 'creators' ? !chatState.creators : !chatState.channels;

  const onSend = (text: string) => {
    if (isOffline) {
      return;
    }

    const isUserMod = checkIfModerator(activeChannel, user.id);
    // Optimistically update the local UI with the message...
    addMessageToChat(text, isUserMod);
    // Also send message to the backend...
    addMessage({
      variables: {
        channelId: activeChannel,
        message: {
          avatar: user?.avatarUrl,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          text,
          isUserMod,
        },
      },
    });
  };

  const isActive =
    !syncLoading &&
    !isOffline &&
    !messagesLoading &&
    !channelsLoading &&
    userChannels.length > 0 &&
    canWrite;

  const activeContent = (
    <>
      <Box flexDirection="column" paddingLeft={2} paddingRight={2}>
        <Bold>Welcome to SIGNAL chat!</Bold>
        <Text>Chat with your fellow SIGNAL participants</Text>
        <Text>
          Use the <Key>Tab</Key> key to cycle between channels
        </Text>
        <Text>
          Use the up/down arrow keys to scroll through chat messages, and hit{' '}
          <Key>Return</Key>/<Key>Enter</Key> to send a message
        </Text>
        <Text>
          Use <Key>Ctrl</Key> + <Key>b</Key> to toggle the sidebar
        </Text>
        <Text>
          Use <Key>Ctrl</Key> + <Key>d</Key> to leave the chat
        </Text>
      </Box>
      <ChatWindow
        onSend={onSend}
        messages={messages}
        prompt={`${user?.name ?? ''} ${figures.pointer}`}
        placeholder={
          // Check explicitly for false. Will be undefined while loading
          canWrite === false
            ? 'You may view this chat, but do not have write access!'
            : '...'
        }
        active={isActive}
        growsFromBottom
        channels={userChannels}
        activeChannel={activeChannel}
        messagesLoading={messagesLoading}
        channelsLoading={channelsLoading}
        isOffline={isOffline}
      />
    </>
  );

  const getContent = () => {
    if (syncLoading) return loadingContent;
    if (syncError || chatError) return errorContent;
    if (isOffline && !channelsLoading) return offlineContent;
    return activeContent;
  };

  return (
    <Pane headline="Chat">
      <PaneContent breakpoint={SHOW_CHAT} fallback={chatFallback}>
        {getContent()}
      </PaneContent>
    </Pane>
  );
};
