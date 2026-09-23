import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ControlPanel/appSidebar';
import { getSessionCookieHeader } from '@/lib/server-auth';

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
};

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('access_token');

  if (!sessionCookie) {
    redirect('/login');
  }

  const authHeaders = await getSessionCookieHeader();
  const base = process.env.API_URL ?? 'http://localhost:3001';
  const res = await fetch(
    `${base}/api/auth/me`,
    { headers: authHeaders, cache: 'no-store' },
  );

  if (!res.ok) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
