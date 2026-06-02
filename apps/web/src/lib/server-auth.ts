import { cookies } from 'next/headers';

export async function getSessionCookieHeader(): Promise<Record<string, string>> {
  const store = await cookies();
  const cookie =
    store.get('__Secure-better-auth.session_token') ??
    store.get('better-auth.session_token');

  if (!cookie) return {};
  return { Cookie: `${cookie.name}=${cookie.value}` };
}
