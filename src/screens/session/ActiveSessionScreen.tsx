import React, { useCallback } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IceCube, Puddle, ScreenBackground } from '../../components';
import { Colors, Spacing, TextStyles } from '../../constants';
import { useSessionEngine } from '../../engine/sessionEngine';
import { formatTimer, meltPercent } from '../../utils/formatters';
import type { SessionStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SessionStackParamList, 'ActiveSession'>;

export function ActiveSessionScreen({ route, navigation }: Props) {
  const { profile, targetSeconds } = route.params;
  const { meltState, start, pause, resume, abandon } = useSessionEngine(
    profile,
    targetSeconds,
  );

  const remaining = Math.max(
    0,
    meltState.targetDuration - meltState.elapsedFocused,
  );

  const exitToHome = useCallback(() => {
    const parent = navigation.getParent();
    if (parent?.canGoBack()) {
      parent.goBack();
    } else {
      // First-session path: Onboarding was replaced by MainApp while the Session
      // modal was open. Reset the root stack to MainApp so the user lands there.
      parent?.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'MainApp' }] }),
      );
    }
  }, [navigation]);

  // Resume when returning from PausedScreen via "Resume"; end when returning via "End session"
  useFocusEffect(
    useCallback(() => {
      if (route.params?.endSession) {
        abandon();
        exitToHome();
      } else if (meltState.state === 'paused' || meltState.state === 'refreezing') {
        resume();
      }
    }, [meltState.state, resume, route.params?.endSession, abandon, exitToHome]),
  );

  const handleStart = useCallback(() => {
    if (meltState.state === 'idle') start();
  }, [meltState.state, start]);

  const handlePause = useCallback(() => {
    if (meltState.state === 'melting') {
      pause();
      navigation.navigate('Paused', {
        meltProgress: meltState.meltProgress,
        iceProfile: meltState.iceProfile,
        strictness: profile?.strictness ?? 'gentle',
      });
    }
  }, [meltState.state, meltState.meltProgress, meltState.iceProfile, profile, pause, navigation]);

  const handleGiveUp = useCallback(() => {
    const pct = Math.round(meltState.meltProgress * 100);
    if (pct > 25) {
      Alert.alert(
        'End session?',
        `You've melted ${pct}% of your ice. This progress won't be counted.`,
        [
          { text: 'Keep going', style: 'cancel' },
          {
            text: 'End session',
            style: 'destructive',
            onPress: () => { abandon(); exitToHome(); },
          },
        ],
      );
    } else {
      abandon();
      exitToHome();
    }
  }, [meltState.meltProgress, abandon, exitToHome]);

  // Auto-navigate on complete
  React.useEffect(() => {
    if (meltState.state === 'complete') {
      navigation.navigate('SessionComplete', {
        focusedMinutes: Math.round(meltState.elapsedFocused / 60),
        streak: 0, // will be computed in SessionComplete
        todayMinutes: 0,
      });
    }
  }, [meltState.state, meltState.elapsedFocused, navigation]);

  const isIdle = meltState.state === 'idle';

  const cubeSize = 200;
  const canvasH = Math.round(cubeSize * 1.28);

  return (
    <ScreenBackground variant="dark">
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          {/* Eyebrow + subject */}
          <View style={styles.header}>
            <Text style={styles.eyebrow}>FOCUSING ON</Text>
            <Text style={styles.subject} numberOfLines={1}>
              {profile?.deadline?.label ?? 'Free session'}
            </Text>
          </View>

          {/* Ice cube + drips — cube fills available middle space */}
          <View style={styles.cubeArea}>
            <View style={{ width: cubeSize, height: canvasH }}>
              <IceCube
                progress={meltState.meltProgress}
                state={meltState.state}
                iceProfile={meltState.iceProfile}
                size={cubeSize}
              />
              <Puddle
                active={meltState.state === 'melting'}
                cubeSize={cubeSize}
                iceProfile={meltState.iceProfile}
                meltProgress={meltState.meltProgress}
              />
            </View>
          </View>

          {/* Bottom block: timer + status + progress + controls */}
          <View style={styles.bottom}>
            <Text style={styles.timer}>{formatTimer(remaining)}</Text>

            {!isIdle && (
              <Text style={styles.status}>{meltPercent(meltState.meltProgress)} · keep going</Text>
            )}
            {isIdle && (
              <Text style={styles.status}>
                {profile?.iceProfileDefault === 'glacier' ? 'Glacier' : 'Frost'} ·{' '}
                {Math.round(meltState.targetDuration / 60)} min ·{' '}
                {profile?.strictness === 'strict' ? 'Strict' : 'Gentle'}
              </Text>
            )}

            <View style={styles.trackBg}>
              <View style={[styles.trackFill, { width: `${meltState.meltProgress * 100}%` }]} />
            </View>

            <View style={styles.controls}>
              {isIdle ? (
                <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
                  <Text style={styles.startBtnLabel}>Start melting</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity style={styles.controlBtn} onPress={handlePause}>
                    <Text style={styles.controlLabel}>Pause</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.controlBtn, styles.giveUpBtn]} onPress={handleGiveUp}>
                    <Text style={styles.giveUpLabel}>Give up</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
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
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  header: { alignItems: 'center', gap: 4 },
  eyebrow: { ...TextStyles.eyebrow, color: Colors.accentMid2 },
  subject: {
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 17,
    color: Colors.white,
    letterSpacing: -0.3,
  },
  cubeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  timer: { ...TextStyles.timerLarge },
  status: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
  },
  trackBg: {
    width: '100%',
    height: Spacing.sessionProgressHeight,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  controlBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  giveUpBtn: {
    backgroundColor: 'transparent',
  },
  controlLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: Colors.white,
  },
  giveUpLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
  },
  startBtn: {
    flex: 1,
    height: Spacing.btnHeight,
    borderRadius: Spacing.radiusBtn,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 17,
    color: Colors.primary,
  },
});
