import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ControlPanel/appSidebar';

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('better-auth.session_token');

  if (!sessionToken) {
    redirect('/login');
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`,
    {
      headers: { Cookie: `better-auth.session_token=${sessionToken.value}` },
      cache: 'no-store',
    },
  );

  const session = await res.json();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
