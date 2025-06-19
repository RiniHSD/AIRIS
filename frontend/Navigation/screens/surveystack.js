import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MetodeSurvey from './metodesurvey';
import SurveyPage from './survey';
import SurveySaluran from './surveysaluran';

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
      <Stack.Screen name="MetodeSurvey" component={MetodeSurvey} options={{ title: 'SURVEY' }} />
      <Stack.Screen name="SurveyPage" component={SurveyPage} options={{ title: 'SURVEY BANGUNAN' }} />
      <Stack.Screen name="SurveySaluran" component={SurveySaluran} options={{ title: 'SURVEY SALURAN' }} />
    </Stack.Navigator>
  );
}
