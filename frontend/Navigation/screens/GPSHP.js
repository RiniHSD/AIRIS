import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  ScrollView,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { WebView } from 'react-native-webview';
import { useDispatch } from 'react-redux';
import { setStreamData } from '../config/streamSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GPSHP() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    altitude: null,
    accuracy: null,
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const streamInterval = useRef(null);
  
  const webViewRef = useRef(null);
  const dispatch = useDispatch();

  // Fungsi untuk mendapatkan lokasi
  const getLocation = () => {
    Geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          altitude: pos.coords.altitude,
          accuracy: pos.coords.accuracy,
          timestamp: new Date(pos.timestamp).toLocaleTimeString(),
        };
        
        // Update state lokal
        setLocation(coords);
        
        // Kirim ke Redux store
        dispatch(setStreamData({ 
          streamId: 'INTERNAL', 
          data: coords 
        }));
        
        // Simpan ke AsyncStorage
        await AsyncStorage.setItem('internal_coords', JSON.stringify(coords));
        
        console.log('[GPSHP] Koordinat internal diperbarui:', coords);
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 } // maximumAge: 0 untuk menghindari cache
    );
  };

  // Fungsi untuk memulai streaming
  const startStreaming = () => {
    if (!isStreaming) {
      console.log('[DEBUG] Memulai streaming lokasi...');
      
      // Jalankan segera pertama kali
      getLocation();
      
      // Set interval setiap 3 detik
      streamInterval.current = setInterval(() => {
        console.log('[DEBUG] Interval 3 detik - mengambil lokasi...');
        getLocation();
      }, 3000);
      
      setIsStreaming(true);
      console.log('[DEBUG] Status streaming: AKTIF');
    } else {
      console.log('[DEBUG] Streaming sudah aktif, tidak perlu memulai lagi');
    }
  };

  // Fungsi untuk menghentikan streaming
  const stopStreaming = () => {
    if (isStreaming) {
      console.log('[DEBUG] Menghentikan streaming lokasi...');
      clearInterval(streamInterval.current);
      setIsStreaming(false);
      console.log('[DEBUG] Status streaming: NON-AKTIF');
    } else {
      console.log('[DEBUG] Streaming tidak aktif, tidak ada yang dihentikan');
    }
  };

  // Membersihkan interval saat komponen unmount
  useEffect(() => {
    return () => {
      if (streamInterval.current) {
        console.log('[DEBUG] Membersihkan interval sebelum komponen unmount');
        clearInterval(streamInterval.current);
      }
    };
  }, []);

  // Meminta izin lokasi saat komponen mount
  useEffect(() => {
    console.log('[DEBUG] Komponen GPSHP mounted');
    
    const startUp = async () => {
      if (Platform.OS === 'android') {
        console.log('[DEBUG] Meminta izin lokasi untuk Android...');
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('[DEBUG] Izin lokasi diberikan');
          } else {
            console.warn('[WARNING] Izin lokasi ditolak');
          }
        } catch (err) {
          console.error('[ERROR] Gagal meminta izin lokasi:', err);
        }
      }
      
      console.log('[DEBUG] Mengambil lokasi awal...');
      getLocation();
    };

    startUp();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>📍 Lokasi dari HP</Text>
        <Text>Latitude: {location.latitude !== null ? location.latitude.toFixed(10) : 'Memuat...'}</Text>
        <Text>Longitude: {location.longitude !== null ? location.longitude.toFixed(10) : 'Memuat...'}</Text>
        <Text>Altitude : {location.altitude != null ? location.altitude.toFixed(2) + ' m' : '-'}</Text>
        <Text>Akurasi : {location.accuracy != null ? location.accuracy.toFixed(2) + ' m' : '-'}</Text>
        <Text>Terakhir Update: {location.timestamp || '-'}</Text>
        <Text>Status Streaming: {isStreaming ? 'AKTIF' : 'NON-AKTIF'}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.scanButton, isStreaming ? styles.disabledButton : styles.activeButton]}
            onPress={startStreaming}
            disabled={isStreaming}
          >
            <Text style={styles.scanButtonText}>Mulai Streaming</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.scanButton, !isStreaming ? styles.disabledButton : styles.stopButton]}
            onPress={stopStreaming}
            disabled={!isStreaming}
          >
            <Text style={styles.scanButtonText}>Hentikan Streaming</Text>
          </TouchableOpacity>
        </View>
        <Text>Proses membutuhkan waktu beberapa menit untuk perangkat dapat menerima lokasi.</Text>
      </View>

      <View style={{ height: 430, marginVertical: 10 }}>
        <WebView
          ref={webViewRef}
          source={{ uri: 'https://rinihsd.github.io/WebView-AIRIS/peta_tools.html' }}
          onLoadStart={() => console.log('[DEBUG] WebView mulai memuat...')}
          onLoadEnd={() => console.log('[DEBUG] WebView selesai memuat')}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('[ERROR] WebView error:', nativeEvent);
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  box: {
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  scanButton: {
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: '#0daaf0',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  scanButtonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
});