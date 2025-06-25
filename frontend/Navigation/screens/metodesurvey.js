import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function MetodeSurvey({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pilih Jenis Survey</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SurveyPage')}
      >
        <Image source={require('../assets/icons/bangunan.png')} style={{ width: 200, height: 200 }} />
        <Text style={styles.buttonText}>Survey Bangunan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SurveySaluran')}
      >
        <Image source={require('../assets/icons/saluran.jpeg')} style={{ width: 200, height: 200 }} />
        <Text style={styles.buttonText}>Survey Saluran</Text>
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
    marginBottom: 20,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
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
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
});