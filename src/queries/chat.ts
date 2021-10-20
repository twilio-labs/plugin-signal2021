import { gql } from '@apollo/client';

export type SyncAccessToken = {
  accessToken: string;
};

export type SyncAccessTokenInputs = {
  feature: 'NETWORKING_CHAT';
};

export const SyncAccessTokenQuery = gql`
  query AccessToken($feature: Feature!) {
    accessToken(feature: $feature)
  }
`;

export const AddMessageMutation = gql`
  mutation addMessage($channelId: ID!, $message: MessageInput!) {
    addMessage(channelId: $channelId, message: $message) {
      date_created
      index
      visible
    }
  }
`;
