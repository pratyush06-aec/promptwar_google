import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/**
 * LoginScreen — full-screen OAuth provider selection.
 * Displays Google and Instagram buttons with staggered Moti entrance animations.
 */
const LoginScreen = () => {
  const { login } = useAuth();
  const { resolvedTheme: t } = useTheme();
  const [loading, setLoading] = useState(null);

  const handleLogin = async (provider) => {
    setLoading(provider);
    await login(provider);
    setLoading(null);
  };

  return (
    <LinearGradient colors={t.background} style={styles.container}>
      {/* Animated Logo Area */}
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', delay: 100, damping: 12 }}
        style={styles.logoArea}
      >
        <Text style={styles.logoEmoji}>🏟️</Text>
        <Text style={[styles.title, { color: t.text }]}>Nexus Venue</Text>
        <Text style={[styles.subtitle, { color: t.subtext }]}>
          Smart Crowd Management
        </Text>
      </MotiView>

      {/* Provider Buttons */}
      <MotiView
        from={{ opacity: 0, translateY: 40 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', delay: 300, damping: 18 }}
        style={styles.btnGroup}
      >
        {/* Google */}
        <TouchableOpacity
          style={[styles.providerBtn, styles.googleBtn]}
          onPress={() => handleLogin('google')}
          disabled={!!loading}
        >
          {loading === 'google' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.providerIcon}>G</Text>
              <Text style={styles.providerText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Instagram */}
        <TouchableOpacity
          style={[styles.providerBtn, styles.igBtn]}
          onPress={() => handleLogin('instagram')}
          disabled={!!loading}
        >
          {loading === 'instagram' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.providerIcon}>📷</Text>
              <Text style={styles.providerText}>Continue with Instagram</Text>
            </>
          )}
        </TouchableOpacity>
      </MotiView>

      {/* Footer */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 500 }}
        style={styles.footer}
      >
        <Text style={[styles.footerText, { color: t.subtext }]}>
          By continuing, you agree to Nexus Venue's Terms of Service
        </Text>
      </MotiView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  btnGroup: {
    width: '100%',
    maxWidth: 340,
    gap: 16,
  },
  providerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  googleBtn: {
    backgroundColor: '#4285F4',
  },
  igBtn: {
    backgroundColor: '#E1306C',
  },
  providerIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '900',
  },
  providerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 32,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default LoginScreen;
