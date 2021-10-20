import { LoginQuery } from '../queries/login';
import { client } from '../utils/graphqlClient';

export async function login() {
  const result = await client().query({
    query: LoginQuery,
  });

  return result.data.currentAttendee;
}
