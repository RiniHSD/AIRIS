import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import Geolocation from 'react-native-geolocation-service';
import { WebView } from 'react-native-webview';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

export default function GPSPage() {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [scanning, setScanning] = useState(false);

  const webViewRef = useRef(null);

  useEffect(() => {
    const startUp = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
      }
      getLocation();
    };

    startUp();
  }, []);
  

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (pos) => {
        const coords = pos.coords;
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true, timeout: 20000 }
    );
  };
  
  
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>
          Bluetooth Device
        </Text>
        <Text style={styles.paragraph}>
          Make sure the device you want to connect to is in pairing mode and that your phone’s
          Bluetooth is turned on. Once the device appears in the list below, tap to connect and
          ensure you stay nearby for a stable connection.
        </Text>
      </View>

      <View style={styles.gpsBox}>
        <Text style={styles.label}>📍 Lokasi dari HP:</Text>
        <Text>Lat: {location.latitude}</Text>
        <Text>Lon: {location.longitude}</Text>
      </View>
    </View>

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
  title: { fontWeight: 'bold', fontSize: 16 },
  stopText: { color: '#0daaf0', fontWeight: 'bold' },
  paragraph: { fontSize: 12, marginTop: 5 },
  sectionTitle: { fontWeight: 'bold', marginVertical: 5 },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
  },
});
