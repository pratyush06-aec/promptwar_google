import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

const WS_URL = 'ws://localhost:3000';

export default function App() {
  const [venueData, setVenueData] = useState({ queueTimes: {}, aiPredictions: {} });
  // 'dashboard' | 'map' | 'details'
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
      {/* Quick Action Icons */}
      <Text style={styles.sectionTitle}>Explore Venue</Text>
      <View style={styles.iconGrid}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setActiveView('map')}>
          <Text style={styles.iconEmoji}>🗺️</Text>
          <Text style={styles.iconText}>3D Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => openDetails('food')}>
          <Text style={styles.iconEmoji}>🍔</Text>
          <Text style={styles.iconText}>Food Stalls</Text>
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

      {/* Live Wait Times */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>⏱️ Live Wait Times</Text>
        {Object.keys(venueData.queueTimes).length === 0 && <Text style={styles.subtext}>Waiting for hardware streams...</Text>}
        {Object.entries(venueData.queueTimes).map(([key, time]) => (
           <View key={key} style={styles.queueRow}>
             <Text style={styles.queueAttr}>{key.toUpperCase()}</Text>
             <Text style={[styles.queueVal, time > 10 ? styles.bad : styles.good]}>{time} mins</Text>
           </View>
        ))}
      </View>

      {/* Predictive AI Alerts */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>🧠 Predictive AI Alerts</Text>
        {Object.entries(venueData.aiPredictions).map(([sector, ai]) => (
          <View key={sector} style={styles.alertBox(ai.risk_warning)}>
            <Text style={styles.queueAttr}>Sector {sector.toUpperCase()}</Text>
            <Text style={styles.alertText}>
              {ai.risk_warning === 'high' ? '⚠️ High Congestion Imminent' : '✅ Flow is Optimal'} 
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderMap = () => (
    <View style={styles.fullScreenView}>
      <View style={styles.mapSatelliteMock}>
        <View style={styles.mapGrid}></View>
        <Text style={styles.mapSatelliteTitle}>🛰️ Satellite 3D View Active</Text>
        <Text style={styles.subtext}>High precision mapping enabled...</Text>
        
        <View style={[styles.poiDot, { top: '30%', left: '40%' }]}><Text>🍔</Text></View>
        <View style={[styles.poiDot, { top: '70%', left: '60%' }]}><Text>🚻</Text></View>
      </View>
      <TouchableOpacity style={styles.btnPrimary} onPress={() => setActiveView('dashboard')}>
        <Text style={styles.btnText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDetails = () => {
    // Filter queue times based on category mock logic
    const filteredQueues = Object.entries(venueData.queueTimes).filter(([key]) => {
      if (detailCategory === 'washrooms' && key.toLowerCase().includes('washroom')) return true;
      if (detailCategory === 'food' && key.toLowerCase().includes('food')) return true;
      if (detailCategory === 'merch' && key.toLowerCase().includes('merch')) return true;
      return false; // Very basic mock filter
    });

    return (
      <View style={styles.fullScreenView}>
        <Text style={styles.detailsHeader}>{detailCategory.toUpperCase()} INFO</Text>
        
        <View style={styles.card}>
          <Text style={styles.cardHeader}>📍 Nearby {detailCategory}</Text>
          {filteredQueues.length === 0 ? (
            <Text style={styles.subtext}>No wait times tracked nearest to you right now.</Text>
          ) : (
            filteredQueues.map(([key, time]) => (
              <View key={key} style={styles.queueRow}>
                <Text style={styles.queueAttr}>{key.toUpperCase()}</Text>
                <Text style={[styles.queueVal, time > 10 ? styles.bad : styles.good]}>{time} mins</Text>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.btnSecondary} onPress={() => setActiveView('dashboard')}>
          <Text style={styles.btnTextSec}>Close Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nexus Attendee</Text>
        <View style={styles.statusDot} />
      </View>

      {activeView === 'dashboard' && renderDashboard()}
      {activeView === 'map' && renderMap()}
      {activeView === 'details' && renderDetails()}
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#1e293b' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#f8fafc' },
  statusDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981' },
  scroll: { padding: 16 },
  
  sectionTitle: { fontSize: 18, fontWeight: '600', color: 'white', marginBottom: 12, marginTop: 10 },
  iconGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  iconBtn: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16, alignItems: 'center', width: '23%' },
  iconEmoji: { fontSize: 28, marginBottom: 8 },
  iconText: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' },
  
  card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 16, marginBottom: 16 },
  cardHeader: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 16 },
  subtext: { color: '#94a3b8' },
  
  queueRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  queueAttr: { color: '#cbd5e1', fontSize: 16 },
  queueVal: { fontSize: 16, fontWeight: 'bold' },
  good: { color: '#10b981' },
  bad: { color: '#ef4444' },
  
  alertBox: (risk) => ({
    padding: 12, borderRadius: 8, marginTop: 8,
    backgroundColor: risk === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1, borderColor: risk === 'high' ? '#ef4444' : '#10b981',
  }),
  alertText: { color: 'white', marginTop: 4, fontWeight: '500' },

  fullScreenView: { padding: 20, flex: 1 },
  detailsHeader: { fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 20 },
  
  mapSatelliteMock: { 
    flex: 1, backgroundColor: '#020617', borderRadius: 24, marginBottom: 20, 
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    borderWidth: 1, borderColor: '#3b82f6'
  },
  mapGrid: { position: 'absolute', width: '200%', height: '200%', borderTopWidth: 2, borderLeftWidth: 2, borderColor: 'rgba(59, 130, 246, 0.1)' },
  mapSatelliteTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  poiDot: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },

  btnPrimary: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnSecondary: { backgroundColor: 'transparent', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#3b82f6' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  btnTextSec: { color: '#3b82f6', fontWeight: 'bold', fontSize: 16 }
});
