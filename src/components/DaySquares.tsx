import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Spacing, TextStyles } from '../constants';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface Props {
  selected: boolean[];
  onChange: (selected: boolean[]) => void;
}

export function DaySquares({ selected, onChange }: Props) {
  const count = selected.filter(Boolean).length;

  const toggle = (i: number) => {
    const next = [...selected];
    next[i] = !next[i];
    onChange(next);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {DAY_LABELS.map((label, i) => (
          <TouchableOpacity key={i} onPress={() => toggle(i)} activeOpacity={0.8}>
            {selected[i] ? (
              <LinearGradient
                colors={[Colors.accentLight, Colors.primary]}
                style={styles.square}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Text style={[styles.dayLabel, styles.dayLabelSelected]}>{label}</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.square, styles.squareIdle]}>
                <Text style={styles.dayLabel}>{label}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.countRow}>
        <Text style={styles.bigNumber}>{count}</Text>
        <Text style={styles.countLabel}>
          {'days a week'}
          {count === 5 && selected.filter((_, i) => i < 5).every(Boolean) && !selected[5] && !selected[6]
            ? ' · weekdays'
            : count === 7
            ? ' · every day'
            : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 24 },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  square: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radiusDaySquare,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareIdle: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  dayLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: Colors.faint2,
  },
  dayLabelSelected: {
    color: Colors.white,
  },
  countRow: {
    alignItems: 'center',
    gap: 2,
  },
  bigNumber: {
    ...TextStyles.bigNumber,
  },
  countLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: Colors.body,
  },
});
