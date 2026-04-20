import 'react-native-reanimated';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

// Context Providers
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Components
import GlassCard from './src/components/GlassCard';
import ThemeToggle from './src/components/ThemeToggle';
import ProfileIcon from './src/components/ProfileIcon';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const protocol = Platform.OS === 'web' && typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
const WS_URL = `${protocol}//${host}`;
const { width, height } = Dimensions.get('window');

// ─── Main App (wrapped in providers) ───────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppInner() {
  const { isAuthenticated, isLoading } = useAuth();
  const { resolvedTheme: t } = useTheme();

  if (isLoading) {
    return (
      <LinearGradient colors={t.background} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: t.subtext, fontSize: 16 }}>Loading...</Text>
      </LinearGradient>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <DashboardApp />;
}

// ─── Dashboard App (post-auth) ─────────────────────────────────────
function DashboardApp() {
  const { resolvedTheme: t } = useTheme();
  const [venueData, setVenueData] = useState({ queueTimes: {}, aiPredictions: {} });
  const [activeView, setActiveView] = useState('dashboard');
  const [detailCategory, setDetailCategory] = useState('');

  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket(WS_URL);
      ws.onopen = () => console.log('Connected to Venue Backend');
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'VENUE_UPDATE' || msg.type === 'INIT') {
          setVenueData(msg.data);
        }
      };
    } catch (err) { console.log(err); }
    return () => ws && ws.close();
  }, []);

  const openDetails = (cat) => {
    setDetailCategory(cat);
    setActiveView('details');
  };

  // ─── Dashboard View ──────────────────────
  const renderDashboard = () => (
    <ScrollView style={styles.scroll}>
      <GlassCard delay={100} style={{ marginBottom: 24, padding: 0 }}>
        <View style={{ padding: 20 }}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Explore Venue</Text>
          <View style={styles.iconGrid}>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: t.iconBtnBg, borderColor: t.iconBtnBorder }]} onPress={() => setActiveView('map')}>
              <Text style={styles.iconEmoji}>🗺️</Text>
              <Text style={[styles.iconText, { color: t.textSecondary }]}>3D Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: t.iconBtnBg, borderColor: t.iconBtnBorder }]} onPress={() => openDetails('food')}>
              <Text style={styles.iconEmoji}>🍔</Text>
              <Text style={[styles.iconText, { color: t.textSecondary }]}>Food</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: t.iconBtnBg, borderColor: t.iconBtnBorder }]} onPress={() => openDetails('washrooms')}>
              <Text style={styles.iconEmoji}>🚻</Text>
              <Text style={[styles.iconText, { color: t.textSecondary }]}>Washrooms</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: t.iconBtnBg, borderColor: t.iconBtnBorder }]} onPress={() => openDetails('merch')}>
              <Text style={styles.iconEmoji}>👕</Text>
              <Text style={[styles.iconText, { color: t.textSecondary }]}>Merch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GlassCard>

      <GlassCard delay={200} style={{ marginBottom: 16 }}>
        <Text style={[styles.cardHeader, { color: t.text }]}>⏱️ Live Wait Times</Text>
        {Object.keys(venueData.queueTimes).length === 0 && (
          <Text style={{ color: t.subtext }}>Waiting for hardware streams...</Text>
        )}
        {Object.entries(venueData.queueTimes).map(([key, time], index) => (
          <MotiView key={key} from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 250 + index * 50 }} style={[styles.queueRow, { borderColor: t.queueRowBorder }]}>
            <Text style={[styles.queueAttr, { color: t.textSecondary }]}>{key.toUpperCase()}</Text>
            <Text style={[styles.queueVal, { color: time > 10 ? t.bad : t.good }]}>{time} mins</Text>
          </MotiView>
        ))}
      </GlassCard>

      <GlassCard delay={300}>
        <Text style={[styles.cardHeader, { color: t.text }]}>🧠 Predictive AI Alerts</Text>
        {Object.entries(venueData.aiPredictions).map(([sector, ai], index) => (
          <MotiView
            key={sector}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 350 + index * 50 }}
            style={{
              padding: 16, borderRadius: 16, marginTop: 10,
              backgroundColor: ai.risk_warning === 'high' ? t.alertHighBg : t.alertLowBg,
              borderWidth: 1,
              borderColor: ai.risk_warning === 'high' ? t.alertHighBorder : t.alertLowBorder,
            }}
          >
            <Text style={[styles.queueAttr, { color: t.textSecondary }]}>Sector {sector.toUpperCase()}</Text>
            <Text style={{ color: t.alertText, marginTop: 4, fontWeight: '600' }}>
              {ai.risk_warning === 'high' ? '⚠️ High Congestion Imminent' : '✅ Flow is Optimal'}
            </Text>
          </MotiView>
        ))}
      </GlassCard>
    </ScrollView>
  );

  // ─── Map View ────────────────────────────
  const renderMap = () => (
    <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.fullScreenView}>
      <GlassCard delay={100} style={styles.mapSatelliteMock}>
        <View style={[styles.mapGrid, { borderColor: t.mapGridColor }]} />
        <Text style={[styles.mapSatelliteTitle, { color: t.text }]}>🛰️ Satellite 3D View</Text>
        <Text style={{ color: t.subtext }}>High precision Liquid Glass active...</Text>
        <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 300 }} style={[styles.poiDot, { top: '30%', left: '40%', backgroundColor: t.poiDotBg, borderColor: t.poiDotBorder }]}><Text>🍔</Text></MotiView>
        <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 400 }} style={[styles.poiDot, { top: '70%', left: '60%', backgroundColor: t.poiDotBg, borderColor: t.poiDotBorder }]}><Text>🚻</Text></MotiView>
      </GlassCard>
      <TouchableOpacity onPress={() => setActiveView('dashboard')}>
        <GlassCard delay={400} style={[styles.btnPrimary, { backgroundColor: t.btnPrimaryBg }]}>
          <Text style={{ color: t.text, fontWeight: '900', fontSize: 16, textAlign: 'center' }}>Back to Dashboard</Text>
        </GlassCard>
      </TouchableOpacity>
    </MotiView>
  );

  // ─── Details View ────────────────────────
  const renderDetails = () => {
    const filteredQueues = Object.entries(venueData.queueTimes).filter(([key]) => {
      if (detailCategory === 'washrooms' && key.toLowerCase().includes('washroom')) return true;
      if (detailCategory === 'food' && key.toLowerCase().includes('food')) return true;
      if (detailCategory === 'merch' && key.toLowerCase().includes('merch')) return true;
      return false;
    });
    return (
      <MotiView from={{ opacity: 0, translateX: 50 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 300 }} style={styles.fullScreenView}>
        <Text style={[styles.detailsHeader, { color: t.text, textShadowColor: t.accentGlow }]}>{detailCategory.toUpperCase()} INFO</Text>
        <GlassCard delay={100}>
          <Text style={[styles.cardHeader, { color: t.text }]}>📍 Nearby {detailCategory}</Text>
          {filteredQueues.length === 0 ? (
            <Text style={{ color: t.subtext }}>No wait times tracked nearest to you right now.</Text>
          ) : (
            filteredQueues.map(([key, time], i) => (
              <MotiView key={key} from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 + i * 100 }} style={[styles.queueRow, { borderColor: t.queueRowBorder }]}>
                <Text style={[styles.queueAttr, { color: t.textSecondary }]}>{key.toUpperCase()}</Text>
                <Text style={[styles.queueVal, { color: time > 10 ? t.bad : t.good }]}>{time} mins</Text>
              </MotiView>
            ))
          )}
        </GlassCard>
        <TouchableOpacity onPress={() => setActiveView('dashboard')} style={{ marginTop: 20 }}>
          <GlassCard delay={200} style={{ padding: 0, backgroundColor: 'transparent' }}>
            <Text style={{ color: t.btnSecText, fontWeight: '900', fontSize: 16, textAlign: 'center' }}>Close Details</Text>
          </GlassCard>
        </TouchableOpacity>
      </MotiView>
    );
  };

  return (
    <LinearGradient colors={t.background} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} delay={50} style={styles.header}>
          <Text style={[styles.headerTitle, { color: t.headerTitle }]}>Nexus Attendee</Text>
          <View style={styles.headerRight}>
            <ThemeToggle />
            <ProfileIcon onPress={() => setActiveView('profile')} />
            <MotiView
              from={{ opacity: 0.5, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.2 }}
              transition={{ type: 'timing', duration: 1000, loop: true }}
              style={[styles.statusDot, { backgroundColor: t.statusDot, shadowColor: t.statusDot }]}
            />
          </View>
        </MotiView>

        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'map' && renderMap()}
        {activeView === 'details' && renderDetails()}
        {activeView === 'profile' && <ProfileScreen onBack={() => setActiveView('dashboard')} />}
      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10 },
  scroll: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  iconGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  iconBtn: { padding: 14, borderRadius: 16, alignItems: 'center', width: '23%', borderWidth: 1 },
  iconEmoji: { fontSize: 24, marginBottom: 8 },
  iconText: { fontSize: 11, fontWeight: '700' },
  cardHeader: { fontSize: 18, fontWeight: '900', marginBottom: 16, letterSpacing: 0.5 },
  queueRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  queueAttr: { fontSize: 16, fontWeight: '600' },
  queueVal: { fontSize: 16, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  fullScreenView: { padding: 20, flex: 1 },
  detailsHeader: { fontSize: 28, fontWeight: '900', marginBottom: 20, textShadowRadius: 10 },
  mapSatelliteMock: { flex: 1, marginBottom: 20, padding: 0, justifyContent: 'center', alignItems: 'center' },
  mapGrid: { position: 'absolute', width: '200%', height: '200%', borderTopWidth: 1, borderLeftWidth: 1 },
  mapSatelliteTitle: { fontSize: 24, fontWeight: '900', zIndex: 10 },
  poiDot: { position: 'absolute', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnPrimary: { padding: 0 },
});
