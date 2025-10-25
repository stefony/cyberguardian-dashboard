'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    // Auth pages - no sidebar, no protection
    return <>{children}</>;
  }

  // Dashboard pages - with sidebar and protection
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto ml-64">
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}