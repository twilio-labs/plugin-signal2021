import { gql } from '@apollo/client';

export const UserProfileQuery = gql`
  query getUser {
    currentAttendee {
      id
      avatarUrl
      attendeeType
      email
      firstName
      lastName
    }
  }
`;
