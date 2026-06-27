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
  // MMKV is synchronous — read profile on first render, no null state needed
  const [hasProfile, setHasProfile] = useState(() => getProfile() !== null);

  // Poll in both directions: onboarding → main (profile saved) and main → onboarding (profile cleared)
  useEffect(() => {
    const interval = setInterval(() => {
      const exists = getProfile() !== null;
      if (exists !== hasProfile) setHasProfile(exists);
    }, 500);
    return () => clearInterval(interval);
  }, [hasProfile]);

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
