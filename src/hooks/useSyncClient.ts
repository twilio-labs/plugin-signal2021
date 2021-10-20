import { useApolloClient } from '@apollo/client';
import { useCallback, useEffect, useState } from 'react';
import SyncClient from 'twilio-sync';

import {
  SyncAccessToken,
  SyncAccessTokenInputs,
  SyncAccessTokenQuery,
} from '../queries/chat';

export function useSyncClient(feature: SyncAccessTokenInputs['feature']) {
  const apolloClient = useApolloClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [syncClient, setSyncClient] = useState<SyncClient | undefined>();

  const fetchAccessToken = useCallback(async () => {
    const { data, errors } = await apolloClient.query<
      SyncAccessToken,
      SyncAccessTokenInputs
    >({
      query: SyncAccessTokenQuery,
      variables: {
        feature,
      },
    });

    if (errors || !data?.accessToken) {
      throw new Error('Failed to fetch AccessToken for Chat Client');
    }

    return data.accessToken;
  }, [apolloClient, feature]);

  useEffect(() => {
    if (!syncClient && !error) {
      (async () => {
        try {
          const accessToken = await fetchAccessToken();
          const client = new SyncClient(accessToken);

          const fetchNewToken = async () => {
            const updatedToken = await fetchAccessToken();
            client.updateToken(updatedToken);
          };

          client.on('tokenAboutToExpire', fetchNewToken);
          client.on('tokenExpired', fetchNewToken);
          client.on('connectionError', (connectionError) => {
            console.debug('Connection error: ', connectionError.message);
            setError(connectionError);
          });
          client.on(
            'connectionStateChange',
            (newState: SyncClient['connectionState']) => {
              console.debug('Connection state changed: ', newState);
              if (
                newState === 'disconnected' ||
                newState === 'denied' ||
                newState === 'error'
              ) {
                setSyncClient(undefined);
              }
            }
          );

          setSyncClient(client);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      })();
    }

    return () => {
      // Adding check fixes crash condition where syncClient is disconnected before a connection has been established
      // ex. user leaves chat before done loading
      if (
        syncClient &&
        !['connecting', 'disconnected'].includes(syncClient.connectionState)
      ) {
        syncClient?.shutdown();
      }
    };
  }, [syncClient, fetchAccessToken, error]);

  return { syncClient, error, loading };
}
