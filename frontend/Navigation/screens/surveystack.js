import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MetodeSurvey from './metodesurvey';
import SurveyPage from './survey';
import SurveySaluranGNSS from './surveysaluran';
import SurveySaluranHP from './surveysaluranhp';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

function SurveySaluranTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { 
          fontSize: 12,
          fontWeight: 'bold'
        },
        tabBarIndicatorStyle: { 
          backgroundColor: '#0daaf0' 
        },
        tabBarStyle: { 
          backgroundColor: '#fff' 
        }
      }}
    >
      <Tab.Screen 
        name="SurveySaluranGNSS" 
        component={SurveySaluranGNSS} 
        options={{ tabBarLabel: 'GPS Geodetik' }} 
      />
      <Tab.Screen 
        name="SurveySaluranHP" 
        component={SurveySaluranHP} 
        options={{ tabBarLabel: 'GPS HP' }} 
      />
    </Tab.Navigator>
  );
}

export default function SurveyStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0daaf0'
        }, 
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#fff'
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="MetodeSurvey" component={MetodeSurvey} options={{ title: 'SURVEY' }} />
      <Stack.Screen name="SurveyPage" component={SurveyPage} options={{ title: 'SURVEY BANGUNAN' }} />
      <Stack.Screen 
        name="SurveySaluran" 
        component={SurveySaluranTabs} 
        options={{ title: 'SURVEY SALURAN' }} 
      />
    </Stack.Navigator>
  );
}