import { gql } from '@apollo/client';

export const LoginQuery = gql`
  query {
    currentAttendee {
      firstName
    }
  }
`;
