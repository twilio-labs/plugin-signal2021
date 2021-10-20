import { gql } from '@apollo/client';

export const SessionsQuery = gql`
  query {
    swoogoSessions(
      filters: { isPublished: true }
      pagination: { perPage: 1000 }
    ) {
      nodes {
        id
        date
        startTime
        endTime
        name
        description
        speakers {
          firstName
          lastName
        }
        ticketType
        level
      }
    }
    currentAttendee {
      id
      sessions {
        id
        date
        startTime
        endTime
        name
      }
    }
  }
`;

export const RegisterForSessionQuery = gql`
  mutation addSessionToAttendee($attendeeId: ID!, $sessionId: ID!) {
    addSessionToAttendee(attendeeId: $attendeeId, sessionId: $sessionId) {
      id
    }
  }
`;

export const UnregisterForSessionQuery = gql`
  mutation removeSessionFromAttendee($attendeeId: ID!, $sessionId: ID!) {
    removeSessionFromAttendee(attendeeId: $attendeeId, sessionId: $sessionId) {
      id
    }
  }
`;
