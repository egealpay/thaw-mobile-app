import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, PrimaryButton, ScreenBackground, SecondaryButton } from '../../components';
import { Colors, Spacing, TextStyles } from '../../constants';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ColdOpen'>;

export function ColdOpenScreen({ navigation }: Props) {
  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <Text style={styles.wordmark}>THAW</Text>
          <TouchableOpacity onPress={() => navigation.navigate('PathFork')}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.center}>
          <IceCube progress={0} state="idle" iceProfile="glacier" size={220} />
        </View>

        <View style={styles.bottom}>
          <Text style={styles.h2}>Study until the ice melts.</Text>
          <Text style={styles.body}>
            A calmer timer. No ticking, no countdown — just focus, and watch the block thaw.
          </Text>

          <View style={styles.actions}>
            <PrimaryButton
              label="Try it"
              onPress={() => navigation.navigate('MiniMeltDemo')}
            />
            <Text style={styles.subLabel}>Takes 20 seconds · No account needed</Text>
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenH,
    paddingTop: 12,
    paddingBottom: 8,
  },
  wordmark: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 14,
    letterSpacing: 5,
    color: Colors.primary,
  },
  skip: {
    fontFamily: 'Outfit-Medium',
    fontSize: 15,
    color: Colors.muted,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    paddingHorizontal: Spacing.screenH,
    paddingBottom: 32,
    gap: 16,
  },
  h2: { ...TextStyles.h2 },
  body: { ...TextStyles.body },
  actions: { gap: 10 },
  subLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: Colors.muted,
    textAlign: 'center',
  },
});
