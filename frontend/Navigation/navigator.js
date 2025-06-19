import React, { useEffect, useState } from 'react';
import { Image, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from './screens/SpashScreen';
import GPSStack from './screens/GPSStack';
import MapStack from './screens/mapstack';
import SurveyStack from './screens/surveystack';
import ListStack from './screens/ListStack';
import UserStack from './screens/UserStack';
import Login from './screens/login';
import Register from './screens/register';
import ConnectNTRIP from './page/Internet/index';
import Titiklokasi from './component/mapBangunan';

const ICONS = {
    GPS: {
      active: require('./assets/icons/gps_active.png'),
      inactive: require('./assets/icons/gps_inactive.png'),
    },
    Map: {
      active: require('./assets/icons/map_active.png'),
      inactive: require('./assets/icons/map_inactive.png'),
    },
    Survey: {
      active: require('./assets/icons/survey_active.png'),
      inactive: require('./assets/icons/survey_inactive.png'),
    },
    List: {
      active: require('./assets/icons/list_active.png'),
      inactive: require('./assets/icons/list_inactive.png'),
    },
    User: {
      active: require('./assets/icons/account_active.png'),
      inactive: require('./assets/icons/account_inactive.png'),
    },
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs({ navigation, onLogout }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    navigation.replace('Login');
  };
  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Image
              source={focused ? ICONS[route.name].active : ICONS[route.name].inactive}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ),
          tabBarStyle: {
            position: 'absolute',
            bottom: 10,
            left: 20,
            right: 20,
            marginHorizontal: 15,
            elevation: 5,
            backgroundColor: '#fff',
            borderRadius: 30,
            height: 60,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.12,
            shadowRadius: 5,
          },
        })}
      >
        <Tab.Screen name="GPS" component={GPSStack} />
        <Tab.Screen name="Survey" component={SurveyStack} />
        <Tab.Screen name="Map" component={MapStack} />
        <Tab.Screen name="List" component={ListStack} />
        <Tab.Screen name="User">
          {(props) => <UserStack {...props} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
  );
}

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // tampil 3 detik
  
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      const value = await AsyncStorage.getItem('isLoggedIn');
      setIsLoggedIn(value === 'true');
      setLoading(false);
    };
    checkLogin();
  }, []);  

  if (showSplash) return <SplashScreen />;
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Login">
              {(props) => <Login {...props} onLogin={() => setIsLoggedIn(true)} />}
            </Stack.Screen>
          </>
        ) : (
          <>
          <Stack.Screen name="MainTabs">
            {(props) => <MainTabs {...props} onLogout={async() => {
              await AsyncStorage.removeItem('isLoggedIn');
              await AsyncStorage.removeItem('user');
              setIsLoggedIn(false);
            }} />}
          </Stack.Screen>
          </>
          
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}