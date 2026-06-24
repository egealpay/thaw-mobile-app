import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getProfile } from '../storage/mmkv';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { SessionNavigator } from './SessionNavigator';
import { SettingsEditNavigator } from './SettingsEditNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    const profile = getProfile();
    setHasProfile(profile !== null);
  }, []);

  // Re-check whenever the navigator refocuses
  // (profile is written synchronously in FirstSessionScreen)
  useEffect(() => {
    const interval = setInterval(() => {
      const profile = getProfile();
      if (profile && !hasProfile) setHasProfile(true);
    }, 500);
    return () => clearInterval(interval);
  }, [hasProfile]);

  if (hasProfile === null) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasProfile ? (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
      )}
      <Stack.Screen
        name="Session"
        component={SessionNavigator}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name="SettingsEdit"
        component={SettingsEditNavigator}
      />
    </Stack.Navigator>
  );
}
