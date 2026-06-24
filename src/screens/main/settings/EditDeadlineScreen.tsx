import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, ScreenBackground } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { getProfile, saveProfile } from '../../../storage/mmkv';
import { daysUntil } from '../../../utils/formatters';
import type { SettingsEditParamList } from '../../../navigation/types';
import { EditNavBar } from './EditNavBar';

type Props = NativeStackScreenProps<SettingsEditParamList, 'EditDeadline'>;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function EditDeadlineScreen({ navigation }: Props) {
  const profile = getProfile()!;
  const now = new Date();

  // Pre-select existing deadline date if set
  const existing = profile.deadline?.date ? new Date(profile.deadline.date) : null;
  const [year, setYear] = useState(existing?.getFullYear() ?? now.getFullYear());
  const [month, setMonth] = useState(existing?.getMonth() ?? now.getMonth());
  const [day, setDay] = useState<number | null>(existing?.getDate() ?? null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setDay(null);
  };

  const isoDate = day
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    : '';
  const days = isoDate ? daysUntil(isoDate) : 0;

  const handleSave = () => {
    if (!day) return;
    saveProfile({
      ...profile,
      deadline: { ...(profile.deadline ?? { label: '' }), date: isoDate },
    });
    navigation.goBack();
  };

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <EditNavBar title="Deadline" onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <Text style={styles.h2}>When is it?</Text>

          <View style={styles.calCard}>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={prevMonth} hitSlop={8}>
                <Text style={styles.navArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
              <TouchableOpacity onPress={nextMonth} hitSlop={8}>
                <Text style={styles.navArrow}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((d, i) => (
                <Text key={i} style={styles.weekDay}>{d}</Text>
              ))}
            </View>

            {Array.from({ length: cells.length / 7 }, (_, row) => (
              <View key={row} style={styles.calRow}>
                {cells.slice(row * 7, row * 7 + 7).map((d, col) => {
                  const isSelected = d === day;
                  const isPast = d !== null &&
                    new Date(year, month, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  return (
                    <TouchableOpacity
                      key={col}
                      onPress={() => d && !isPast && setDay(d)}
                      disabled={!d || isPast}
                      style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                    >
                      <Text style={[
                        styles.dayNum,
                        isSelected && styles.dayNumSelected,
                        isPast && styles.dayNumPast,
                      ]}>
                        {d ?? ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {day && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{days} days to go</Text>
            </View>
          )}

          <View style={styles.spacer} />
          <PrimaryButton label="Save" onPress={handleSave} disabled={!day} />
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenH,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 20,
  },
  spacer: { flex: 1 },
  h2: { ...TextStyles.h2 },
  calCard: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navArrow: { fontSize: 22, color: Colors.primary, paddingHorizontal: 8 },
  monthLabel: { fontFamily: 'SpaceGrotesk-SemiBold', fontSize: 15, color: Colors.ink },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: Colors.muted,
    paddingVertical: 4,
  },
  calRow: { flexDirection: 'row' },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    margin: 1,
  },
  dayCellSelected: { backgroundColor: Colors.primary },
  dayNum: { fontFamily: 'Outfit-Regular', fontSize: 14, color: Colors.ink },
  dayNumSelected: { color: Colors.white, fontFamily: 'Outfit-SemiBold' },
  dayNumPast: { color: Colors.faint2, opacity: 0.4 },
  pill: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(42,108,191,0.1)',
  },
  pillText: { ...TextStyles.pill },
});
