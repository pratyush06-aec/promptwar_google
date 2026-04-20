import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, LightTheme } from '../themes/colors';

const ThemeContext = createContext();

const STORAGE_KEY = '@nexus_theme_mode';

/**
 * ThemeProvider — manages dark / light / system theme preference.
 * Persists choice in AsyncStorage. Listens to system appearance changes.
 */
export function ThemeProvider({ children }) {
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' | 'light' | 'system'
  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme() || 'dark');

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) setThemeMode(stored);
    });
  }, []);

  // Listen for system appearance changes
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'dark');
    });
    return () => sub?.remove?.();
  }, []);

  // Resolve the actual palette
  const resolvedTheme = (() => {
    if (themeMode === 'system') {
      return systemScheme === 'light' ? LightTheme : DarkTheme;
    }
    return themeMode === 'light' ? LightTheme : DarkTheme;
  })();

  // Cycle: dark → light → system → dark
  const cycleTheme = useCallback(async () => {
    const next = themeMode === 'dark' ? 'light' : themeMode === 'light' ? 'system' : 'dark';
    setThemeMode(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, resolvedTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
