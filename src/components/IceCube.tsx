import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Defs,
  Ellipse,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import type { IceProfile, MeltStateName } from '../types';

interface Props {
  progress: number; // 0→1
  state: MeltStateName;
  iceProfile: IceProfile;
  size?: number;
}

const PROFILES = {
  glacier: {
    top: '#e4f4ff',
    mid: '#b8dbf2',
    deep: '#5aaee0',
    shadow: '#3d8ec4',
  },
  frost: {
    top: '#ffffff',
    mid: '#e6f1f9',
    deep: '#c5d9ea',
    shadow: '#9ab8cc',
  },
} as const;

export function IceCube({ progress, state, iceProfile, size = 150 }: Props) {
  const floatY = useSharedValue(0);
  const opacityAnim = useSharedValue(1);

  useEffect(() => {
    if (state === 'idle' || state === 'melting') {
      floatY.value = withRepeat(
        withSequence(
          withTiming(-7, { duration: 3000 }),
          withTiming(7, { duration: 3000 }),
        ),
        -1,
        true,
      );
    } else {
      floatY.value = withTiming(0, { duration: 400 });
    }
  }, [state, floatY]);

  useEffect(() => {
    opacityAnim.value = withTiming(state === 'paused' ? 0.45 : 1, { duration: 300 });
  }, [state, opacityAnim]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
    opacity: opacityAnim.value,
  }));

  const c = PROFILES[iceProfile];
  const cx = size / 2;
  const cy = size / 2;
  const side = size * 0.72;

  // The cube shrinks in height to zero as it fully melts.
  // We use an ease-in curve so the early melt is subtle and the final
  // collapse into the puddle is fast and satisfying.
  const meltProgress = progress * progress; // ease-in: slow start, fast finish
  const meltH = side * Math.max(0, 1 - meltProgress);

  // As the cube gets shorter it spreads slightly wider (physical spreading).
  const meltW = side * (1 + meltProgress * 0.1);

  // Corner radius grows as corners soften. Clamped to meltH/2 so the rect
  // never has rx > height/2 which would be an invalid SVG shape.
  const cornerR = Math.min(meltH / 2, side * (0.18 + meltProgress * 0.35));

  // Rect upper-left corner (centred in viewBox)
  const rectX = cx - meltW / 2;
  const rectY = cy - meltH / 2;

  // Fixed canvas — height never changes so siblings never shift.
  const canvasH = Math.round(size * 1.28);
  // Puddle sits just below the diamond's bottom vertex.
  const puddleCY = size * 1.06;

  // Puddle grows in proportion to how much ice has melted.
  const puddleGrow = progress > 0.05 ? Math.min(progress * 1.8, 1) : 0;

  const bodyId = `body_${iceProfile}`;
  const shadowId = `shadow_${iceProfile}`;
  const puddleId = `puddle_${iceProfile}`;
  const completePuddleId = `cpuddle_${iceProfile}`;

  // ── Complete: only puddle remains ──
  if (state === 'complete') {
    return (
      <Animated.View style={[{ width: size, height: canvasH }, animStyle]}>
        <Svg width={size} height={canvasH} viewBox={`0 0 ${size} ${canvasH}`}>
          <Defs>
            <RadialGradient id={completePuddleId} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={c.mid} stopOpacity={0.75} />
              <Stop offset="0.55" stopColor={c.top} stopOpacity={0.45} />
              <Stop offset="1" stopColor={c.top} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx={cx} cy={puddleCY} rx={side * 0.72} ry={side * 0.24} fill={`url(#${completePuddleId})`} />
          <Ellipse cx={cx} cy={puddleCY} rx={side * 0.38} ry={side * 0.1} fill={c.mid} opacity={0.35} />
        </Svg>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ width: size, height: canvasH }, animStyle]}>
      <Svg width={size} height={canvasH} viewBox={`0 0 ${size} ${canvasH}`}>
        <Defs>
          <LinearGradient id={bodyId} x1="0.3" y1="0" x2="0.7" y2="1">
            <Stop offset="0" stopColor={c.top} />
            <Stop offset="0.42" stopColor={c.mid} />
            <Stop offset="1" stopColor={c.deep} />
          </LinearGradient>

          <RadialGradient id={shadowId} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={c.shadow} stopOpacity={0.22} />
            <Stop offset="1" stopColor={c.shadow} stopOpacity={0} />
          </RadialGradient>

          <RadialGradient id={puddleId} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={c.mid} stopOpacity={0.6} />
            <Stop offset="1" stopColor={c.top} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Drop shadow shrinks with the cube */}
        {meltH > 0 && (
          <Ellipse
            cx={cx}
            cy={cy + meltH * 0.6}
            rx={meltW * 0.55}
            ry={meltW * 0.08}
            fill={`url(#${shadowId})`}
          />
        )}

        {/* Puddle — grows as ice is lost, stays after cube is gone */}
        {puddleGrow > 0 && (
          <Ellipse
            cx={cx}
            cy={puddleCY}
            rx={side * 0.44 * puddleGrow}
            ry={side * 0.13 * puddleGrow}
            fill={`url(#${puddleId})`}
          />
        )}

        {/* ── Ice cube body ──
            meltH shrinks to 0 at progress=1 so the cube physically disappears
            by collapsing flat rather than fading out. */}
        {meltH > 0 && (
          <>
            <Rect
              x={rectX}
              y={rectY}
              width={meltW}
              height={meltH}
              rx={cornerR}
              ry={cornerR}
              fill={`url(#${bodyId})`}
              transform={`rotate(45, ${cx}, ${cy})`}
            />

            {/* Highlight blob — fades naturally as cube flattens */}
            <Ellipse
              cx={cx - side * 0.08}
              cy={cy - meltH * 0.3}
              rx={side * 0.2 * (meltH / side)}
              ry={side * 0.13 * (meltH / side)}
              fill="rgba(255,255,255,0.72)"
              transform={`rotate(-32, ${cx - side * 0.08}, ${cy - meltH * 0.3})`}
            />

            {/* Specular dot */}
            <Ellipse
              cx={cx - side * 0.12}
              cy={cy - meltH * 0.38}
              rx={side * 0.07 * (meltH / side)}
              ry={side * 0.045 * (meltH / side)}
              fill="rgba(255,255,255,0.95)"
              transform={`rotate(-20, ${cx - side * 0.12}, ${cy - meltH * 0.38})`}
            />

            {/* Frost crystals (refreezing) */}
            {state === 'refreezing' && (
              <>
                <Rect
                  x={rectX}
                  y={rectY}
                  width={meltW}
                  height={meltH}
                  rx={cornerR}
                  ry={cornerR}
                  fill="rgba(200,235,255,0.25)"
                  transform={`rotate(45, ${cx}, ${cy})`}
                />
                {[
                  { x: cx - 10, y: cy - 14, s: 11 },
                  { x: cx + 14, y: cy + 4, s: 9 },
                  { x: cx - 4, y: cy + 14, s: 7 },
                ].map((shard, i) => (
                  <Rect
                    key={i}
                    x={shard.x - shard.s / 2}
                    y={shard.y - shard.s / 2}
                    width={shard.s}
                    height={shard.s}
                    rx={2}
                    fill="rgba(255,255,255,0.75)"
                    transform={`rotate(45, ${shard.x}, ${shard.y})`}
                  />
                ))}
              </>
            )}

            {/* Pause bars */}
            {state === 'paused' && (
              <>
                <Rect x={cx - 13} y={cy - 14} width={9} height={28} rx={3} fill="rgba(255,255,255,0.9)" />
                <Rect x={cx + 4} y={cy - 14} width={9} height={28} rx={3} fill="rgba(255,255,255,0.9)" />
              </>
            )}
          </>
        )}
      </Svg>
    </Animated.View>
  );
}
