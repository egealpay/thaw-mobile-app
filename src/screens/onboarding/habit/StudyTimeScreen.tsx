import React, { useContext, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, ProgressHeader, ScreenBackground } from '../../../components';
import { Colors, Spacing, TextStyles } from '../../../constants';
import { formatTime24to12 } from '../../../utils/formatters';
import { OnboardingContext } from '../../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'StudyTime'>;

export function StudyTimeScreen({ navigation }: Props) {
  const [time, setTime] = useState(new Date(new Date().setHours(19, 30, 0, 0)));
  const { update, setDerivedBy } = useContext(OnboardingContext);

  const h = time.getHours();
  const m = time.getMinutes();
  const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const friendlyTime = formatTime24to12(timeStr);

  const handleContinue = () => {
    update({ studyWindow: { startTime: timeStr } });
    setDerivedBy('studyWindow', `the time you chose (B1)`);
    navigation.navigate('HabitDays');
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ProgressHeader progress={0.22} onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <View style={styles.textBlock}>
            <Text style={styles.h2}>When should this become a habit?</Text>
            <Text style={styles.body}>
              Pick a time you'll actually show up. We'll nudge you then.
            </Text>
          </View>

          <View style={styles.pickerCard}>
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => date && setTime(date)}
              style={styles.picker}
            />
          </View>

          <View style={styles.pill}>
            <Text style={styles.pillText}>A quiet {friendlyTime} nudge</Text>
          </View>

          <PrimaryButton label="Continue" onPress={handleContinue} />
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
    paddingBottom: 32,
    gap: 24,
    justifyContent: 'space-between',
  },
  textBlock: { gap: 10 },
  h2: { ...TextStyles.h2 },
  body: { ...TextStyles.body },
  pickerCard: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  picker: {
    width: '100%',
  },
  pill: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(42,108,191,0.1)',
  },
  pillText: { ...TextStyles.pill },
});
