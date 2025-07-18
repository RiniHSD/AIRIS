import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function MetodeSaluran({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Survey Saluran Irigasi</Text>
        <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SurveySaluranGNSS')}
        >
        <Image source={require('../assets/icons/presisi.jpeg')} style={{ width: 200, height: 200 }} />
        <Text style={styles.buttonText}>Menggunakan GNSS Geodetik</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SurveySaluranHP')}
        >
        <Image source={require('../assets/icons/nonpresisi.jpeg')} style={{ width: 210, height: 210 }} />
        <Text style={styles.buttonText}>Menggunakan Posisi Internal HandPhone</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ebf4fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
  },
});
