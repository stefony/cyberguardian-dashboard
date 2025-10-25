'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');

  if (isAuthPage) {
    // Auth pages - no sidebar
    return <>{children}</>;
  }

  // Dashboard pages - with sidebar
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto ml-64">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}