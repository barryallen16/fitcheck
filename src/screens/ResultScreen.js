import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS, TYPE, GAP, RAD } from '../constants/theme';
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
        topId: topG?.id || null, bottomId: botG?.id || null,
        topLabel: rec.top_label, bottomLabel: rec.bottom_label,
        colorLogic: rec.colorLogic, silhouetteLogic: rec.silhouetteLogic,
        weather: w.formatted, weatherCity: w.city,
        score: rec.score || null,
        probability: rec.probability || null,
        rationale: rec.rationale || null,
      });
      setOutfitId(o.id);
    }
  }, []);

  function weatherIcon() {
    const d = w.description.toLowerCase();
    if (d.includes('rain') || d.includes('drizzle')) return 'rainy';
    if (d.includes('cloud') || d.includes('overcast')) return 'cloudy';
    if (d.includes('snow')) return 'snow';
    return 'sunny';
  }

  function Piece({ label, garment, title }) {
    if (!label || label === 'N/A') return null;
    return (
      <View style={s.piece}>
        <Text style={s.pieceLabel}>{title}</Text>
        <View style={[s.pieceCard, garment && s.pieceMatched]}>
          {garment ? (
            <><Image source={{ uri: garment.imageUri }} style={s.pieceImg} />
            <View style={{ flex: 1, marginLeft: GAP.md }}>
              <Text style={s.pieceName}>{garment.summary}</Text>
              <Text style={s.pieceCat}>{garment.category}</Text>
              <Text style={s.pieceDesc} numberOfLines={2}>{garment.analyzed_garment}</Text>
            </View></>
          ) : (
            <View style={s.noMatch}><Text style={s.noMatchTxt}>"{label}"</Text></View>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.hdr}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: GAP.xs }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.hdrTitle}>Your Outfit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.savedBanner}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
          <Text style={s.savedTxt}>Saved to history</Text>
        </View>

        <View style={s.weatherCard}>
          <Ionicons name={weatherIcon()} size={26} color={COLORS.primary} />
          <View style={{ flex: 1, marginLeft: GAP.md }}>
            <Text style={s.weatherMain}>{w.formatted}</Text>
            <Text style={s.weatherCity}>{w.city}{w.fallback ? ' (est)' : ''}</Text>
          </View>
        </View>

        <Text style={s.secLabel}>Recommended Outfit</Text>
        <Piece label={rec.top_label} garment={topG} title="Top / Upper" />
        <Piece label={rec.bottom_label} garment={botG} title="Bottom / Lower" />

        {rec.compatibility && (
          <View style={s.compatCard}>
            <View style={s.compatHdr}>
              <View style={s.compatTitleRow}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                <Text style={s.compatTitle}>Task B Model Compatibility</Text>
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

        <View style={s.logicCard}>
          <View style={s.logicSec}>
            <View style={s.logicHdr}><Ionicons name="color-palette-outline" size={18} color={COLORS.primary} /><Text style={s.logicTitle}>Color Logic</Text></View>
            <Text style={s.logicBody}>{rec.colorLogic}</Text>
          </View>
          <View style={s.logicDiv} />
          <View style={s.logicSec}>
            <View style={s.logicHdr}><Ionicons name="body-outline" size={18} color={COLORS.accent} /><Text style={s.logicTitle}>Silhouette Logic</Text></View>
            <Text style={s.logicBody}>{rec.silhouetteLogic}</Text>
          </View>
        </View>

        {/* Wear */}
        <TouchableOpacity
          style={[s.wearBtn, worn && s.wornBtn]}
          onPress={() => { if (outfitId && !worn) { wearOutfit(outfitId, todayStr()); setWorn(true); } }}
          activeOpacity={0.8} disabled={worn}
        >
          <Ionicons name={worn ? 'checkmark-circle' : 'shirt-outline'} size={22} color={worn ? COLORS.green : COLORS.bg} />
          <Text style={[s.wearTxt, worn && { color: COLORS.green }]}>
            {worn ? 'Marked as Worn!' : 'Wear Today'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.retryBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="refresh" size={20} color={COLORS.primary} />
          <Text style={s.retryTxt}>Generate Another</Text>
        </TouchableOpacity>

        <View style={s.bottomRow}>
          <TouchableOpacity style={s.bottomBtn} onPress={() => navigation.navigate('OutfitHistory')}>
            <Ionicons name="layers-outline" size={18} color={COLORS.accent} />
            <Text style={s.bottomBtnTxt}>History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg },
  hdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: GAP.lg, paddingVertical: GAP.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  hdrTitle: { color: COLORS.text, fontSize: TYPE.xl, fontWeight: '700' },
  scroll: { paddingHorizontal: GAP.xl, paddingTop: GAP.lg, paddingBottom: GAP.huge * 2 },
  savedBanner: { flexDirection: 'row', alignItems: 'center', gap: GAP.sm, backgroundColor: COLORS.green + '12', borderRadius: RAD.md, padding: GAP.md, marginBottom: GAP.lg, borderWidth: 1, borderColor: COLORS.green + '30' },
  savedTxt: { color: COLORS.green, fontSize: TYPE.sm, fontWeight: '500' },
  weatherCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RAD.lg, padding: GAP.lg, marginBottom: GAP.xl, borderWidth: 1, borderColor: COLORS.border },
  weatherMain: { color: COLORS.text, fontSize: TYPE.lg, fontWeight: '700' },
  weatherCity: { color: COLORS.textDim, fontSize: TYPE.sm, marginTop: 2 },
  secLabel: { color: COLORS.textDim, fontSize: TYPE.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: GAP.md },
  piece: { marginBottom: GAP.lg },
  pieceLabel: { color: COLORS.textMuted, fontSize: TYPE.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: GAP.sm },
  pieceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RAD.lg, padding: GAP.lg, borderWidth: 1, borderColor: COLORS.border },
  pieceMatched: { borderColor: COLORS.primaryMuted },
  pieceImg: { width: 76, height: 76, borderRadius: RAD.md, backgroundColor: COLORS.cardLight },
  pieceName: { color: COLORS.text, fontSize: TYPE.lg, fontWeight: '700' },
  pieceCat: { color: COLORS.primary, fontSize: TYPE.xs, fontWeight: '700', textTransform: 'uppercase', marginTop: GAP.xs },
  pieceDesc: { color: COLORS.textDim, fontSize: TYPE.xs, marginTop: GAP.xs, lineHeight: 16 },
  noMatch: { flex: 1, alignItems: 'center', paddingVertical: GAP.md },
  noMatchTxt: { color: COLORS.text, fontSize: TYPE.base, fontWeight: '600' },
  compatCard: { backgroundColor: COLORS.primaryGlow, borderRadius: RAD.lg, padding: GAP.lg, marginBottom: GAP.lg, borderWidth: 1, borderColor: COLORS.primaryMuted },
  compatHdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: GAP.sm },
  compatTitleRow: { flexDirection: 'row', alignItems: 'center', gap: GAP.xs },
  compatTitle: { color: COLORS.text, fontSize: TYPE.sm, fontWeight: '700' },
  compatBadge: { backgroundColor: COLORS.primary, paddingHorizontal: GAP.sm, paddingVertical: 2, borderRadius: RAD.full },
  compatBadgeTxt: { color: COLORS.bg, fontSize: TYPE.xs, fontWeight: '700' },
  compatRationale: { color: COLORS.text, fontSize: TYPE.sm, lineHeight: 20 },
  logicCard: { backgroundColor: COLORS.card, borderRadius: RAD.lg, padding: GAP.xl, marginBottom: GAP.xl, borderWidth: 1, borderColor: COLORS.border },
  logicSec: { marginVertical: GAP.sm },
  logicHdr: { flexDirection: 'row', alignItems: 'center', gap: GAP.sm, marginBottom: GAP.sm },
  logicTitle: { color: COLORS.text, fontSize: TYPE.base, fontWeight: '700' },
  logicBody: { color: COLORS.textDim, fontSize: TYPE.sm, lineHeight: 22 },
  logicDiv: { height: 1, backgroundColor: COLORS.border, marginVertical: GAP.md },
  wearBtn: { flexDirection: 'row', backgroundColor: COLORS.green, borderRadius: RAD.lg, paddingVertical: GAP.lg, justifyContent: 'center', alignItems: 'center', gap: GAP.sm, marginBottom: GAP.md },
  wornBtn: { backgroundColor: COLORS.green + '15', borderWidth: 1, borderColor: COLORS.green + '40' },
  wearTxt: { color: COLORS.bg, fontSize: TYPE.base, fontWeight: '700' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryGlow, borderRadius: RAD.lg, paddingVertical: GAP.lg, gap: GAP.sm, borderWidth: 1, borderColor: COLORS.primaryMuted, marginBottom: GAP.lg },
  retryTxt: { color: COLORS.primary, fontSize: TYPE.base, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', gap: GAP.xxxl },
  bottomBtn: { flexDirection: 'row', alignItems: 'center', gap: GAP.sm, padding: GAP.md },
  bottomBtnTxt: { color: COLORS.textDim, fontSize: TYPE.sm, fontWeight: '500' },
});