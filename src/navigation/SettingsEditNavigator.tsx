import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EditSubjectScreen } from '../screens/main/settings/EditSubjectScreen';
import { EditDeadlineScreen } from '../screens/main/settings/EditDeadlineScreen';
import { EditBlockSizeScreen } from '../screens/main/settings/EditBlockSizeScreen';
import { EditIceStyleScreen } from '../screens/main/settings/EditIceStyleScreen';
import { EditDailyGoalScreen } from '../screens/main/settings/EditDailyGoalScreen';
import { EditStudyDaysScreen } from '../screens/main/settings/EditStudyDaysScreen';
import type { SettingsEditParamList } from './types';

const Stack = createNativeStackNavigator<SettingsEditParamList>();

export function SettingsEditNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="EditSubject" component={EditSubjectScreen} />
      <Stack.Screen name="EditDeadline" component={EditDeadlineScreen} />
      <Stack.Screen name="EditBlockSize" component={EditBlockSizeScreen} />
      <Stack.Screen name="EditIceStyle" component={EditIceStyleScreen} />
      <Stack.Screen name="EditDailyGoal" component={EditDailyGoalScreen} />
      <Stack.Screen name="EditStudyDays" component={EditStudyDaysScreen} />
    </Stack.Navigator>
  );
}
