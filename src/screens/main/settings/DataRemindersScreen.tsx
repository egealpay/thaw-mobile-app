import React, { useState } from 'react';
import {
  Alert,
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

export function DataRemindersScreen() {
  const settings = getSettings();
  const [notifs, setNotifs] = useState(settings.notificationsEnabled);
  const [quietHours, setQuietHours] = useState(settings.quietHoursEnabled);

  const handleNotifsToggle = (val: boolean) => {
    setNotifs(val);
    saveSettings({ ...settings, notificationsEnabled: val });
  };

  const handleQuietToggle = (val: boolean) => {
    setQuietHours(val);
    saveSettings({ ...settings, quietHoursEnabled: val });
  };

  const handleExport = async () => {
    const sessions = getAllSessions();
    const profile = getProfile();
    const json = JSON.stringify({ profile, sessions }, null, 2);
    await Share.share({ message: json, title: 'Thaw data export' });
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset progress?',
      'Your session history and streak will be cleared. Your profile and settings stay intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => deleteAllSessions(),
        },
      ],
    );
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
            <Row
              label="Reminder time"
              value={formatTime24to12(settings.reminderTime)}
            />
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
            <View style={styles.divider} />
            <Row label="Device backup" value="iCloud · on" />
          </Section>

          <Section title="">
            <Row
              label="Reset progress"
              onPress={handleResetProgress}
              destructive
            />
            <View style={styles.divider} />
            <Row
              label="Delete all data"
              onPress={handleDeleteAll}
              destructive
            />
          </Section>

          <Text style={styles.footer}>Thaw v0.2 · everything stays on your device</Text>
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
