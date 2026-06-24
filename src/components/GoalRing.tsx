import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, TextStyles } from '../constants';

interface Props {
  progress: number; // 0–1
  minutesDone: number;
  goalMinutes: number;
  size?: number;
}

export function GoalRing({ progress, minutesDone, goalMinutes, size = 110 }: Props) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.track}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[styles.inner, { width: size, height: size }]}>
        <Text style={styles.value}>{minutesDone}m</Text>
        <Text style={styles.label}>of {goalMinutes} min</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 22,
    color: Colors.ink,
  },
  label: {
    ...TextStyles.bodySmall,
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
});
