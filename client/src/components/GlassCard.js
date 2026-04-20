import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useTheme } from '../context/ThemeContext';

/**
 * GlassCard — Reusable frosted-glass card with spring entrance animation.
 * Adapts automatically to the current theme (dark/light).
 */
const GlassCard = ({ children, delay = 0, style }) => {
  const { resolvedTheme: t } = useTheme();

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', delay, damping: 20, stiffness: 100 }}
      style={[
        styles.wrapper,
        { backgroundColor: t.cardBg, borderColor: t.cardBorder },
        style,
      ]}
    >
      <BlurView intensity={30} tint={t.blurTint} style={styles.inner}>
        <LinearGradient colors={t.cardGradient} style={styles.gradientBorder} />
        {children}
      </BlurView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },
  inner: {
    padding: 20,
    flex: 1,
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
});

export default GlassCard;
