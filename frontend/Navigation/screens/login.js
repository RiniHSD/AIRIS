import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../config/url';

export default function Login({ navigation, onLogin }) {
    const [email, setEmail] = useState ('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
      if (!email || !password) {
          Alert.alert('Error', 'Email dan kata sandi harus diisi.');
          return;
      }
      
      try {
          const response = await fetch(`${BASE_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
          });
  
          const data = await response.json();
          console.log('Respon backend:', data);
  
          if (!response.ok) {
              throw new Error(data.error || 'Login gagal');
          }
  
          await AsyncStorage.setItem('isLoggedIn', 'true');
          await AsyncStorage.setItem('userId', String(data.user.id)); // <- Tambahan di sini
          onLogin(); // panggil fungsi setelah login berhasil (mungkin untuk navigasi ke home)
      } catch (error) {
          console.error('Error saat login:', error);
          Alert.alert('Login Gagal', error.message);
      }
  };
  

    return (
    <View style={styles.container}>
        <Image source={require('../assets/icons/Icon.png')} style={styles.logo} />
        <Text style={styles.title}>AIRIS APP</Text>

    <View style={styles.formContainer}>
        <Text>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan Email"
          placeholderTextColor="#a6a8ab"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text>Kata Sandi</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan Kata Sandi"
          placeholderTextColor="#a6a8ab"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
    </View>

    <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>MASUK</Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Belum punya akun? Daftar</Text>
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee' },
  logo: { width: 100, height: 100, marginBottom: 10 },
  title: { fontWeight: 'bold', fontSize: 20, marginBottom: 20 },
  formContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    color: 'black',
  },
  button: { backgroundColor: '#0daaf0', padding: 15, borderRadius: 10, marginTop: 20, width: '80%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  link: { marginTop: 10, color: '#0daaf0' },
});
