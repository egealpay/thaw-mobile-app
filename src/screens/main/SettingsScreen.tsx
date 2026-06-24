import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsProfileScreen } from './settings/SettingsProfileScreen';
import { DataRemindersScreen } from './settings/DataRemindersScreen';
import type { SettingsStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsProfile" component={SettingsProfileScreen} />
      <Stack.Screen name="DataReminders" component={DataRemindersScreen} />
    </Stack.Navigator>
  );
}
