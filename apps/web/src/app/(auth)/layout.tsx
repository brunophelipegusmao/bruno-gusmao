import type { Metadata } from 'next';

export const metadata: Metadata = {
  manifest: '/manifest.webmanifest',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
