'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    // Check localStorage directly as fallback
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');
      
      // If we have token in localStorage, consider authenticated
      if (token && user) {
        setCheckedAuth(true);
        return true;
      }
      
      // If no token and not loading, redirect
      if (!loading && !isAuthenticated && !token) {
        router.push('/auth/login');
        return false;
      }
      
      setCheckedAuth(true);
      return true;
    };

    checkAuth();
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking
  if (loading || !checkedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Check localStorage one more time before rendering
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  
  // If we have token OR isAuthenticated, show content
  if (token || isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise, show nothing (will redirect)
  return null;
}