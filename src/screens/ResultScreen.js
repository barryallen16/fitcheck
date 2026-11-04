import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import PixelIcon from '../components/PixelIcon';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';
import { todayStr } from '../utils/helpers';

export default function ResultScreen({ route, navigation }) {
  const { recommendation: rec, weather: w, wardrobe } = route.params;
  const { addOutfit, wearOutfit } = useApp();
  const savedRef = useRef(false);
  const [outfitId, setOutfitId] = useState(null);
  const [worn, setWorn] = useState(false);

  const topG = rec._topGarment || wardrobe.find((g) => g.summary === rec.top_label);
  const botG = rec._bottomGarment || wardrobe.find((g) => g.summary === rec.bottom_label);

  useEffect(() => {
    if (!savedRef.current) {
      savedRef.current = true;
      const o = addOutfit({
        topId: topG?.id || null,
        bottomId: botG?.id || null,
        topLabel: rec.top_label,
        bottomLabel: rec.bottom_label,
        colorLogic: rec.colorLogic,
        silhouetteLogic: rec.silhouetteLogic,
        weather: w.formatted,
        weatherCity: w.city,
        score: rec.score || null,
        probability: rec.probability || null,
        rationale: rec.rationale || null,
      });
      setOutfitId(o.id);
    }
  }, []);

  function weatherIconName() {
    const d = (w.description || '').toLowerCase();
    if (d.includes('rain') || d.includes('drizzle')) return 'cloud';
    if (d.includes('cloud') || d.includes('overcast')) return 'cloud';
    return 'sun';
  }

  function Piece({ label, garment, title }) {
    if (!label || label === 'N/A') return null;
    return (
      <View style={s.piece}>
        <Text style={s.pieceLabel}>{title}</Text>
        <View style={s.pieceCard}>
          {garment ? (
            <>
              <Image source={{ uri: garment.imageUri }} style={s.pieceImg} />
              <View style={{ flex: 1, marginLeft: GAP.md }}>
                <Text style={s.pieceName}>{garment.summary}</Text>
                <Text style={s.pieceCat}>{garment.category}</Text>
                <Text style={s.pieceDesc} numberOfLines={2}>{garment.analyzed_garment}</Text>
              </View>
            </>
          ) : (
            <View style={s.noMatch}><Text style={s.noMatchTxt}>"{label}"</Text></View>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      {/* Header */}
      <View style={s.hdr}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <PixelIcon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.hdrTitle}>YOUR OUTFIT</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Saved Tag */}
        <View style={s.savedBanner}>
          <PixelIcon name="check" size={14} color={COLORS.green} />
          <Text style={s.savedTxt}>Saved to Outfit History</Text>
        </View>

        {/* Weather Card */}
        <View style={s.weatherCard}>
          <PixelIcon name={weatherIconName()} size={24} color={COLORS.secondary} />
          <View style={{ flex: 1, marginLeft: GAP.md }}>
            <Text style={s.weatherMain}>{w.formatted}</Text>
            <Text style={s.weatherCity}>{w.city}{w.fallback ? ' (estimated)' : ''}</Text>
          </View>
        </View>

        {/* Recommended Garments */}
        <Text style={s.secLabel}>RECOMMENDED PAIRING</Text>
        <Piece label={rec.top_label} garment={topG} title="TOP / UPPER" />
        <Piece label={rec.bottom_label} garment={botG} title="BOTTOM / LOWER" />

        {/* Task B Model Compatibility Card */}
        {rec.compatibility && (
          <View style={s.compatCard}>
            <View style={s.compatHdr}>
              <View style={s.compatTitleRow}>
                <PixelIcon name="shield" size={16} color={COLORS.secondary} />
                <Text style={s.compatTitle}>TASK B COMPATIBILITY</Text>
              </View>
              <View style={s.compatBadge}>
                <Text style={s.compatBadgeTxt}>
                  {Math.round((rec.probability || (rec.score / 5)) * 100)}% Match
                </Text>
              </View>
            </View>
            <Text style={s.compatRationale}>{rec.rationale || rec.compatibility.rationale}</Text>
          </View>
        )}

        {/* Styling Logic Details */}
        <View style={s.logicCard}>
          <View style={s.logicSec}>
            <View style={s.logicHdr}>
              <PixelIcon name="sparkles" size={14} color={COLORS.primary} />
              <Text style={s.logicTitle}>COLOR HARMONY</Text>
            </View>
            <Text style={s.logicBody}>{rec.colorLogic}</Text>
          </View>

          <View style={s.logicDiv} />

          <View style={s.logicSec}>
            <View style={s.logicHdr}>
              <PixelIcon name="user" size={14} color={COLORS.secondary} />
              <Text style={[s.logicTitle, { color: COLORS.secondary }]}>SILHOUETTE LOGIC</Text>
            </View>
            <Text style={s.logicBody}>{rec.silhouetteLogic}</Text>
          </View>
        </View>

        {/* Primary Action Button (Von Restorff Effect) */}
        <TouchableOpacity
          style={[s.wearBtn, worn && s.wornBtn]}
          onPress={() => { if (outfitId && !worn) { wearOutfit(outfitId, todayStr()); setWorn(true); } }}
          activeOpacity={0.8}
          disabled={worn}
        >
          <PixelIcon
            name={worn ? 'check' : 'heart'}
            size={20}
            color={worn ? COLORS.green : '#0B0C10'}
          />
          <Text style={[s.wearTxt, worn && { color: COLORS.green }]}>
            {worn ? 'MARKED AS WORN TODAY' : 'WEAR TODAY'}
          </Text>
        </TouchableOpacity>

        {/* Secondary Actions */}
        <TouchableOpacity
          style={s.retryBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <PixelIcon name="refresh" size={18} color={COLORS.primary} />
          <Text style={s.retryTxt}>GENERATE ANOTHER</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.bottomBtn}
          onPress={() => navigation.navigate('OutfitHistory')}
        >
          <Text style={s.bottomBtnTxt}>VIEW HISTORY ARCHIVE</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg },

  hdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GAP.lg,
    paddingVertical: GAP.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  hdrTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.sm,
    letterSpacing: 1.5,
  },

  scroll: { paddingHorizontal: GAP.lg, paddingTop: GAP.lg, paddingBottom: GAP.huge },

  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP.xs,
    marginBottom: GAP.md,
  },
  savedTxt: {
    fontFamily: FONTS.regular,
    color: COLORS.green,
    fontSize: TYPE.xs,
  },

  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: GAP.lg,
  },
  weatherMain: {
    fontFamily: FONTS.bold,
    fontSize: TYPE.base,
    color: COLORS.text,
  },
  weatherCity: {
    fontFamily: FONTS.regular,
    fontSize: TYPE.xs,
    color: COLORS.textDim,
  },

  secLabel: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: GAP.sm,
  },

  piece: { marginBottom: GAP.md },
  pieceLabel: {
    fontFamily: FONTS.pixel,
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 4,
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
    width: 68,
    height: 68,
    borderRadius: RAD.sm,
    backgroundColor: COLORS.cardLight,
  },
  pieceName: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: TYPE.sm,
  },
  pieceCat: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  pieceDesc: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    marginTop: 2,
    lineHeight: 16,
  },
  noMatch: { padding: GAP.md },
  noMatchTxt: {
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontSize: TYPE.xs,
  },

  compatCard: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: GAP.md,
  },
  compatHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: GAP.sm,
  },
  compatTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP.xs,
  },
  compatTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.secondary,
    fontSize: 10,
    letterSpacing: 1,
  },
  compatBadge: {
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: GAP.sm,
    paddingVertical: 2,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  compatBadgeTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.secondary,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  compatRationale: {
    fontFamily: FONTS.regular,
    color: COLORS.text,
    fontSize: TYPE.xs,
    lineHeight: 18,
  },

  logicCard: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: GAP.xl,
  },
  logicSec: {},
  logicHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP.xs,
    marginBottom: 4,
  },
  logicTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 9,
    letterSpacing: 1,
  },
  logicBody: {
    fontFamily: FONTS.regular,
    color: COLORS.text,
    fontSize: TYPE.xs,
    lineHeight: 18,
  },
  logicDiv: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: GAP.md,
  },

  wearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RAD.md,
    paddingVertical: GAP.lg,
    gap: GAP.sm,
    minHeight: 56,
    marginBottom: GAP.sm,
  },
  wornBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.green,
  },
  wearTxt: {
    fontFamily: FONTS.pixel,
    color: '#0B0C10',
    fontSize: TYPE.sm,
    letterSpacing: 1,
  },

  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    paddingVertical: GAP.md,
    gap: GAP.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
    marginBottom: GAP.sm,
  },
  retryTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: TYPE.xs,
    letterSpacing: 1,
  },

  bottomBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: GAP.md,
    minHeight: 44,
  },
  bottomBtnTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1,
  },
});
