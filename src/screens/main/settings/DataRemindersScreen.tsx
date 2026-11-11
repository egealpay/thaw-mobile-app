import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenBackground, Toggle } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { getAllSessions, deleteAllSessions } from '../../../storage/db';
import { clearAll, getProfile, getSettings, saveSettings } from '../../../storage/mmkv';
import { formatTime24to12 } from '../../../utils/formatters';
import { disableReminders, enableReminders, syncReminders } from '../../../notifications/reminders';
import { version as appVersion } from '../../../../package.json';

function Row({
  label,
  value,
  onPress,
  destructive,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.rowLabel, destructive && styles.destructive]}>{label}</Text>
      {value && (
        <View style={styles.rowRight}>
          <Text style={styles.rowValue}>{value}</Text>
          {onPress && <Text style={styles.chevron}>›</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function timeToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function dateToTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function DataRemindersScreen() {
  const initial = getSettings();
  const [notifs, setNotifs] = useState(initial.notificationsEnabled);
  const [quietHours, setQuietHours] = useState(initial.quietHoursEnabled);
  const [reminderTime, setReminderTime] = useState(initial.reminderTime);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);

  const handleNotifsToggle = async (val: boolean) => {
    setNotifs(val);
    if (!val) {
      await disableReminders();
      return;
    }
    const granted = await enableReminders();
    if (!granted) {
      setNotifs(false);
      Alert.alert(
        'Notifications are off',
        'Allow notifications for Thaw in Settings to get your daily reminder.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
    }
  };

  const handleQuietToggle = (val: boolean) => {
    setQuietHours(val);
    saveSettings({ ...getSettings(), quietHoursEnabled: val });
    syncReminders();
  };

  const handleTimeChange = (date?: Date) => {
    setShowAndroidPicker(false);
    if (!date) return;
    const t = dateToTime(date);
    setReminderTime(t);
    saveSettings({ ...getSettings(), reminderTime: t });
    syncReminders();
  };

  const settings = getSettings();

  const handleExport = async () => {
    const sessions = getAllSessions();
    const profile = getProfile();
    const json = JSON.stringify({ profile, sessions }, null, 2);
    await Share.share({ message: json, title: 'Thaw data export' });
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete all data?',
      'This will erase your profile, session history, and streak. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => {
            deleteAllSessions();
            clearAll();
            syncReminders(); // no profile any more → cancels reminders
          },
        },
      ],
    );
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.h2}>Reminders & data</Text>

          <Section title="REMINDERS">
            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.rowLabel}>Daily reminder</Text>
                <Text style={styles.toggleSub}>One nudge at your study time</Text>
              </View>
              <Toggle value={notifs} onChange={handleNotifsToggle} />
            </View>
            <View style={styles.divider} />
            {Platform.OS === 'ios' ? (
              <View style={styles.toggleRow}>
                <Text style={styles.rowLabel}>Reminder time</Text>
                <DateTimePicker
                  value={timeToDate(reminderTime)}
                  mode="time"
                  display="compact"
                  themeVariant="light"
                  onChange={(_, date) => handleTimeChange(date)}
                />
              </View>
            ) : (
              <Row
                label="Reminder time"
                value={formatTime24to12(reminderTime)}
                onPress={() => setShowAndroidPicker(true)}
              />
            )}
            {showAndroidPicker && (
              <DateTimePicker
                value={timeToDate(reminderTime)}
                mode="time"
                onChange={(_, date) => handleTimeChange(date)}
              />
            )}
            <View style={styles.divider} />
            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <Text style={styles.rowLabel}>Quiet hours</Text>
                <Text style={styles.toggleSub}>
                  No nudges {formatTime24to12(settings.quietHoursStart)} –{' '}
                  {formatTime24to12(settings.quietHoursEnd)}
                </Text>
              </View>
              <Toggle value={quietHours} onChange={handleQuietToggle} />
            </View>
          </Section>

          <Section title="YOUR DATA">
            <Row label="Export my data" onPress={handleExport} value="" />
          </Section>

          <Section title="">
            <Row
              label="Delete all data"
              onPress={handleDeleteAll}
              destructive
            />
          </Section>

          <Text style={styles.footer}>Thaw v{appVersion} · everything stays on your device</Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: Spacing.screenH,
    gap: 20,
    paddingBottom: 32,
  },
  h2: { ...TextStyles.h2 },
  section: { gap: 8 },
  sectionLabel: { ...TextStyles.sectionLabel },
  sectionCard: {
    backgroundColor: Colors.cardWhiteSelected,
    borderRadius: Spacing.radiusCard,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  rowLabel: { fontFamily: 'Outfit-Regular', fontSize: 16, color: Colors.ink },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontFamily: 'Outfit-Regular', fontSize: 15, color: Colors.muted },
  chevron: { fontSize: 18, color: Colors.faint2 },
  divider: { height: 1, backgroundColor: Colors.track, marginHorizontal: 18 },
  destructive: { color: Colors.destructive },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  toggleText: { gap: 2 },
  toggleSub: { fontFamily: 'Outfit-Regular', fontSize: 13, color: Colors.muted },
  footer: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: Colors.faint,
    textAlign: 'center',
    marginTop: 8,
  },
});
