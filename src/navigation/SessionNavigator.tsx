import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActiveSessionScreen } from '../screens/session/ActiveSessionScreen';
import { PausedScreen } from '../screens/session/PausedScreen';
import { RefreezeScreen } from '../screens/session/RefreezeScreen';
import { SessionCompleteScreen } from '../screens/session/SessionCompleteScreen';
import type { RootStackParamList, SessionStackParamList } from './types';

const Stack = createNativeStackNavigator<SessionStackParamList>();

type Props = NativeStackScreenProps<RootStackParamList, 'Session'>;

export function SessionNavigator({ route }: Props) {
  const { profile, targetSeconds } = route.params;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen
        name="ActiveSession"
        component={ActiveSessionScreen}
        initialParams={{ profile, targetSeconds }}
      />
      <Stack.Screen name="Paused" component={PausedScreen} />
      <Stack.Screen name="Refreeze" component={RefreezeScreen} />
      <Stack.Screen name="SessionComplete" component={SessionCompleteScreen} />
    </Stack.Navigator>
  );
}
