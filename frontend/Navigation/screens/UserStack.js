import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AccountPage from './account';
import FaQ from './FaQ';

const Stack = createNativeStackNavigator();

export default function UserStack({ onLogout }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true,headerStyle: {
        backgroundColor: '#0daaf0'
      }, headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        color: '#fff'
      },
      headerTitleAlign: 'center',
      }}>
      <Stack.Screen name="PROFIL PENGGUNA">
        {(props) => <AccountPage {...props} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen name="FaQ" component={FaQ} options={{ title: 'PETUNJUK APLIKASI' }} />
    </Stack.Navigator>
  );
}
