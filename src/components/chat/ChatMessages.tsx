import { Box } from 'ink';
import React, { useEffect } from 'react';
import { Merge } from 'type-fest';
import { useUser } from '../../context/user';
import { useScrollableList } from '../../hooks/useScrollableList';
import { Message } from '../../types/chat';
import { LoadingIndicator } from '../common';
import {
  ScrollableItemList,
  ScrollableItemListProps,
} from '../scrollable/ScrollableItemList';
import { ChatMessageEntry } from './ChatMessageEntry';

export type ChatMessagesProps = Merge<
  ScrollableItemListProps,
  {
    messages: Message[];
    messagesLoading: boolean;
  }
>;

export function ChatMessages({
  messages,
  messagesLoading,
  ...props
}: ChatMessagesProps) {
  const [activeChatIdx, setCurrentIdx] = useScrollableList(
    Math.max(0, messages.length - 1),
    messages
  );
  const user = useUser();

  useEffect(() => {
    setCurrentIdx(Math.max(0, messages.length - 1));
  }, [messages.length]);

  return (
    <Box width="100%" flexGrow={1}>
      <ScrollableItemList width="100%" activeIdx={activeChatIdx} {...props}>
        {messagesLoading ? (
          <LoadingIndicator text="Loading messages..." />
        ) : (
          messages.map((msg, idx) => (
            <ChatMessageEntry
              key={msg?.index ? `message-${msg.index}` : `user-message-${idx}`}
              active={idx === activeChatIdx}
              author={msg.userName}
              content={msg.text}
              isSelf={msg.userName === user.name}
              isMod={msg.isUserMod}
            />
          ))
        )}
      </ScrollableItemList>
    </Box>
  );
}
