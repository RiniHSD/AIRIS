import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { selectStreamData } from '../config/streamSlice';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

const SurveySaluranHP = () => {
  // Gunakan data dari stream INTERNAL (GPS HP)
  const streamDataINTERNAL = useSelector(state => selectStreamData(state, 'INTERNAL'));
  const webViewRef = useRef(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [trackPoints, setTrackPoints] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [distance, setDistance] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [lastRecordedPosition, setLastRecordedPosition] = useState(null);
  
  const [duration, setDuration] = useState('00:00:00');
  const [recordingStatus, setRecordingStatus] = useState('Belum mulai');
  const [mapLoaded, setMapLoaded] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      tabBarLabel: 'GPS HP' // Atau 'GPS HP' untuk file surveysaluranhp.js
    });
  }, [navigation]);

  // Efek untuk mengupdate durasi rekaman
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        const now = moment();
        const diff = moment.duration(now.diff(startTime));
        setDuration(
          `${diff.hours().toString().padStart(2, '0')}:` +
          `${diff.minutes().toString().padStart(2, '0')}:` +
          `${diff.seconds().toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, startTime]);

  // Ketika ada data GPS baru dan sedang merekam
  useEffect(() => {
    if (streamDataINTERNAL && isRecording && mapLoaded) {
      const coords = streamDataINTERNAL;
      
      if (coords && coords.latitude && coords.longitude) {
        const newPoint = {
          lat: parseFloat(coords.latitude),
          lng: parseFloat(coords.longitude),
          timestamp: new Date(),
        };
        
        setCurrentPosition(newPoint);
        
        // Langsung rekam tanpa interval tambahan
        if (lastRecordedPosition) {
          const newDistance = calculateDistance(
            lastRecordedPosition.lat,
            lastRecordedPosition.lng,
            newPoint.lat,
            newPoint.lng
          );
          setDistance(prev => prev + newDistance);
        }
        
        // Tambahkan titik baru
        const updatedPoints = [...trackPoints, newPoint];
        setTrackPoints(updatedPoints);
        
        // Kirim titik ke WebView
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            try {
              const point = ${JSON.stringify(newPoint)};
              points.push([point.lat, point.lng]);
              polyline.setLatLngs(points);
              map.panTo([point.lat, point.lng]);
              
              if (currentMarker) {
                map.removeLayer(currentMarker);
              }
              currentMarker = L.marker([point.lat, point.lng], {
                icon: L.divIcon({
                  html: '<div style="background-color:green;width:16px;height:16px;border-radius:50%;border:3px solid white;"></div>',
                  className: '',
                  iconSize: [22, 22]
                })
              }).addTo(map);
              
              if (points.length === 1) {
                if (startMarker) map.removeLayer(startMarker);
                startMarker = L.marker([point.lat, point.lng], {
                  icon: L.divIcon({
                    html: '<div style="background-color:blue;width:16px;height:16px;border-radius:50%;border:3px solid white;"></div>',
                    className: '',
                    iconSize: [12, 12]
                  })
                }).addTo(map);
                startMarker.bindPopup('Titik Awal').openPopup();
              }
            } catch (error) {
              window.ReactNativeWebView.postMessage('Error: ' + error.message);
            }
          `);
        }
        
        // Simpan posisi terakhir yang direkam
        setLastRecordedPosition(newPoint);
      }
    }
  }, [streamDataINTERNAL, isRecording, mapLoaded]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius bumi dalam meter
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Jarak dalam meter
  };

  const startRecording = () => {
    setIsRecording(true);
    setStartTime(new Date());
    setEndTime(null);
    setDistance(0);
    setTrackPoints([]);
    setLastRecordedPosition(null);
    setRecordingStatus('Sedang merekam...');
    
    // Kirim perintah reset ke WebView
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'RESET'
      }));
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setEndTime(new Date());
    setRecordingStatus('Rekaman selesai');
  };

  const downloadData = async () => {
    if (trackPoints.length === 0) {
      Alert.alert('Tidak ada data', 'Tidak ada data trek yang direkam');
      return;
    }
  
    // Format data sebagai GeoJSON
    const coordinates = trackPoints.map(point => [point.lng, point.lat]);
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            start_time: startTime.toISOString(),
            end_time: endTime ? endTime.toISOString() : new Date().toISOString(),
            distance: distance,
            duration: duration,
            point_count: trackPoints.length
          },
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      ]
    };
  
    // Nama file
    const fileName = `track_hp_${moment().format('YYYYMMDD_HHmmss')}.geojson`;
    
    // Path file
    let filePath = '';
    
    if (Platform.OS === 'android') {
      filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
    } else {
      filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
    }
  
    try {
      // Simpan file
      await RNFS.writeFile(filePath, JSON.stringify(geojson), 'utf8');
      
      // Tampilkan konfirmasi
      Alert.alert(
        'Berhasil Disimpan',
        `File tersimpan di: ${filePath}`,
        [
          { text: 'OK' }
        ]
      );
    } catch (error) {
      console.error('Error menyimpan file:', error);
      Alert.alert('Error', `Gagal menyimpan file: ${error.message}`);
    }
  };

  // HTML untuk WebView
  const generateMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Leaflet Map</title>
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body, html { margin:0; padding:0; height:100%; }
            #map { height:100%; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            let map;
            let polyline;
            let points = [];
            let startMarker;
            let currentMarker;
            
            // Initialize map
            function initMap() {
              map = L.map('map').setView([-7.797068, 110.370529], 15);
              
              // Add base layer
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              }).addTo(map);
              
              // Initialize polyline
              polyline = L.polyline([], { 
                color: '#FF0000', 
                weight: 6,
                opacity: 0.8,
                lineJoin: 'round'
              }).addTo(map);
              
              // Send message to React Native that map is ready
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
            }
            
            // Listen for messages from React Native
            window.addEventListener('message', function(event) {
              try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'ADD_POINT') {
                  const point = data.point;
                  
                  // Tambahkan titik ke array
                  points.push([point.lat, point.lng]);
                  
                  // Update polyline
                  polyline.setLatLngs(points);
                  
                  // Update map view
                  map.panTo([point.lat, point.lng]);
                  
                  // Update current position marker
                  if (currentMarker) {
                    map.removeLayer(currentMarker);
                  }
                  currentMarker = L.marker([point.lat, point.lng], {
                    icon: L.divIcon({
                      html: '<div style="background-color:green;width:16px;height:16px;border-radius:50%;border:3px solid white;"></div>',
                      className: '',
                      iconSize: [22, 22]
                    })
                  }).addTo(map);
                  
                  // Add start marker if this is the first point
                  if (points.length === 1) {
                    if (startMarker) map.removeLayer(startMarker);
                    startMarker = L.marker([point.lat, point.lng], {
                      icon: L.divIcon({
                        html: '<div style="background-color:blue;width:16px;height:16px;border-radius:50%;border:3px solid white;"></div>',
                        className: '',
                        iconSize: [22, 22]
                      })
                    }).addTo(map);
                    startMarker.bindPopup('Titik Awal').openPopup();
                  }
                }
                
                if (data.type === 'RESET') {
                  points = [];
                  polyline.setLatLngs(points);
                  if (startMarker) {
                    map.removeLayer(startMarker);
                    startMarker = null;
                  }
                  if (currentMarker) {
                    map.removeLayer(currentMarker);
                    currentMarker = null;
                  }
                }
              } catch (error) {
                console.error('Error processing message:', error);
              }
            });
            
            // Initialize map when page loads
            window.onload = initMap;
          </script>
        </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      {!mapLoaded && <ActivityIndicator size="large" style={styles.loader} />}
      
      {/* Peta di WebView */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: generateMapHTML() }}
          style={styles.webview}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'MAP_READY') {
                setMapLoaded(true);
              }
            } catch (error) {
              console.error('Error parsing WebView message:', error);
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => <ActivityIndicator size="large" color="#0000ff" />}
        />
      </View>
      
      {/* Kontrol dan informasi dalam ScrollView */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.controls}>
          {!isRecording ? (
            <TouchableOpacity style={styles.recordButton} onPress={startRecording} disabled={!mapLoaded}>
              <Text style={styles.buttonText}>Mulai Rekam</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <Text style={styles.buttonText}>Berhenti</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.downloadButton, trackPoints.length === 0 && styles.disabledButton]} 
            onPress={downloadData}
            disabled={trackPoints.length === 0}
          >
            <Text style={styles.buttonText}>Unduh Data</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Status: {recordingStatus}</Text>
          
          <View style={styles.infoRow}>
            <Text>Waktu Mulai:</Text>
            <Text style={styles.infoValue}>
              {startTime ? moment(startTime).format('DD/MM/YYYY HH:mm:ss') : '-'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text>Waktu Selesai:</Text>
            <Text style={styles.infoValue}>
              {endTime ? moment(endTime).format('DD/MM/YYYY HH:mm:ss') : '-'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text>Durasi:</Text>
            <Text style={styles.infoValue}>{duration}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text>Jarak:</Text>
            <Text style={styles.infoValue}>{distance.toFixed(2)} meter</Text>
          </View>
          
          {/* <View style={styles.infoRow}>
            <Text>Jumlah Titik:</Text>
            <Text style={styles.infoValue}>{trackPoints.length}</Text>
          </View> */}
          
          {/* <View style={styles.infoRow}>
            <Text>Sumber:</Text>
            <Text style={styles.infoValue}>GPS Internal HandPhone</Text>
          </View> */}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoAlert}>Pastikan Anda mengaktifkan fitur streaming koordinat pada halaman GPS Pengukuran Non Presisi</Text>
        </View>
        
        {/* Padding untuk menghindari tab navigasi */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: 350, 
    padding: 10,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 100,
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  webview: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 70, // Sesuaikan dengan tinggi tab navigasi
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
  },
  recordButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  stopButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  downloadButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    margin: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoValue: {
    fontWeight: '600',
    color: '#007AFF',
  },
  infoAlert: {
    fontWeight: '600',
    color: '#FF0000',
  },
  bottomPadding: {
    height: 10,
  },
});

export default SurveySaluranHP;