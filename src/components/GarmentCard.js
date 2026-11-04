import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PixelIcon from './PixelIcon';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

export default function GarmentCard({ garment, onPress, onDelete, isSelected, selectable }) {
  return (
    <TouchableOpacity
      style={[s.card, isSelected && s.selected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {selectable && (
        <View style={[s.check, isSelected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
          {isSelected && <PixelIcon name="check" size={12} color="#0B0C10" />}
        </View>
      )}

      <Image source={{ uri: garment.imageUri }} style={s.img} />

      <View style={s.info}>
        <View style={s.badge}>
          <Text style={s.badgeTxt}>{garment.category}</Text>
        </View>
        <Text style={s.title} numberOfLines={2}>{garment.summary}</Text>
        <Text style={s.desc} numberOfLines={2}>{garment.analyzed_garment}</Text>
      </View>

      {onDelete && (
        <TouchableOpacity
          style={s.del}
          onPress={() => onDelete(garment.id)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <PixelIcon name="trash" size={16} color={COLORS.red} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    marginBottom: GAP.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.cardLight,
  },
  check: {
    position: 'absolute',
    top: GAP.sm,
    left: GAP.sm,
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: 72,
    height: 72,
    borderRadius: RAD.sm,
    backgroundColor: COLORS.cardLight,
  },
  info: {
    flex: 1,
    marginLeft: GAP.md,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: GAP.sm,
    paddingVertical: 1,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  badgeTxt: {
    fontFamily: FONTS.pixel,
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: TYPE.sm,
    marginBottom: 2,
  },
  desc: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    lineHeight: 16,
  },
  del: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: GAP.xs,
  },
});
