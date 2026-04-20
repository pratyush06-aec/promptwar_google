import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = '@nexus_auth_user';

// Derive the API base from the current host (works on Cloud Run and local dev)
const getApiBase = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:3000';
};

/**
 * AuthProvider — manages mock OAuth login/logout and user session.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore persisted session on mount
  useEffect(() => {
    AsyncStorage.getItem(AUTH_STORAGE_KEY).then((stored) => {
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  /**
   * Mock OAuth login. In production, this would redirect to the provider.
   * @param {'google' | 'instagram'} provider
   */
  const login = useCallback(async (provider) => {
    // Simulate OAuth token exchange delay
    await new Promise((r) => setTimeout(r, 800));

    const mockUsers = {
      google: {
        id: 'g-' + Date.now(),
        name: 'Nexus User',
        email: 'user@gmail.com',
        avatar: null,
        provider: 'google',
      },
      instagram: {
        id: 'ig-' + Date.now(),
        name: 'Nexus Creator',
        email: 'creator@instagram.com',
        avatar: null,
        provider: 'instagram',
      },
    };

    const mockUser = mockUsers[provider];

    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUser),
      });
      const data = await res.json();
      const sessionUser = { ...mockUser, token: data.token, bookings: data.bookings || [] };
      setUser(sessionUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    } catch (err) {
      // If backend is unreachable, still allow mock login client-side
      console.warn('Auth API unreachable, using client-only session:', err.message);
      const sessionUser = { ...mockUser, token: 'mock-jwt-' + Date.now(), bookings: [] };
      setUser(sessionUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
