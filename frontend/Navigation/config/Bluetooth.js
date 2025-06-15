import React, {useEffect, useState} from 'react';
import {Buffer} from 'buffer';
import TcpSocket from 'react-native-tcp-socket';
import currentDate from '../Helpers/curren_date.js';
import NtripClient from 'react-native-ntrip-client';
import {useDispatch, useSelector} from 'react-redux';
import {PermissionsAndroid, Platform, Alert} from 'react-native';
import RNBluetoothClassic from 'react-native-bluetooth-classic';
import AsyncStorageHelper from '../Helpers/asyncLocalStorage.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setStreamData,
  clearStreamData,
  clearAllStreams,
} from '../config/streamSlice.js';

const SearchDevice = async () => {
  // Kode asli disembunyikan karena bersifat proprietary. Hubungi developer untuk informasi lebih lanjut.
};

const requestAccessFineLocationPermission = async () => {
  // Kode asli disembunyikan karena bersifat proprietary. Hubungi developer untuk informasi lebih lanjut.
};

const ConnectDevice = async (data, dispach) => {
  // Kode asli disembunyikan karena bersifat proprietary. Hubungi developer untuk informasi lebih lanjut.
};

const ReadingData = async (device, dispach) => {
  // Kode asli disembunyikan karena bersifat proprietary. Hubungi developer untuk informasi lebih lanjut.
};

const writingData = async (device) => {
  console.log('Jalankan NTRIP');
  try {
    const host = 'nrtk.big.go.id';
    const port = '2001';
    const username = 'xxxxxxx';
    const password = 'xxxxxxx'; // data bersifat kredensial, hubungi developer
    const mountpoint = 'max-rtcm3';
    const perintah2 =
          "*cors," +
          host +
          "," +
          port +
          "," +
          username +
          "," +
          password +
          "," +
          mountpoint +
          ",\n";
    device.write(perintah2,null,handleError()
    );

    setTimeout(() => {
      var perintah = "ntrip\n";
      device.write(perintah);
    }, 1000);
  } catch (error) {
    console.log('error ntrip ', error);
  }
};

const connectWifiReq = async (data) => {
  // console.log(data);
  const getDevices = await AsyncStorageHelper.getItem('data_device');
  const deviceConnect = JSON.parse(getDevices);
  const device = await RNBluetoothClassic.connectToDevice(deviceConnect.id);
  var perintah = '*wifi,' + data.ssid + ',' + data.password + ',\n';
  console.log(perintah);
  device.write(perintah, null,handleError());
  setTimeout(() => {
    writingData(device);
  }, 5000);
};

const handleError = async (err) => {
  console.log(err);
}

// Komponen untuk memutuskan perangkat Bluetooth
const DisconnectedDevice = async (dispatch) => {
  const connectedDevice = await AsyncStorageHelper.getItem('data_device');
  const getDevice = JSON.parse(connectedDevice);
  if (getDevice.id) {
    try {
      const response = await RNBluetoothClassic.disconnectFromDevice(
        getDevice.id,
      );
      if (response) {
        await AsyncStorageHelper.removeItem('data_device');
        dispatch(clearAllStreams());
      }
    } catch (error) {
      console.error('Disconnection error:', error);
      // Alert.alert('Disconnection error', 'An error occurred while disconnecting.');
    }
  }
};

const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    const permissions = [];

    if (Platform.Version >= 31) {
      // Android 12+
      permissions.push(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
    } else {
      // Android 10 ke bawah
      permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    }

    try {
      const granted = await PermissionsAndroid.requestMultiple(permissions);

      const isGranted = Object.values(granted).every(
        (result) => result === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!isGranted) {
        Alert.alert(
          'Permissions Required',
          'Please grant all permissions in settings to use Bluetooth.'
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error requesting Bluetooth permissions:', err);
      return false;
    }
  }
  return true;
};


// Komponen untuk memeriksa ketersediaan Bluetooth
const CheckAvailable = async () => {
  const permissionsGranted = await requestPermissions();
  if (!permissionsGranted) {
    return false; // Stop execution if permissions are not granted
  }

  try {
    const available = await RNBluetoothClassic.isBluetoothAvailable();
    if (!available) {
      console.warn('Bluetooth is not available on this device.');
      return false;
    }

    const enabled = await RNBluetoothClassic.isBluetoothEnabled();
    if (!enabled) {
      await RNBluetoothClassic.requestBluetoothEnabled();
    } else {
      console.log('Bluetooth is already enabled.');
      return true;
    }
  } catch (err) {
    console.error('Error initializing Bluetooth:', err);
    return false;
  }

  return false;
};

const showdevicePair = async () => {
  try {
    const listDevice = await RNBluetoothClassic.getBondedDevices();
    return listDevice;
  } catch (error) {
    console.log('error', error);
    return null;
  }
};

export {
  SearchDevice,
  ConnectDevice,
  DisconnectedDevice,
  CheckAvailable,
  showdevicePair,
  writingData,
  connectWifiReq,
};
