import { Box, Text } from 'ink';
import figures from 'figures';
import React from 'react';
import { UserChannel } from '../../types/chat';
import { Divider, LoadingIndicator, Selectable } from '../common';

export type ChatChannelSelectorProps = {
  channels: UserChannel[];
  activeChannel: string;
  channelsLoading: boolean;
};

export function ChatChannelSelector({
  channels,
  activeChannel,
  channelsLoading,
}: ChatChannelSelectorProps) {
  return (
    <Box width={40} flexDirection="column" borderStyle="single" padding={1}>
      <Divider title="Channels" />
      {channelsLoading && <LoadingIndicator text="Loading Channels..." />}
      {!channelsLoading && channels.length === 0 && (
        <Text bold color="red">
          No channels available
        </Text>
      )}
      {!channelsLoading &&
        channels.length > 0 &&
        channels.map((channel) => {
          return (
            <Selectable
              key={channel.sid}
              wrap="truncate-end"
              active={channel.name === activeChannel}
            >
              <Text bold>{channel.displayName}</Text>
              {channel.unread && (
                <Text color="cyanBright" bold>
                  {` ${figures.circleFilled} `}
                </Text>
              )}
            </Selectable>
          );
        })}
    </Box>
  );
}
