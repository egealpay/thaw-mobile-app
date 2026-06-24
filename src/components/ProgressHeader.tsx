import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Spacing } from '../constants';

interface Props {
  progress: number; // 0–1
  onBack?: () => void;
}

export function ProgressHeader({ progress, onBack }: Props) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={8}>
          <View style={styles.chevron} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backPlaceholder} />
      )}
      <View style={styles.trackWrapper}>
        <View style={styles.track}>
          <LinearGradient
            colors={[Colors.accentMid, Colors.primary]}
            style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenH,
    paddingVertical: 12,
    gap: 14,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 34,
    height: 34,
  },
  chevron: {
    width: 8,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: Colors.primary,
    transform: [{ rotate: '45deg' }, { translateX: 2 }],
  },
  trackWrapper: {
    flex: 1,
  },
  track: {
    height: Spacing.progressBarHeight,
    borderRadius: 3,
    backgroundColor: Colors.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
