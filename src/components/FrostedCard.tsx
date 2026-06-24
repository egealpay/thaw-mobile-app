import React from 'react';
import { StyleSheet, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { Colors, Shadows, Spacing } from '../constants';

interface Props {
  children: React.ReactNode;
  selected?: boolean;
  style?: ViewStyle;
  padding?: number;
  onPress?: () => void;
}

export function FrostedCard({ children, selected = false, style, padding, onPress }: Props) {
  const cardStyle = [
    styles.card,
    selected && styles.selected,
    padding !== undefined && { padding },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardWhiteIdle,
    borderRadius: Spacing.radiusCard,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.cardPad,
    ...Shadows.card,
  },
  selected: {
    backgroundColor: Colors.cardWhiteSelected,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});
