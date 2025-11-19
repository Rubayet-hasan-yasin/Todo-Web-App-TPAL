'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthTokens } from '@/lib/types';
import Cookies from 'js-cookie';
import { apiService } from './api-service';

interface AuthContextType {
  user: User | null;
  login: (tokens: AuthTokens, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('access_token');

      if (token && !user) {
        try {
          const userData = await apiService.getProfile();
          setUser(userData);
        } catch {
          Cookies.remove('access_token');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, [user]);

  const login = (newTokens: AuthTokens, newUser: User) => {
    setUser(newUser);
 
    
    Cookies.set('access_token', JSON.stringify(newTokens.access), {
      expires: 1/24,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    Cookies.set("refresh_token", JSON.stringify(newTokens.refresh), {
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isLoading,
      }}
    >
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