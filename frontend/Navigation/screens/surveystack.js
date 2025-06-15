import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SurveyPage from './survey';

const Stack = createNativeStackNavigator();

export default function SurveyStack() {
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
      <Stack.Screen name="SurveyPage" component={SurveyPage} options={{ title: 'ADD DATA' }} />
    </Stack.Navigator>
  );
}
