import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { HomeScreen } from '../screens/main/HomeScreen';
import { StatsScreen } from '../screens/main/StatsScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { Colors, Spacing } from '../constants';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function HomeIcon({ focused }: { focused: boolean }) {
  const c = focused ? Colors.primary : Colors.faint2;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15.5V15H8.5V21H4C3.45 21 3 20.55 3 20V10.5Z"
        fill="none"
        stroke={c}
        strokeWidth={1.7}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function StatsIcon({ focused }: { focused: boolean }) {
  const c = focused ? Colors.primary : Colors.faint2;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Rect x={3} y={13} width={4.5} height={8} rx={1.2} fill={c} />
      <Rect x={9.75} y={8} width={4.5} height={13} rx={1.2} fill={c} />
      <Rect x={16.5} y={4} width={4.5} height={17} rx={1.2} fill={c} />
    </Svg>
  );
}

function SettingsIcon({ focused }: { focused: boolean }) {
  const c = focused ? Colors.primary : Colors.faint2;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} fill="none" stroke={c} strokeWidth={1.7} />
      <Circle cx={12} cy={12} r={3} fill={c} />
    </Svg>
  );
}

const tabStyles = StyleSheet.create({
  label: {
    fontFamily: 'Outfit-Regular',
    fontSize: 11,
    color: Colors.faint2,
    marginBottom: 2,
  },
  labelActive: { color: Colors.primary, fontFamily: 'Outfit-SemiBold' },
});

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: Spacing.tabBarHeight,
          backgroundColor: 'rgba(244,250,254,0.97)',
          borderTopColor: 'rgba(31,77,120,0.08)',
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.faint2,
        tabBarIcon: ({ focused }) => {
          if (route.name === 'Home') return <HomeIcon focused={focused} />;
          if (route.name === 'Stats') return <StatsIcon focused={focused} />;
          return <SettingsIcon focused={focused} />;
        },
        tabBarLabel: ({ focused, children }) => (
          <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{children}</Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
