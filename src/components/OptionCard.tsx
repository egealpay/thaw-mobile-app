import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Shadows, Spacing, TextStyles } from '../constants';

interface Props {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  trailingContent?: React.ReactNode;
}

export function OptionCard({ title, subtitle, selected, onPress, trailingContent }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, selected && styles.selected]}
    >
      <View style={styles.row}>
        <View style={styles.radioOuter}>
          {selected && <View style={styles.radioInner} />}
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {trailingContent}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardWhiteIdle,
    borderRadius: Spacing.radiusCard,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    ...Shadows.card,
  },
  selected: {
    backgroundColor: Colors.cardWhiteSelected,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  textBlock: { flex: 1 },
  title: { ...TextStyles.cardTitle },
  subtitle: { ...TextStyles.cardSubtitle, marginTop: 2 },
});
