import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants';

interface Props {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function Toggle({ value, onChange }: Props) {
  const offset = useSharedValue(value ? 22 : 2);

  useEffect(() => {
    offset.value = withTiming(value ? 22 : 2, { duration: 150 });
  }, [value, offset]);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.9}
      style={[styles.track, value && styles.trackOn]}
    >
      <Animated.View style={[styles.knob, knobStyle]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.faint2,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: Colors.primary,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
