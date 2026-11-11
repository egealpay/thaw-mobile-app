import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BootSplash from 'react-native-bootsplash';
import { AppNavigator } from './src/navigation/AppNavigator';
import { syncReminders } from './src/notifications/reminders';

export default function App() {
  // Keep reminders in step with profile edits, settings and today's progress.
  useEffect(() => {
    syncReminders();
    const sub = AppState.addEventListener('change', status => {
      if (status === 'active') syncReminders();
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer onReady={() => BootSplash.hide({ fade: true })}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
