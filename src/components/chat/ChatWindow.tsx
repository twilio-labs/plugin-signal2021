import { Box } from 'ink';
import React from 'react';
import { Message } from '../../types/chat';
import {
  ChatChannelSelector,
  ChatChannelSelectorProps,
} from './ChatChannelSelector';
import { ChatInput } from './ChatInput';
import { ChatMessages, ChatMessagesProps } from './ChatMessages';

export type ChatWindowProps = {
  messages: Message[];
  prompt: string;
  onSend?: (msg: string) => any;
  placeholder?: string;
  active?: boolean;
} & ChatChannelSelectorProps &
  ChatMessagesProps;

export function ChatWindow({
  messages,
  prompt,
  onSend,
  placeholder,
  active,
  growsFromBottom,
  channels,
  activeChannel,
  messagesLoading,
  channelsLoading,
}: ChatWindowProps) {
  return (
    <Box width="100%" flexGrow={1} flexDirection="row">
      <ChatChannelSelector
        channels={channels}
        activeChannel={activeChannel}
        channelsLoading={channelsLoading}
      />
      <Box width="100%" flexGrow={1} flexDirection="column">
        <ChatMessages
          messages={messages}
          growsFromBottom={growsFromBottom}
          messagesLoading={messagesLoading}
        />
        <ChatInput
          placeholder={placeholder}
          prompt={prompt}
          onSend={onSend}
          active={active}
        />
      </Box>
    </Box>
  );
}
