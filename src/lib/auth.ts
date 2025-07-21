import { AuthError } from './error';
import { supabaseAdmin } from './supabaseAdmin';

export async function getUserFromHeader(req: Request) {
  const auth = req.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    throw new AuthError(401, 'Missing or invalid Authorization header');
  }

  const token = auth.split(' ')[1];
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new AuthError(401, error?.message ?? 'Invalid token');
  }

  return user;
}
