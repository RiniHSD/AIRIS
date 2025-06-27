import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/url';
import { PermissionsAndroid, Platform } from 'react-native';

export default function MapPage() {
  const [userInfo, setUserInfo] = useState({
    nama_irigasi: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        console.log('USER ID:', userId);

        const res = await fetch(`${BASE_URL}/auth/user/${userId}`);

        if (!res.ok) {
          console.log('Status:', res.status);
          throw new Error('Gagal mengambil data pengguna');
        }

        const data = await res.json();
        console.log('DATA DARI SERVER:', data);

        setUserInfo({
          nama_irigasi: data.nama_irigasi,
        });
      } catch (error) {
        console.error('GAGAL FETCH USER:', error.message);
        Alert.alert('Error', 'Tidak bisa mengambil data pengguna');
      }
    };

    fetchUser();
  }, []);


  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Peta Jaringan Irigasi</Text>
        <Text style={styles.label}>Daerah Irigasi {userInfo.nama_irigasi}</Text>
      </View>

      <View style={styles.containerMap}>
        <WebView
          source={{ uri: 'https://rinihsd.github.io/WebView-AIRIS/peta.html' }}
          style={styles.webView}
        />
      </View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  formGroup: {
    margin: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    width: '95%',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  webView: {
    flex: 1,
  },
  containerMap: {
    height: 650,
    width: '95%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
});