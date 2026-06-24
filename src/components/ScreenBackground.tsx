import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants';

export type BgVariant = 'light' | 'dark' | 'reveal' | 'start' | 'paused' | 'refreeze';

const GRADIENTS: Record<BgVariant, string[]> = {
  light: Colors.bgLight as unknown as string[],
  dark: Colors.bgSession as unknown as string[],
  reveal: Colors.bgReveal as unknown as string[],
  start: Colors.bgStart as unknown as string[],
  paused: Colors.bgPaused as unknown as string[],
  refreeze: Colors.bgRefreeze as unknown as string[],
};

interface Props {
  variant?: BgVariant;
  children: React.ReactNode;
}

export function ScreenBackground({ variant = 'light', children }: Props) {
  return (
    <LinearGradient
      colors={GRADIENTS[variant]}
      style={styles.flex}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
