import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PixelIcon from './PixelIcon';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

export default function ErrorBanner({ message, type = 'error', onDismiss }) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slide, { toValue: 0, tension: 90, friction: 12, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();

    const duration = type === 'error' ? 5000 : 3500;
    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    Animated.parallel([
      Animated.timing(slide, { toValue: -60, duration: 180, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => onDismiss?.());
  }

  const isErr = type === 'error';
  const isOk = type === 'success';
  const isWarn = type === 'warn' || type === 'warning';

  const toneColor = isErr ? COLORS.red : isOk ? COLORS.green : isWarn ? COLORS.orange : COLORS.secondary;
  const tagText = isErr ? '[ERR]' : isOk ? '[OK]' : isWarn ? '[WARN]' : '[SYS]';
  const iconName = isErr ? 'info-box' : isOk ? 'check' : isWarn ? 'info-box' : 'sunglasses';

  const topOffset = Math.max(insets.top, 16) + GAP.xs;

  return (
    <Animated.View
      style={[
        s.floatingWrap,
        {
          top: topOffset,
          borderColor: toneColor,
          opacity,
          transform: [{ translateY: slide }],
        },
      ]}
    >
      <View style={s.bodyRow}>
        <View style={[s.tagWrap, { backgroundColor: COLORS.cardLight, borderColor: toneColor }]}>
          <PixelIcon name={iconName} size={14} color={toneColor} />
          <Text style={[s.tagTxt, { color: toneColor }]}>{tagText}</Text>
        </View>

        <Text style={s.msg} numberOfLines={2}>
          {message}
        </Text>

        <TouchableOpacity
          onPress={dismiss}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={s.closeBtn}
          accessibilityLabel="Dismiss notification"
          accessibilityRole="button"
        >
          <PixelIcon name="close" size={14} color={COLORS.textDim} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  floatingWrap: {
    position: 'absolute',
    left: GAP.lg,
    right: GAP.lg,
    zIndex: 9999,
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    borderWidth: 1,
    paddingVertical: GAP.sm + 2,
    paddingHorizontal: GAP.md,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP.sm,
  },
  tagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: GAP.xs + 2,
    paddingVertical: 2,
    borderRadius: RAD.xs,
    borderWidth: 1,
  },
  tagTxt: {
    fontFamily: FONTS.pixel,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  msg: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONTS.medium,
    fontSize: TYPE.xs,
    lineHeight: 16,
  },
  closeBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
