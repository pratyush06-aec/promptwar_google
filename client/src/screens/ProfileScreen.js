import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/**
 * ProfileScreen — displays user info, auth provider, and mock venue bookings.
 */
const ProfileScreen = ({ onBack }) => {
  const { user, logout } = useAuth();
  const { resolvedTheme: t } = useTheme();

  const providerLabel = user?.provider === 'google' ? '🔵 Google' : '🟣 Instagram';
  const providerColor = user?.provider === 'google' ? '#4285F4' : '#E1306C';

  // Mock bookings data
  const bookings = [
    { id: 1, venue: 'National Stadium', gate: 'Gate 3', date: 'Apr 25, 2026', status: 'Confirmed' },
    { id: 2, venue: 'City Arena', gate: 'Gate 1', date: 'May 02, 2026', status: 'Pending' },
    { id: 3, venue: 'Mega Dome', gate: 'VIP Entrance', date: 'May 15, 2026', status: 'Confirmed' },
  ];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <GlassCard delay={100}>
        <View style={styles.profileHeader}>
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 200 }}
            style={[styles.avatarCircle, { borderColor: providerColor }]}
          >
            <Text style={[styles.avatarLetter, { color: providerColor }]}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </MotiView>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: t.text }]}>{user?.name || 'Guest'}</Text>
            <Text style={[styles.profileEmail, { color: t.subtext }]}>{user?.email || '—'}</Text>
            <View style={[styles.providerBadge, { backgroundColor: providerColor + '22' }]}>
              <Text style={[styles.providerBadgeText, { color: providerColor }]}>{providerLabel}</Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Bookings */}
      <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 300 }}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>🎫 My Bookings</Text>
      </MotiView>

      {bookings.map((booking, index) => (
        <GlassCard key={booking.id} delay={350 + index * 100}>
          <View style={styles.bookingRow}>
            <View>
              <Text style={[styles.bookingVenue, { color: t.text }]}>{booking.venue}</Text>
              <Text style={[styles.bookingMeta, { color: t.subtext }]}>{booking.gate} · {booking.date}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: booking.status === 'Confirmed' ? t.alertLowBg : t.alertHighBg }
            ]}>
              <Text style={{
                color: booking.status === 'Confirmed' ? t.good : t.bad,
                fontSize: 12,
                fontWeight: '700',
              }}>
                {booking.status}
              </Text>
            </View>
          </View>
        </GlassCard>
      ))}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onBack}>
          <GlassCard delay={600} style={styles.actionBtn}>
            <Text style={[styles.actionBtnText, { color: t.btnSecText }]}>← Back to Dashboard</Text>
          </GlassCard>
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} style={{ marginTop: 12 }}>
          <GlassCard delay={700} style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
            <Text style={[styles.actionBtnText, { color: '#fb7185' }]}>Log Out</Text>
          </GlassCard>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  avatarLetter: { fontSize: 28, fontWeight: '900' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  profileEmail: { fontSize: 14, marginBottom: 8 },
  providerBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  providerBadgeText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 20, fontWeight: '900', marginTop: 8 },
  bookingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingVenue: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  bookingMeta: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actions: { marginTop: 8 },
  actionBtn: { padding: 0 },
  actionBtnText: { fontWeight: '900', fontSize: 15, textAlign: 'center' },
});

export default ProfileScreen;
