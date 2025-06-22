import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import {connectWifiReq} from '../../config/Bluetooth';
import {useSelector} from 'react-redux';

const ConnectNTRIP = ({navigation}) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [ntripConnected, setNtripConnected] = useState(false);


  // Redux state to monitor GNSSINFO stream
  const ntripstatus = useSelector(
    state => state.streamData.streams['GNSSINFO'],
  );

  // Function to handle WiFi connection
  const connectWifi = async () => {
    if (!ssid || !password) {
      Alert.alert('Input Error', 'SSID and Password must be filled!');
      return;
    }
    const data = {ssid: ssid, password: password};
    setIsConnecting(true); // Set connecting state
    console.log('Connecting to WiFi with:', data);
    await connectWifiReq(data);
  };

  // Monitor NTRIP status and show alert when status is ON
  useEffect(() => {
    if (ntripstatus) {
      const dataSplit = ntripstatus.split(',');
      if (dataSplit.length > 7) {
        const ntripType = dataSplit[5]?.trim();
        const ntripConnection = dataSplit[6]?.trim();
  
        if (ntripType === 'NTRIP' && ntripConnection === 'CONNECTED') {
          setIsConnecting(false);
          setNtripConnected(true);
        } else {
          setNtripConnected(false);
        }
      }
    }
  }, [ntripstatus]);
  

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>INTERNET GNSS</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>SSID</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan SSID"
              placeholderTextColor="#ccc"
              keyboardType="default"
              onChangeText={text => setSsid(text)} 
              value={ssid} 
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan Password"
              placeholderTextColor="#ccc"
              secureTextEntry={true}
              onChangeText={text => setPassword(text)} 
              value={password} 
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={connectWifi} disabled={isConnecting}>
            <Text style={styles.buttonText}>Hubungkan</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 20 }}>
            <Text style={[styles.label, { fontWeight: 'bold' }]}>
              Status NTRIP:{' '}
              <Text style={{ color: ntripConnected ? '#17a325' : '#D91A1A' }}>
                {ntripConnected ? 'Sudah terhubung' : 'Belum terhubung'}
              </Text>
            </Text>
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={styles.ntripInfo}>
              Networked Transport of RTCM via Internet Protocol (NTRIP) adalah sistem koreksi posisi GNSS secara real-time melalui jaringan internet. 
              Dengan NTRIP, koordinat yang diperoleh dari alat GNSS menjadi lebih akurat dan presisi.
            </Text>
            <Text style={styles.ntripInfo}>
              Silahkan beri koneksi internet kepada perangkat GNSS Geodetik dengan menghubungkan WiFi atau Hotspot Mobile Handphone anda.
            </Text>
            <Text style={styles.ntripInfo}>
              Proses membutuhkan waktu beberapa detik, mohon menunggu hingga status NTRIP terhubung.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F2F2F2',
  },
  card: {
    backgroundColor: '#fff',
    height: 650,
    borderRadius: 10,
    padding: 20,
    paddingTop: 1,
    marginTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, 
  },
  title: {
    fontWeight: 'bold',
    fontSize: 28,
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 7,
    marginTop: 17,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    color: '#333',
  },
  button: {
    backgroundColor: '#17a325',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10, 
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#000000',
    fontSize: 16,
  },
  boldText: {
    color: '#D91A1A',
    fontSize: 16,
  },
  ntripInfo: {
    fontSize: 14,
    color: '#555',
    textAlign: 'justify',
    lineHeight: 20,
    marginBottom: 10,
  },  
});

export default ConnectNTRIP;