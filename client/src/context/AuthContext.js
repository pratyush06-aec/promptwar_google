import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();

const AUTH_STORAGE_KEY = '@nexus_auth_user';

// Replace string with the real Web Client ID created in your GCP console
const GOOGLE_CLIENT_ID = '1234567890-testclientid.apps.googleusercontent.com';

const getApiBase = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:3000';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Expose Google Auth hook to LoginScreen
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    AsyncStorage.getItem(AUTH_STORAGE_KEY).then((stored) => {
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch {}
      }
      setIsLoading(false);
    });
  }, []);

  // Watch for successful Google auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleBackendLogin('google', { idToken: id_token });
    }
  }, [response]);

  /**
   * Internal method to exchange idToken or mockData with backend.
   */
  const handleBackendLogin = async (provider, payload) => {
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, ...payload }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Login failed');

      const sessionUser = { ...data.user, token: data.token, bookings: data.bookings || [] };
      setUser(sessionUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    } catch (err) {
      console.error('Backend auth handoff failed:', err.message);
      alert('Authentication Failed: ' + err.message);
    }
  };

  /**
   * Public login method.
   * @param {'google' | 'instagram'} provider
   */
  const login = useCallback(async (provider) => {
    if (provider === 'google') {
      promptAsync();
    } else if (provider === 'instagram') {
      // Instagram remains a mock flow until real Meta Developer App is configured
      await new Promise(r => setTimeout(r, 800));
      handleBackendLogin('instagram', { 
        mockData: { email: 'creator@instagram.com', name: 'Nexus Creator' } 
      });
    }
  }, [promptAsync]);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout, googleAuthReady: !!request }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
