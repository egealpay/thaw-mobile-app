import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Spacing } from '../../../constants';

interface Props {
  title: string;
  onBack: () => void;
}

export function EditNavBar({ title, onBack }: Props) {
  return (
    <View style={styles.bar}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={8}>
        <Svg width={16} height={12} viewBox="0 0 16 12">
          <Path
            d="M15 6H1M6 1L1 6L6 11"
            stroke={Colors.primary}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      {/* spacer to keep title centred */}
      <View style={styles.backBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenH,
    paddingVertical: 12,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk-SemiBold',
    fontSize: 16,
    color: Colors.ink,
    letterSpacing: -0.2,
  },
});
