'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { User, LoginRequest, SignupRequest } from '@/types/auth';
import { authAPI } from '@/lib/authApi';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialFetchDone = useRef(false);
  const checkInFlight = useRef(false);

  const refreshUser = useCallback(async () => {
    if (checkInFlight.current) return;
    checkInFlight.current = true;
    try {
      const authStatus = await authAPI.checkAuth();
      if (authStatus.authenticated && authStatus.user) {
        setUser(authStatus.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      checkInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authAPI.login(data);
    setUser(response.user);
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    const response = await authAPI.signup(data);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    await authAPI.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser }}>
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
