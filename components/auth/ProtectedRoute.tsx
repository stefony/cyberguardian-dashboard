'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Add a small delay to allow state to update after login
    const timer = setTimeout(() => {
      if (!loading && !isAuthenticated) {
        setShouldRedirect(true);
      }
    }, 100); // 100ms delay

    return () => clearTimeout(timer);
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/auth/login');
    }
  }, [shouldRedirect, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If not authenticated and should redirect, show nothing
  if (!isAuthenticated && shouldRedirect) {
    return null;
  }

  // If authenticated or still checking, show children
  return <>{children}</>;
}