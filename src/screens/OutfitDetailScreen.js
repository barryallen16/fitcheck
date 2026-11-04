import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PixelIcon from '../components/PixelIcon';
import { useApp } from '../context/AppContext';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';
import { todayStr } from '../utils/helpers';

const W = Dimensions.get('window').width;

export default function OutfitDetailScreen({ route, navigation }) {
  const { outfitId } = route.params;
  const { outfits, wardrobe, wearOutfit, unwearOutfit } = useApp();

  const outfit = outfits.find((o) => o.id === outfitId);
  const topG = wardrobe.find((g) => g.id === outfit?.topId);
  const botG = wardrobe.find((g) => g.id === outfit?.bottomId);
  const isWorn = outfit?.status === 'worn';

  if (!outfit) {
    return (
      <SafeAreaView style={s.c} edges={['top']}>
        <View style={s.center}>
          <Text style={s.errTxt}>OUTFIT NOT FOUND</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backLink}>
            <Text style={s.backLinkTxt}>Return to wardrobe</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  function Piece({ label, garment, title }) {
    if (!label || label === 'N/A') return null;
    return (
      <View style={s.piece}>
        <Text style={s.pieceTitle}>{title}</Text>
        <View style={s.pieceCard}>
          {garment ? (
            <>
              <Image source={{ uri: garment.imageUri }} style={s.pieceImg} />
              <View style={{ flex: 1, marginLeft: GAP.md }}>
                <Text style={s.pieceName}>{garment.summary}</Text>
                <View style={s.pieceBadge}>
                  <Text style={s.pieceCat}>{garment.category}</Text>
                </View>
                <Text style={s.pieceDesc} numberOfLines={3}>{garment.analyzed_garment}</Text>
              </View>
            </>
          ) : (
            <View style={s.noMatch}>
              <PixelIcon name="info-box" size={24} color={COLORS.textMuted} />
              <Text style={s.noMatchTxt}>"{label}"</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.hdr}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <PixelIcon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.hdrTitle}>OUTFIT DETAIL</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Weather Card */}
        <View style={s.weatherCard}>
          <View style={s.weatherIconWrap}>
            <PixelIcon name="sun" size={20} color={COLORS.secondary} />
          </View>
          <View style={{ flex: 1, marginLeft: GAP.md }}>
            <Text style={s.weatherMain}>{outfit.weather || 'Standard Forecast'}</Text>
            {outfit.weatherCity ? <Text style={s.weatherCity}>{outfit.weatherCity}</Text> : null}
          </View>
          {isWorn && (
            <View style={s.wornTag}>
              <PixelIcon name="check" size={12} color={COLORS.green} />
              <Text style={s.wornTagTxt}>WORN {outfit.wornDate}</Text>
            </View>
          )}
        </View>

        {/* Task B Model Match */}
        {outfit.score != null && (
          <View style={s.compatCard}>
            <View style={s.compatHdr}>
              <View style={s.compatTitleRow}>
                <PixelIcon name="shield" size={16} color={COLORS.secondary} />
                <Text style={s.compatTitle}>TASK B COMPATIBILITY</Text>
              </View>
              <View style={s.compatBadge}>
                <Text style={s.compatBadgeTxt}>
                  {Math.round((outfit.probability || (outfit.score / 5)) * 100)}% MATCH
                </Text>
              </View>
            </View>
            {outfit.rationale ? <Text style={s.compatRationale}>{outfit.rationale}</Text> : null}
          </View>
        )}

        {/* Garments in Outfit */}
        <Text style={s.secLabel}>ENSEMBLE PIECES</Text>
        <Piece label={outfit.topLabel} garment={topG} title="TOP / UPPER" />
        <Piece label={outfit.bottomLabel} garment={botG} title="BOTTOM / LOWER" />

        {/* Styling Logic */}
        <View style={s.logicCard}>
          {outfit.colorLogic ? (
            <View style={s.logicSec}>
              <View style={s.logicHdr}>
                <PixelIcon name="sunglasses" size={16} color={COLORS.primary} />
                <Text style={s.logicTitle}>COLOR LOGIC</Text>
              </View>
              <Text style={s.logicBody}>{outfit.colorLogic}</Text>
            </View>
          ) : null}

          {outfit.colorLogic && outfit.silhouetteLogic ? <View style={s.logicDiv} /> : null}

          {outfit.silhouetteLogic ? (
            <View style={s.logicSec}>
              <View style={s.logicHdr}>
                <PixelIcon name="user" size={16} color={COLORS.secondary} />
                <Text style={s.logicTitle}>SILHOUETTE LOGIC</Text>
              </View>
              <Text style={s.logicBody}>{outfit.silhouetteLogic}</Text>
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[s.wearBtn, isWorn && s.wornBtn]}
          onPress={() => (isWorn ? unwearOutfit(outfit.id) : wearOutfit(outfit.id, todayStr()))}
          activeOpacity={0.8}
        >
          <PixelIcon
            name={isWorn ? 'close' : 'check'}
            size={18}
            color={isWorn ? COLORS.orange : COLORS.white}
          />
          <Text style={[s.wearBtnTxt, isWorn && { color: COLORS.orange }]}>
            {isWorn ? 'MARK AS UNWORN' : 'WEAR TODAY'}
          </Text>
        </TouchableOpacity>

        <Text style={s.dateTxt}>Generated on {new Date(outfit.createdAt).toLocaleDateString()}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: GAP.xxl },
  errTxt: { fontFamily: FONTS.pixel, color: COLORS.red, fontSize: TYPE.sm, letterSpacing: 1 },
  backLink: { marginTop: GAP.lg, minHeight: 44, justifyContent: 'center' },
  backLinkTxt: { fontFamily: FONTS.regular, color: COLORS.textDim, fontSize: TYPE.sm },

  hdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GAP.lg,
    paddingVertical: GAP.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hdrTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.base,
    letterSpacing: 1.5,
  },
  scroll: {
    paddingHorizontal: GAP.lg,
    paddingTop: GAP.lg,
    paddingBottom: GAP.huge * 2,
  },

  secLabel: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: GAP.sm,
  },

  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    marginBottom: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weatherIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RAD.sm,
    backgroundColor: COLORS.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherMain: {
    fontFamily: FONTS.medium,
    color: COLORS.text,
    fontSize: TYPE.sm,
  },
  weatherCity: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    marginTop: 2,
  },
  wornTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP.xs,
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: GAP.sm,
    paddingVertical: GAP.xs,
    borderRadius: RAD.sm,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  wornTagTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.green,
    fontSize: 9,
    letterSpacing: 0.5,
  },

  piece: {
    marginBottom: GAP.md,
  },
  pieceTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: GAP.xs,
  },
  pieceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pieceImg: {
    width: 72,
    height: 72,
    borderRadius: RAD.sm,
    backgroundColor: COLORS.cardLight,
  },
  pieceName: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: TYPE.base,
  },
  pieceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondaryMuted + '30',
    paddingHorizontal: GAP.xs + 2,
    paddingVertical: 2,
    borderRadius: RAD.xs,
    marginTop: GAP.xs,
  },
  pieceCat: {
    fontFamily: FONTS.pixel,
    color: COLORS.secondary,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  pieceDesc: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    marginTop: GAP.xs,
    lineHeight: 16,
  },
  noMatch: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: GAP.md,
    gap: GAP.xs,
  },
  noMatchTxt: {
    fontFamily: FONTS.medium,
    color: COLORS.text,
    fontSize: TYPE.sm,
  },

  compatCard: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    marginBottom: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.secondaryMuted,
  },
  compatHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: GAP.xs,
  },
  compatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP.xs,
  },
  compatTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: 10,
    letterSpacing: 1,
  },
  compatBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: GAP.sm,
    paddingVertical: 3,
    borderRadius: RAD.xs,
  },
  compatBadgeTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.bg,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  compatRationale: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    lineHeight: 18,
    marginTop: GAP.xs,
  },

  logicCard: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    marginBottom: GAP.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logicSec: {
    marginVertical: GAP.xs,
  },
  logicHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP.xs,
    marginBottom: GAP.xs,
  },
  logicTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: 10,
    letterSpacing: 1,
  },
  logicBody: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    lineHeight: 18,
  },
  logicDiv: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: GAP.sm,
  },

  wearBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: RAD.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: GAP.sm,
    marginBottom: GAP.md,
  },
  wornBtn: {
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  wearBtnTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.white,
    fontSize: 11,
    letterSpacing: 1,
  },

  dateTxt: {
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontSize: TYPE.xs,
    textAlign: 'center',
  },
});
