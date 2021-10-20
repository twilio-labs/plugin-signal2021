import figures from 'figures';
import { Box, Text } from 'ink';
import React from 'react';

export type ChatMessageEntryProps = {
  author: string | null;
  content: string | JSX.Element;
  active?: boolean;
  isSelf?: boolean;
};

export function ChatMessageEntry({
  author,
  content,
  active,
  isSelf,
}: ChatMessageEntryProps) {
  return (
    <Box marginLeft={1} marginRight={1}>
      {!!author && (
        <Box marginRight={1}>
          <Text bold color={isSelf ? 'cyanBright' : undefined}>
            {author}{' '}
          </Text>
          <Text bold color={active ? 'redBright' : undefined}>
            {figures.pointer}
          </Text>
        </Box>
      )}
      <Text bold={isSelf}>{content}</Text>
    </Box>
  );
}
