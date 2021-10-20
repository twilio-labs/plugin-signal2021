import figures from 'figures';
import { Box, Text } from 'ink';
import React from 'react';
import { Inverse } from '../common';

export type ChatMessageEntryProps = {
  author: string | null;
  content: string | JSX.Element;
  active?: boolean;
  isSelf?: boolean;
  isMod?: boolean;
};

export function ChatMessageEntry({
  author,
  content,
  active,
  isSelf,
  isMod,
}: ChatMessageEntryProps) {
  const MessageContents = isMod ? Inverse : Text;

  return (
    <Box marginLeft={1} marginRight={1}>
      {!!author && (
        <Box marginRight={1}>
          <Text
            bold
            color={isSelf ? 'cyanBright' : isMod ? 'redBright' : undefined}
          >
            {author}{' '}
          </Text>
          <Text bold color={active ? 'redBright' : undefined}>
            {figures.pointer}
          </Text>
        </Box>
      )}
      <MessageContents bold={isSelf || isMod}>{content}</MessageContents>
    </Box>
  );
}
