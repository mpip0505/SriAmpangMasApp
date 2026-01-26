import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import ResidentHomeScreen from '../screens/resident/ResidentHomeScreen';
import RegisterVisitorScreen from '../screens/resident/RegisterVisitorScreen';
import VisitorDetailsScreen from '../screens/resident/VisitorDetailsScreen';
import GuardHomeScreen from '../screens/guard/GuardHomeScreen';
import ScanQRScreen from '../screens/guard/ScanQRScreen';
import ManualQRScreen from '../screens/guard/ManualQRScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : user.role === 'resident' ? (
        <>
          <Stack.Screen name="ResidentHome" component={ResidentHomeScreen} />
          <Stack.Screen name="RegisterVisitor" component={RegisterVisitorScreen} />
          <Stack.Screen name="VisitorDetails" component={VisitorDetailsScreen} />
        </>
      ) : user.role === 'guard' ? (
        <>
          <Stack.Screen name="GuardHome" component={GuardHomeScreen} />
          <Stack.Screen name="ScanQR" component={ScanQRScreen} />
          <Stack.Screen name="ManualQR" component={ManualQRScreen} />
        </>
      ) : null}
    </Stack.Navigator>
  );
}