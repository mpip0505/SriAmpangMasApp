import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import ResidentHomeScreen from '../screens/resident/ResidentHomeScreen';
import GuardHomeScreen from '../screens/guard/GuardHomeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading } = useAuth();
  
    // 1. Handle the "Wait" state
    if (loading) {
      return null; // Or a <SplashScreen />
    }
  
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user === null ? (
          // AUTHENTICATION STACK
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // PROTECTED STACK
          user.role === 'resident' ? (
            <Stack.Group>
              <Stack.Screen name="ResidentHome" component={ResidentHomeScreen} />
              {/* Future Resident screens go here */}
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen name="GuardHome" component={GuardHomeScreen} />
              {/* Future Guard screens go here */}
            </Stack.Group>
          )
        )}
      </Stack.Navigator>
    );
  }