'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  company?: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('🔵 AuthProvider useEffect - checking auth...');
    console.log('🔵 Current pathname:', pathname);
    
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    console.log('🔵 Token from localStorage:', token ? 'EXISTS' : 'NULL');
    console.log('🔵 User from localStorage:', userData ? 'EXISTS' : 'NULL');

   if (token) {
  if (userData) {
    const parsedUser = JSON.parse(userData);
    console.log('✅ Setting user:', parsedUser);
    setUser(parsedUser);
  } else {
    // License-based auth without user object
    const licenseKey = localStorage.getItem('license_key');
    if (licenseKey) {
      console.log('✅ Setting user from license');
      setUser({
        id: 'license-user',
        email: 'license@user',
        username: 'License User',
        is_admin: false
      });
    }
  }
} else {
  console.log('❌ No token found');
}
    
    setLoading(false);
    console.log('🔵 Loading set to false');
  }, [pathname]);

  const login = (token: string, userData: User) => {
    console.log('🔵 AuthContext.login() called with:', { token: token.substring(0, 20) + '...', user: userData.email });
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log('✅ User state updated in AuthContext');
  };
  
  const logout = () => {
    console.log('🔵 AuthContext.logout() called');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/auth/login';
  };
  
  const isAuthenticated = !!user;
  
  console.log('🔵 AuthProvider render:', { 
    isAuthenticated, 
    user: user?.email || 'null', 
    loading,
    pathname 
  });

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}