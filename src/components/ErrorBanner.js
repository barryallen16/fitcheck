import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import PixelIcon from './PixelIcon';
import { COLORS, TYPE, GAP, FONTS } from '../constants/theme';

export default function ErrorBanner({ message, type = 'error', onDismiss }) {
  const slide = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    Animated.spring(slide, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }).start();
    if (type !== 'error') {
      const t = setTimeout(dismiss, 3500);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    Animated.timing(slide, { toValue: -120, duration: 200, useNativeDriver: true })
      .start(() => onDismiss?.());
  }

  const bg = type === 'error' ? COLORS.red : type === 'success' ? COLORS.green : COLORS.orange;
  const icon = type === 'error' ? 'info-box' : type === 'success' ? 'check' : 'info-box';

  return (
    <Animated.View style={[s.wrap, { backgroundColor: bg, transform: [{ translateY: slide }] }]}>
      <PixelIcon name={icon} size={20} color="#fff" />
      <Text style={s.msg} numberOfLines={3}>{message}</Text>
      <TouchableOpacity
        onPress={dismiss}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={s.closeBtn}
      >
        <PixelIcon name="close" size={16} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: GAP.lg,
    paddingBottom: GAP.md,
    paddingTop: GAP.huge,
    gap: GAP.sm,
  },
  msg: {
    flex: 1,
    color: '#fff',
    fontFamily: FONTS.medium,
    fontSize: TYPE.xs,
  },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
