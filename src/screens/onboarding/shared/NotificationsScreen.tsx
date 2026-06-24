import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, PrimaryButton, ProgressHeader, ScreenBackground, SecondaryButton } from '../../../components';
import { Spacing, TextStyles } from '../../../constants';
import { OnboardingContext } from '../../../navigation/OnboardingContext';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: Props) {
  const { build } = React.useContext(OnboardingContext);

  const goNext = () => {
    const profile = build();
    navigation.navigate('FirstSession', { profile });
  };

  const handleEnable = async () => {
    try {
      const settings = await notifee.requestPermission();
      const granted = settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
        settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
      if (granted) {
        await notifee.createChannel({ id: 'reminders', name: 'Daily Reminders' });
      }
    } catch {}
    goNext();
  };

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <ProgressHeader progress={0.91} onBack={() => navigation.goBack()} />
        <View style={styles.container}>
          <View style={styles.iconCard}>
            <IceCube progress={0} state="idle" iceProfile="glacier" size={120} />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.h2}>Want a nudge while you prep?</Text>
            <Text style={styles.body}>
              One quiet reminder a day as your deadline approaches. No spam, no streak guilt — ever.
            </Text>
          </View>

          <View style={styles.spacer} />
          <View style={styles.actions}>
            <PrimaryButton label="Turn on reminders" onPress={handleEnable} />
            <SecondaryButton label="Maybe later" onPress={goNext} />
          </View>
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
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 24,
  },
  spacer: { flex: 1 },
  iconCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { alignItems: 'center', gap: 12 },
  h2: { ...TextStyles.h2, textAlign: 'center' },
  body: { ...TextStyles.body, textAlign: 'center' },
  actions: { width: '100%', gap: 8 },
});
