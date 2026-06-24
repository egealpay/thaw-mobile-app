import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Shadows, Spacing, TextStyles } from '../constants';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'blue' | 'white';
  leftIcon?: React.ReactNode;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'blue',
  leftIcon,
}: Props) {
  const isBlue = variant === 'blue';

  const content = loading ? (
    <ActivityIndicator color={isBlue ? Colors.white : Colors.primary} />
  ) : (
    <View style={styles.row}>
      {leftIcon}
      <Text style={[styles.label, !isBlue && styles.whiteLabel]}>{label}</Text>
    </View>
  );

  if (isBlue) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={styles.wrapper}
      >
        <LinearGradient
          colors={[Colors.accentLight, Colors.primary]}
          style={[styles.btn, disabled && styles.disabled]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={styles.wrapper}
    >
      <View style={[styles.btn, styles.whiteBg, disabled && styles.disabled]}>
        {content}
      </View>
    </TouchableOpacity>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.secondary}>
      <Text style={styles.secondaryLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...Shadows.button,
  },
  btn: {
    height: Spacing.btnHeight,
    borderRadius: Spacing.radiusBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  disabled: { opacity: 0.5 },
  label: {
    ...TextStyles.btnLabel,
    color: Colors.white,
  },
  whiteBg: {
    backgroundColor: Colors.white,
  },
  whiteLabel: {
    color: Colors.primary,
  },
  secondary: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryLabel: {
    fontFamily: 'Outfit-Medium',
    fontSize: 15,
    color: Colors.muted,
  },
});
