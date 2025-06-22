import React, {useEffect, useState, useRef, Suspense, Switch} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {CoordinateConverter, conferalt, parseCoordinates} from '../Helpers/geo_helpers.js';
import AsyncStorageHelper from '../Helpers/asyncLocalStorage.js';
import currentDate from '../Helpers/curren_date.js';
import {Provider} from 'react-redux';
import {
  SearchDevice,
  ConnectDevice,
  DisconnectedDevice,
  CheckAvailable,
  showdevicePair,
  writingData,
} from '../config/Bluetooth.js';
import {
  View,
  Text,
  Button,
  FlatList,
  ScrollView,
  PermissionsAndroid,
  Platform,
  Alert,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import {WebView} from 'react-native-webview';
import LoadingScreen from '../component/loading';
import NtripClientReq from '../Helpers/NtripClientReq.js';
import MapView, {Marker} from 'react-native-maps';
import {Buffer} from 'buffer';
import TcpSocket from 'react-native-tcp-socket';
import { extractGGAInfo } from '../Helpers/geo_helpers.js';


const App = ({navigation}) => {
  const dispatch = useDispatch();
  const webViewRef = useRef(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [bluetoothReady, setbluetoothReady] = useState(false);
  const [pairedDevices, setPairedDevices] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState({});
  const [log, setLog] = useState([]);
  const [scanning, setScanning] = useState(false);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [connectionNtrip, setConnectionNtrip] = useState(false);
  const [StatusNtrip, setStatusNtrip] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  const [altitude, setAltitude] = useState(null);
  const [hdop, setHdop] = useState(null);


  const scrollRef = useRef(null);
  const streamDataGNGGA = useSelector(
    state => state.streamData.streams['GNGGA'],
  );
  const streamDataGNGST = useSelector(
    state => state.streamData.streams['GNGST'],
  );
  const addLog = message => {
    setLog(prevLog => {
      const updatedLog = [...prevLog, message];

      // Ganti timeout untuk memastikan update state selesai
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollToEnd({animated: true});
        }
      }, 100);

      return updatedLog;
    });
  };
  const addPairedDevice = (newDevice) => {
    setPairedDevices(prevDevices => [...prevDevices, newDevice]);
  };
  useEffect(() => {
    const initializing = async () => {
      const isAvailable = await CheckAvailable();
      if (isAvailable) {
        setbluetoothReady(true);
        const devices = await showdevicePair();
        setPairedDevices(devices);
      }
    };
    initializing();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (streamDataGNGGA && streamDataGNGST) {
        if (connectedDevice == null) {
          const getDevices = await AsyncStorageHelper.getItem('data_device');
          const deviceConnect = JSON.parse(getDevices);
          setConnectedDevice(deviceConnect);
        }
      }
    };
    fetchData();
  }, [streamDataGNGGA, streamDataGNGST, connectedDevice, connectionNtrip]);

  useEffect(() => {
  if (streamDataGNGGA) {
    const parsingLonLat = CoordinateConverter(streamDataGNGGA);
    const { altitude, hdop } = extractGGAInfo(streamDataGNGGA);

    setLatitude(parsingLonLat.latitude ?? 0);
    setLongitude(parsingLonLat.longitude ?? 0);
    setAltitude(altitude ?? 0);
    setHdop(hdop ?? 0);

    addLog(streamDataGNGGA + '\n');
  }
}, [streamDataGNGGA]);


  useEffect(() => {
  }, [streamDataGNGGA, connectionNtrip, StatusNtrip]);

  useEffect(() => {
    if (!isMonitoring) {
      setConnectedDevice(null);
      setLatitude(null);
      setLongitude(null);
    }
  }, [isMonitoring]);

  const RequestScan = async () => {
    setbluetoothReady(true);
    try {
      window.alert('Memulai Pemindaian Perangkat Bluetooth...');
      const searchDevices = await SearchDevice();
      if(!searchDevices.error){
        addPairedDevice(searchDevices);
      }
    } catch (error) {
      window.alert('Error during Bluetooth device search: ' + error);
    }
  };

  const Disconnected = async () => {
    try {
      const getDevices = await AsyncStorageHelper.getItem('data_device');
      if (getDevices) {
        const reqDisconect = await DisconnectedDevice(dispatch);
        setLatitude(null);
        setLongitude(null);
        setConnectedDevice(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWifi = async () => {
    navigation.navigate('ConnectNTRIP');
  }
  
  const ReqConnect = async data => {
    const responseData = await ConnectDevice(data, dispatch);
  };

  return (
    <View
        style={styles.container}
        contentContainerStyle={{flexGrow: 1}}
        nestedScrollEnabled={true}>
        {bluetoothReady ? (
        <View style={styles.container}>
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.smallButton} onPress={RequestScan}>
                    <Text style={styles.smallButtonText}>Pindai Perangkat</Text>
                </TouchableOpacity>
                {connectedDevice && (
                <TouchableOpacity style={styles.smallButton1} onPress={Disconnected}>
                <Text style={styles.smallButtonText}>Putuskan</Text>
                </TouchableOpacity>
                )}
            </View>

            <Text style={styles.sectionTitle}>Alat yang terdeteksi:</Text>
            <View style={styles.card}>
            <FlatList
                data={pairedDevices}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                <View style={styles.deviceRow}>
                    <Text style={styles.deviceText}>{item.name || item.id}</Text>
                    <TouchableOpacity
                    style={connectedDevice?.address === item.address ? styles.buttonDisconnect1 : styles.buttonConnect}
                    onPress={() => ReqConnect(item)}>
                    <Text style={styles.connectText}>Hubungkan</Text>
                    </TouchableOpacity>
                </View>
                )}
            />
        </View>

        {connectedDevice && (
          <TouchableOpacity
            onPress={connectWifi}
            style={{
              backgroundColor: '#17a325',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Hubungkan Wi-Fi</Text>
          </TouchableOpacity>
        )}


        <View style={styles.gpsContainer}>
            <View style={styles.gpsRow}>
                <Text style={styles.label}>Latitude</Text>
                <Text style={styles.value}>{latitude !== null ? latitude : 'Memuat...'}</Text>
            </View>
            <View style={styles.gpsRow}>
                <Text style={styles.label}>Longitude</Text>
                <Text style={styles.value}>{longitude !== null ? longitude : 'Memuat...'}</Text>
            </View>
            <View style={styles.gpsRow}>
                <Text style={styles.label}>Altitude</Text>
                <Text style={styles.value}>{altitude !== null ? `${altitude} m` : 'Memuat...'}</Text>
            </View>
            <View style={styles.gpsRow}>
                <Text style={styles.label}>Akurasi</Text>
                <Text style={styles.value}>{hdop !== null ? hdop : 'Memuat...'}</Text>
            </View>
        </View>

        <View style={styles.containerMap}>
            <WebView
            source={{ uri: 'https://rinihsd.github.io/WebView-AIRIS/peta_tools.html' }}
            style={styles.webView}
            />
        </View>
        </View>
    ) : (
        <LoadingScreen />
    )}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  smallButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',  
  },
  smallButton1: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',  
  },
  smallButtonText : {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    marginLeft: 2,  
  },
  card: {
    padding: 10,
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', 
  },
  deviceText: {
    fontSize: 14,
    flex: 1,  
  },
  buttonConnect: {
    backgroundColor: '#03A9F4',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  buttonDisconnect: {
    backgroundColor: '#f44336',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  buttonDisconnect1: {
    backgroundColor: '#17a325',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  connectText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  containerMap: {
    height: "30%",
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
  },
  webView: {
    flex: 1,
  },
  logScroll: {
    flex: 1,
  },
  buttonsurvey: {
    paddingHorizontal: 1,
    margin: 1,
    backgroundColor: '#0daaf0',
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Alkalami-Regular',
    textAlign: 'center',
  },
  gpsContainer: {
    marginTop: 20,
    backgroundColor: '#f2f2f2',
    padding: 10,
  },
  gpsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  label: {
    color: '#333',
    fontWeight: 'bold',
  },
  value: {
    color: '#0daaf0',
    fontWeight: 'bold',
  },
});
