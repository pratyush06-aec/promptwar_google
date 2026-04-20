import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/**
 * ProfileIcon — circular avatar in the header.
 * Shows first letter of name or a default icon.
 */
const ProfileIcon = ({ onPress }) => {
  const { user } = useAuth();
  const { resolvedTheme: t } = useTheme();

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';
  const providerColor = user?.provider === 'google' ? '#4285F4' : '#E1306C';

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, { borderColor: providerColor }]}>
      <View style={[styles.circle, { backgroundColor: providerColor + '22' }]}>
        <Text style={[styles.letter, { color: providerColor }]}>{initial}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
  },
  circle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontSize: 16,
    fontWeight: '900',
  },
});

export default ProfileIcon;
