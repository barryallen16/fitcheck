import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import PixelIcon from './PixelIcon';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

export default function ConfirmModal({
  visible = false,
  title = 'CONFIRM ACTION',
  message = '',
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  isDestructive = true,
  onConfirm,
  onCancel,
}) {
  if (!visible) return null;

  const toneColor = isDestructive ? COLORS.red : COLORS.primary;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <Pressable style={s.backdrop} onPress={onCancel}>
        <Pressable style={s.card} onPress={(e) => e.stopPropagation()}>
          <View style={s.headerRow}>
            <View style={[s.badge, { borderColor: toneColor }]}>
              <PixelIcon
                name={isDestructive ? 'info-box' : 'check'}
                size={12}
                color={toneColor}
              />
              <Text style={[s.badgeTxt, { color: toneColor }]}>
                {isDestructive ? '[DANGER]' : '[ACTION]'}
              </Text>
            </View>
            <Text style={s.title} numberOfLines={1}>
              {title}
            </Text>
          </View>

          {message ? <Text style={s.msg}>{message}</Text> : null}

          <View style={s.actionsRow}>
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={onCancel}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={cancelText}
            >
              <Text style={s.cancelTxt}>[{cancelText.toUpperCase()}]</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                s.confirmBtn,
                { backgroundColor: isDestructive ? COLORS.red : COLORS.primary },
              ]}
              onPress={onConfirm}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={confirmText}
            >
              <Text
                style={[
                  s.confirmTxt,
                  { color: isDestructive ? COLORS.white : COLORS.bg },
                ]}
              >
                [{confirmText.toUpperCase()}]
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 10, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: GAP.xl,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: GAP.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP.sm,
    marginBottom: GAP.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: GAP.xs + 2,
    paddingVertical: 2,
    borderRadius: RAD.xs,
    borderWidth: 1,
    backgroundColor: COLORS.cardLight,
  },
  badgeTxt: {
    fontFamily: FONTS.pixel,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  title: {
    flex: 1,
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.sm,
    letterSpacing: 1,
  },
  msg: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    lineHeight: 18,
    marginBottom: GAP.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: GAP.md,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RAD.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  cancelTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    letterSpacing: 1,
  },
  confirmBtn: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RAD.md,
  },
  confirmTxt: {
    fontFamily: FONTS.pixel,
    fontSize: TYPE.xs,
    letterSpacing: 1,
    fontWeight: '600',
  },
});
