import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const AuthContext = createContext();

const AUTH_STORAGE_KEY = '@nexus_auth_user';

const getApiBase = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:3000';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(AUTH_STORAGE_KEY).then((stored) => {
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  /**
   * Internal method to exchange mockData with backend to persist in Firestore.
   */
  const handleBackendLogin = async (provider, mockData) => {
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, mockData }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Login failed');

      const sessionUser = { ...data.user, token: data.token, bookings: data.bookings || [] };
      setUser(sessionUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    } catch (err) {
      console.error('Backend auth handoff failed:', err.message);
      // Fallback for isolated local testing if backend is down
      const fallbackUser = { ...mockData, token: 'mock-jwt-fallback', bookings: [] };
      setUser(fallbackUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackUser));
    }
  };

  /**
   * Public login method.
   * @param {'google' | 'instagram'} provider
   */
  const login = useCallback(async (provider) => {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    if (provider === 'google') {
      handleBackendLogin('google', { 
        email: 'user@gmail.com', 
        name: 'Nexus User',
        id: 'g-dummy-id',
        avatar: null
      });
    } else if (provider === 'instagram') {
      handleBackendLogin('instagram', { 
        email: 'creator@instagram.com', 
        name: 'Nexus Creator',
        id: 'ig-dummy-id',
        avatar: null
      });
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
