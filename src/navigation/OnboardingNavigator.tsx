import React, { useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ColdOpenScreen } from '../screens/onboarding/ColdOpenScreen';
import { MiniMeltDemoScreen } from '../screens/onboarding/MiniMeltDemoScreen';
import { PathForkScreen } from '../screens/onboarding/PathForkScreen';
import { SubjectScreen } from '../screens/onboarding/deadline/SubjectScreen';
import { DateScreen } from '../screens/onboarding/deadline/DateScreen';
import { DaysPerWeekScreen } from '../screens/onboarding/deadline/DaysPerWeekScreen';
import { StudyTimeScreen } from '../screens/onboarding/habit/StudyTimeScreen';
import { HabitDaysScreen } from '../screens/onboarding/habit/HabitDaysScreen';
import { PickAndGoScreen } from '../screens/onboarding/explore/PickAndGoScreen';
import { FocusSpanScreen } from '../screens/onboarding/shared/FocusSpanScreen';
import { PickIceScreen } from '../screens/onboarding/shared/PickIceScreen';
import { StrictnessScreen } from '../screens/onboarding/shared/StrictnessScreen';
import { BlockSizeScreen } from '../screens/onboarding/shared/BlockSizeScreen';
import { DailyBlocksScreen } from '../screens/onboarding/shared/DailyBlocksScreen';
import { FocusProfileRevealScreen } from '../screens/onboarding/shared/FocusProfileRevealScreen';
import { NotificationsScreen } from '../screens/onboarding/shared/NotificationsScreen';
import { FirstSessionScreen } from '../screens/onboarding/shared/FirstSessionScreen';
import { OnboardingContext } from './OnboardingContext';
import { useOnboardingProfile } from '../hooks/useOnboardingProfile';
import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  const { draft, update, setDerivedBy, build } = useOnboardingProfile();

  const contextValue = useMemo(
    () => ({ draft, update, setDerivedBy, build }),
    [draft, update, setDerivedBy, build],
  );

  return (
    <OnboardingContext.Provider value={contextValue}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="ColdOpen" component={ColdOpenScreen} />
        <Stack.Screen name="MiniMeltDemo" component={MiniMeltDemoScreen} />
        <Stack.Screen name="PathFork" component={PathForkScreen} />
        <Stack.Screen name="Subject" component={SubjectScreen} />
        <Stack.Screen name="DeadlineDate" component={DateScreen} />
        <Stack.Screen name="DaysPerWeek" component={DaysPerWeekScreen} />
        <Stack.Screen name="StudyTime" component={StudyTimeScreen} />
        <Stack.Screen name="HabitDays" component={HabitDaysScreen} />
        <Stack.Screen name="PickAndGo" component={PickAndGoScreen} />
        <Stack.Screen name="FocusSpan" component={FocusSpanScreen} />
        <Stack.Screen name="PickIce" component={PickIceScreen} />
        <Stack.Screen name="Strictness" component={StrictnessScreen} />
        <Stack.Screen name="BlockSize" component={BlockSizeScreen} />
        <Stack.Screen name="DailyBlocks" component={DailyBlocksScreen} />
        <Stack.Screen name="FocusProfileReveal" component={FocusProfileRevealScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="FirstSession" component={FirstSessionScreen} />
      </Stack.Navigator>
    </OnboardingContext.Provider>
  );
}
