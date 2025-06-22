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

// Kode asli disembunyikan karena bersifat proprietary. Hubungi developer untuk informasi lebih lanjut

export {
  // Kode asli disembunyikan karena bersifat proprietary. Hubungi developer untuk informasi lebih lanjut
};
