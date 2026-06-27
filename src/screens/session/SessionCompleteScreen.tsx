import React from 'react';
import { CommonActions } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, PrimaryButton, ScreenBackground, SecondaryButton } from '../../components';
import { Colors, Spacing, TextStyles } from '../../constants';
import type { SessionStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SessionStackParamList, 'SessionComplete'>;

function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function SessionCompleteScreen({ route, navigation }: Props) {
  const { focusedMinutes, streak, todayMinutes } = route.params;

  return (
    <ScreenBackground variant="light">
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.eyebrow}>BLOCK COMPLETE</Text>

          <View style={styles.cubeArea}>
            <IceCube
              progress={1}
              state="complete"
              iceProfile="glacier"
              size={120}
            />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.h2}>Melted clean through.</Text>
            <Text style={styles.body}>
              {focusedMinutes} focused minutes. That's what focus feels like.
            </Text>
          </View>

          <View style={styles.statsRow}>
            <StatTile value={`${focusedMinutes}`} label="minutes" />
            <View style={styles.divider} />
            <StatTile value={`${streak}`} label="day streak" />
            <View style={styles.divider} />
            <StatTile value={`${todayMinutes}m`} label="today" />
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label="Another block"
              onPress={() => navigation.navigate('ActiveSession', {} as any)}
            />
            <SecondaryButton
              label="Done for now"
              onPress={() => {
                const parent = navigation.getParent();
                if (parent?.canGoBack()) {
                  parent.goBack();
                } else {
                  parent?.dispatch(
                    CommonActions.reset({ index: 0, routes: [{ name: 'MainApp' }] }),
                  );
                }
              }}
            />
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
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  eyebrow: { ...TextStyles.eyebrow },
  cubeArea: { alignItems: 'center' },
  textBlock: { alignItems: 'center', gap: 10 },
  h2: { ...TextStyles.h2, textAlign: 'center' },
  body: { ...TextStyles.body, textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.cardWhiteSelected,
    borderRadius: Spacing.radiusCard,
    paddingVertical: 20,
    paddingHorizontal: 12,
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statTile: { alignItems: 'center', gap: 4 },
  statValue: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 32,
    color: Colors.ink,
  },
  statLabel: { ...TextStyles.bodySmall },
  divider: { width: 1, height: 40, backgroundColor: Colors.track },
  actions: { width: '100%', gap: 8 },
});
