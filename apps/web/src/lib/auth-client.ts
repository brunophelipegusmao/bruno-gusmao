"use client";

import { useEffect, useState } from "react";

// A API Java não usa BetterAuth: login é Google OAuth2 direto (redirect de página
// inteira, sem endpoint de "sign-in" via fetch) e a sessão vira um JWT em cookie
// httpOnly (`access_token`), verificado em GET /api/auth/me (ver
// docs/java-migration/01-auth.md).
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type CurrentUser = { id: string; name: string; email: string };

export function signInWithGoogle() {
  window.location.href = `${API_URL}/oauth2/authorization/google`;
}

export async function signOut() {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export function useSession() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isPending, setIsPending] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/api/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data: user ? { user } : null, isPending };
}
