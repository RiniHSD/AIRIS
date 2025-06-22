import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function MetodeSurvey({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Survey Jaringan Irigasi</Text>
        <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SurveyPage')}
        >
        <Image source={require('../assets/icons/bangunan.png')} style={{ width: 200, height: 200 }} />
        <Text style={styles.buttonText}>Survey Bangunan Irigasi</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MetodeSaluran')}
        >
        <Image source={require('../assets/icons/saluran.jpeg')} style={{ width: 210, height: 210 }} />
        <Text style={styles.buttonText}>Survey Saluran Irigasi</Text>
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
