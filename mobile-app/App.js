import 'react-native-reanimated';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

const WS_URL = 'ws://localhost:3000';
const { width, height } = Dimensions.get('window');

// Liquid Glass Card Wrapper Component
const GlassCard = ({ children, delay = 0, style }) => (
  <MotiView
    from={{ opacity: 0, translateY: 30 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'spring', delay, damping: 20, stiffness: 100 }}
    style={[styles.glassCardWrapper, style]}
  >
    <BlurView intensity={30} tint="dark" style={styles.glassInner}>
      <LinearGradient colors={['rgba(255,255,255,0.1)', 'transparent']} style={styles.glassGradientBorder}/>
      {children}
    </BlurView>
  </MotiView>
);

export default function App() {
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
    } catch(err) { console.log(err) }
    return () => ws && ws.close();
  }, []);

  const openDetails = (cat) => {
    setDetailCategory(cat);
    setActiveView('details');
  };

  const renderDashboard = () => (
    <ScrollView style={styles.scroll}>
      <GlassCard delay={100} style={{ marginBottom: 24, padding: 0 }}>
        <View style={{ padding: 20 }}>
          <Text style={styles.sectionTitle}>Explore Venue</Text>
          <View style={styles.iconGrid}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setActiveView('map')}>
              <Text style={styles.iconEmoji}>🗺️</Text>
              <Text style={styles.iconText}>3D Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => openDetails('food')}>
              <Text style={styles.iconEmoji}>🍔</Text>
              <Text style={styles.iconText}>Food</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => openDetails('washrooms')}>
              <Text style={styles.iconEmoji}>🚻</Text>
              <Text style={styles.iconText}>Washrooms</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => openDetails('merch')}>
              <Text style={styles.iconEmoji}>👕</Text>
              <Text style={styles.iconText}>Merch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </GlassCard>

      <GlassCard delay={200} style={{ marginBottom: 16 }}>
        <Text style={styles.cardHeader}>⏱️ Live Wait Times</Text>
        {Object.keys(venueData.queueTimes).length === 0 && <Text style={styles.subtext}>Waiting for hardware streams...</Text>}
        {Object.entries(venueData.queueTimes).map(([key, time], index) => (
           <MotiView key={key} from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 250 + (index * 50) }} style={styles.queueRow}>
             <Text style={styles.queueAttr}>{key.toUpperCase()}</Text>
             <Text style={[styles.queueVal, time > 10 ? styles.bad : styles.good]}>{time} mins</Text>
           </MotiView>
        ))}
      </GlassCard>

      <GlassCard delay={300}>
        <Text style={styles.cardHeader}>🧠 Predictive AI Alerts</Text>
        {Object.entries(venueData.aiPredictions).map(([sector, ai], index) => (
          <MotiView key={sector} from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: 350 + (index * 50) }} style={styles.alertBox(ai.risk_warning)}>
            <Text style={styles.queueAttr}>Sector {sector.toUpperCase()}</Text>
            <Text style={styles.alertText}>
              {ai.risk_warning === 'high' ? '⚠️ High Congestion Imminent' : '✅ Flow is Optimal'} 
            </Text>
          </MotiView>
        ))}
      </GlassCard>
    </ScrollView>
  );

  const renderMap = () => (
    <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.fullScreenView}>
      <GlassCard delay={100} style={styles.mapSatelliteMock}>
        <View style={styles.mapGrid}></View>
        <Text style={styles.mapSatelliteTitle}>🛰️ Satellite 3D View</Text>
        <Text style={styles.subtext}>High precision Liquid Glass active...</Text>
        
        <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 300 }} style={[styles.poiDot, { top: '30%', left: '40%' }]}><Text>🍔</Text></MotiView>
        <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 400 }} style={[styles.poiDot, { top: '70%', left: '60%' }]}><Text>🚻</Text></MotiView>
      </GlassCard>
      
      <TouchableOpacity onPress={() => setActiveView('dashboard')}>
        <GlassCard delay={400} style={styles.btnPrimary}>
           <Text style={styles.btnText}>Back to Dashboard</Text>
        </GlassCard>
      </TouchableOpacity>
    </MotiView>
  );

  const renderDetails = () => {
    const filteredQueues = Object.entries(venueData.queueTimes).filter(([key]) => {
      if (detailCategory === 'washrooms' && key.toLowerCase().includes('washroom')) return true;
      if (detailCategory === 'food' && key.toLowerCase().includes('food')) return true;
      if (detailCategory === 'merch' && key.toLowerCase().includes('merch')) return true;
      return false; 
    });

    return (
      <MotiView from={{ opacity: 0, translateX: 50 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 300 }} style={styles.fullScreenView}>
        <Text style={styles.detailsHeader}>{detailCategory.toUpperCase()} INFO</Text>
        
        <GlassCard delay={100}>
          <Text style={styles.cardHeader}>📍 Nearby {detailCategory}</Text>
          {filteredQueues.length === 0 ? (
            <Text style={styles.subtext}>No wait times tracked nearest to you right now.</Text>
          ) : (
            filteredQueues.map(([key, time], i) => (
              <MotiView key={key} from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 200 + (i * 100) }} style={styles.queueRow}>
                <Text style={styles.queueAttr}>{key.toUpperCase()}</Text>
                <Text style={[styles.queueVal, time > 10 ? styles.bad : styles.good]}>{time} mins</Text>
              </MotiView>
            ))
          )}
        </GlassCard>

        <TouchableOpacity onPress={() => setActiveView('dashboard')} style={{ marginTop: 20 }}>
          <GlassCard delay={200} style={styles.btnSecondary}>
             <Text style={styles.btnTextSec}>Close Details</Text>
          </GlassCard>
        </TouchableOpacity>
      </MotiView>
    );
  };

  return (
    <LinearGradient colors={['#020617', '#0f172a', '#1e1b4b']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} delay={50} style={styles.header}>
          <Text style={styles.headerTitle}>Nexus Attendee</Text>
          <MotiView 
            from={{ opacity: 0.5, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1.2 }} 
            transition={{ type: 'timing', duration: 1000, loop: true }}
            style={styles.statusDot} 
          />
        </MotiView>

        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'map' && renderMap()}
        {activeView === 'details' && renderDetails()}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#f8fafc', letterSpacing: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00e5ff', shadowColor: '#00e5ff', shadowOffset:{width:0,height:0}, shadowOpacity: 1, shadowRadius: 10 },
  scroll: { padding: 16 },
  
  // Liquid Glass Styles
  glassCardWrapper: { borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  glassInner: { padding: 20, flex: 1 },
  glassGradientBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  
  sectionTitle: { fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 16 },
  iconGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  iconBtn: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: 16, alignItems: 'center', width: '23%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  iconEmoji: { fontSize: 24, marginBottom: 8 },
  iconText: { color: '#cbd5e1', fontSize: 11, fontWeight: '700' },
  
  cardHeader: { fontSize: 18, fontWeight: '900', color: 'white', marginBottom: 16, letterSpacing: 0.5 },
  subtext: { color: '#94a3b8' },
  
  queueRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  queueAttr: { color: '#cbd5e1', fontSize: 16, fontWeight: '600' },
  queueVal: { fontSize: 16, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width:0, height:2}, textShadowRadius: 4 },
  good: { color: '#34d399' },
  bad: { color: '#fb7185' },
  
  alertBox: (risk) => ({
    padding: 16, borderRadius: 16, marginTop: 10,
    backgroundColor: risk === 'high' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1, borderColor: risk === 'high' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.3)',
  }),
  alertText: { color: 'white', marginTop: 4, fontWeight: '600' },

  fullScreenView: { padding: 20, flex: 1 },
  detailsHeader: { fontSize: 28, color: 'white', fontWeight: '900', marginBottom: 20, textShadowColor: '#3b82f6', textShadowRadius: 10 },
  
  mapSatelliteMock: { 
    flex: 1, marginBottom: 20, padding: 0, justifyContent: 'center', alignItems: 'center'
  },
  mapGrid: { position: 'absolute', width: '200%', height: '200%', borderTopWidth: 1, borderLeftWidth: 1, borderColor: 'rgba(59, 130, 246, 0.2)' },
  mapSatelliteTitle: { fontSize: 24, fontWeight: '900', color: 'white', zIndex: 10 },
  poiDot: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },

  btnPrimary: { padding: 0, backgroundColor: 'rgba(59, 130, 246, 0.3)' },
  btnSecondary: { padding: 0, backgroundColor: 'transparent' },
  btnText: { color: 'white', fontWeight: '900', fontSize: 16, textAlign: 'center' },
  btnTextSec: { color: '#60a5fa', fontWeight: '900', fontSize: 16, textAlign: 'center' }
});
