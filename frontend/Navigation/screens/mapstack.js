import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapPage from './map';

const Stack = createNativeStackNavigator();

export default function MapStack() {
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
      <Stack.Screen name="MapPage" component={MapPage} options={{ title: 'HALAMAN PETA' }} />
    </Stack.Navigator>
  );
}
