import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants';
import type { IceProfile } from '../types';

interface Props {
  active: boolean;
  cubeSize: number;
  iceProfile: IceProfile;
  meltProgress: number;
}

function Drip({
  active,
  delay,
  cubeBottom,
  xOffset,
  color,
}: {
  active: boolean;
  delay: number;
  cubeBottom: number;
  xOffset: number;
  color: string;
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      translateY.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(40, { duration: 800 }),
          ),
          -1,
          false,
        ),
      );
      opacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(0.9, { duration: 100 }),
            withTiming(0, { duration: 700 }),
          ),
          -1,
          false,
        ),
      );
    } else {
      translateY.value = 0;
      opacity.value = 0;
    }
  }, [active, delay, translateY, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: cubeBottom,
          left: xOffset,
          width: 5,
          height: 8,
          borderRadius: 3,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export function Puddle({ active, cubeSize, iceProfile, meltProgress }: Props) {
  const color =
    iceProfile === 'glacier' ? Colors.iceGlacier[1] : Colors.iceFrost[1];
  const cubeBottom = cubeSize * 0.85;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Drip
        active={active}
        delay={0}
        cubeBottom={cubeBottom}
        xOffset={cubeSize * 0.42}
        color={color}
      />
      <Drip
        active={active && meltProgress > 0.3}
        delay={1400}
        cubeBottom={cubeBottom}
        xOffset={cubeSize * 0.52}
        color={color}
      />
    </View>
  );
}
