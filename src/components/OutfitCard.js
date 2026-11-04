import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import PixelIcon from './PixelIcon';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

export default function OutfitCard({ outfit, wardrobe, onWear, onUnwear, onDelete, onPress }) {
  const topG = wardrobe.find((g) => g.id === outfit.topId);
  const botG = wardrobe.find((g) => g.id === outfit.bottomId);
  const isWorn = outfit.status === 'worn';

  return (
    <TouchableOpacity
      style={[s.card, isWorn && s.cardWorn]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={s.imgRow}>
        {topG ? (
          <Image source={{ uri: topG.imageUri }} style={s.img} />
        ) : (
          <View style={[s.img, s.ph]}>
            <PixelIcon name="briefcase" size={18} color={COLORS.textMuted} />
          </View>
        )}
        {outfit.bottomLabel !== 'N/A' && (
          botG ? (
            <Image source={{ uri: botG.imageUri }} style={s.img} />
          ) : (
            <View style={[s.img, s.ph]}>
              <PixelIcon name="shirt" size={18} color={COLORS.textMuted} />
            </View>
          )
        )}
      </View>

      <View style={s.info}>
        <Text style={s.topLabel} numberOfLines={1}>{outfit.topLabel}</Text>
        {outfit.bottomLabel !== 'N/A' && (
          <Text style={s.botLabel} numberOfLines={1}>+ {outfit.bottomLabel}</Text>
        )}
        <Text style={s.weather} numberOfLines={1}>{outfit.weather}</Text>

        <View style={s.tagRow}>
          {isWorn && (
            <View style={s.wornTag}>
              <PixelIcon name="check" size={10} color={COLORS.green} />
              <Text style={s.wornTagTxt}>{outfit.wornDate}</Text>
            </View>
          )}
          {outfit.score && (
            <View style={s.scoreTag}>
              <PixelIcon name="shield" size={10} color={COLORS.secondary} />
              <Text style={s.scoreTagTxt}>
                {Math.round((outfit.probability || (outfit.score / 5)) * 100)}%
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={s.actions}>
        {isWorn ? (
          <TouchableOpacity
            onPress={() => onUnwear?.(outfit.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={s.actBtn}
          >
            <PixelIcon name="close" size={16} color={COLORS.orange} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => onWear?.(outfit.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={s.actBtn}
          >
            <PixelIcon name="check" size={16} color={COLORS.green} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => onDelete?.(outfit.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={s.actBtn}
        >
          <PixelIcon name="trash" size={16} color={COLORS.red} />
        </TouchableOpacity>
      </View>

      <PixelIcon name="chevron-right" size={16} color={COLORS.textMuted} style={{ marginLeft: 2 }} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    marginBottom: GAP.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardWorn: {
    borderColor: 'rgba(52, 211, 153, 0.25)',
    backgroundColor: 'rgba(52, 211, 153, 0.03)',
  },
  imgRow: {
    flexDirection: 'row',
    gap: 4,
  },
  img: {
    width: 48,
    height: 48,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.cardLight,
  },
  ph: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: GAP.md,
  },
  topLabel: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: TYPE.sm,
  },
  botLabel: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    marginTop: 1,
  },
  weather: {
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: GAP.xs,
    marginTop: 4,
  },
  wornTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RAD.xs,
  },
  wornTagTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.green,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  scoreTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(5, 147, 198, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RAD.xs,
  },
  scoreTagTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.secondary,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: GAP.xs,
  },
  actBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
