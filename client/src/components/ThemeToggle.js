import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle — cycles dark → light → system with an animated icon.
 * Placed in the header bar beside the profile icon.
 */
const ThemeToggle = () => {
  const { themeMode, cycleTheme } = useTheme();

  const icon = themeMode === 'dark' ? '🌙' : themeMode === 'light' ? '☀️' : '🖥️';
  const label = themeMode === 'dark' ? 'Dark' : themeMode === 'light' ? 'Light' : 'Auto';

  return (
    <TouchableOpacity onPress={cycleTheme} style={styles.container} accessibilityLabel={`Theme: ${label}`}>
      <MotiView
        key={themeMode}
        from={{ rotate: '-90deg', opacity: 0 }}
        animate={{ rotate: '0deg', opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
      >
        <Text style={styles.icon}>{icon}</Text>
      </MotiView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  icon: {
    fontSize: 18,
  },
});

export default ThemeToggle;
