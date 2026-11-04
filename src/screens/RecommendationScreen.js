import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import PixelIcon from '../components/PixelIcon';
import lm from '../services/lmStudioService';
import weather from '../services/weatherService';
import ErrorBanner from '../components/ErrorBanner';
import BaseGarmentSelector from '../components/BaseGarmentSelector';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';
import { getSlotLabel, isTop, isBottom, isFullBody, getMaxOutfits, getUnusedCombinations } from '../utils/helpers';

const LOAD_MSGS = [
  { msg: 'Scanning Wardrobe', sub: 'Filtering tops and bottoms...' },
  { msg: 'Evaluating Pairs', sub: 'Running Task B compatibility judge...' },
  { msg: 'Calibrating Match', sub: 'Color harmony & silhouette logic...' },
  { msg: 'Finalizing Look', sub: 'Almost ready...' },
];

export default function RecommendationScreen({ navigation }) {
  const { wardrobe, outfits, serverOk, isExhausted } = useApp();
  const [baseId, setBaseId] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadIdx, setLoadIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [banner, setBanner] = useState(null);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.94, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseLoop.start();

      const shimmerLoop = Animated.loop(
        Animated.timing(shimmerAnim, { toValue: 1, duration: 1500, useNativeDriver: false })
      );
      shimmerLoop.start();

      return () => {
        pulseLoop.stop();
        shimmerLoop.stop();
      };
    }
  }, [loading]);

  const base = wardrobe.find((g) => g.id === baseId);
  const topCount = wardrobe.filter((g) => isTop(g.category) || isFullBody(g.category)).length;
  const botCount = wardrobe.filter((g) => isBottom(g.category)).length;
  const maxOutfits = getMaxOutfits(wardrobe);
  const unusedCount = getUnusedCombinations(wardrobe, outfits).length;
  const exhausted = isExhausted();

  function startCycle() {
    setLoadIdx(0);
    setElapsed(0);
    intervalRef.current = setInterval(() => {
      setLoadIdx((p) => (p + 1) % LOAD_MSGS.length);
    }, 2200);
    timerRef.current = setInterval(() => {
      setElapsed((p) => p + 1);
    }, 1000);
  }

  function stopCycle() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  async function go() {
    if (!serverOk) { setBanner({ message: 'Connect to AI endpoint first', type: 'error' }); return; }
    if (topCount === 0) { setBanner({ message: 'Need at least 1 top garment', type: 'warning' }); return; }

    if (exhausted) {
      Alert.alert(
        'All Outfits Generated! 🎉',
        `All ${maxOutfits} possible outfit combinations from your current wardrobe have been generated.\n\nCheck your Outfit History to browse and pick one!`,
        [
          { text: 'View History', onPress: () => navigation.navigate('OutfitHistory') },
          { text: 'OK', style: 'cancel' },
        ]
      );
      return;
    }

    setLoading(true);
    startCycle();
    try {
      const w = await weather.get();
      const rec = await lm.getRecommendation(w.formatted, wardrobe, baseId, outfits);

      navigation.navigate('Result', {
        recommendation: rec,
        weather: w,
        wardrobe,
        baseGarmentId: baseId,
      });
    } catch (err) {
      setBanner({ message: err.message, type: 'error' });
    } finally {
      stopCycle();
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {banner && <ErrorBanner message={banner.message} type={banner.type} onDismiss={() => setBanner(null)} />}

      {loading && (
        <View style={s.overlay}>
          <View style={s.loadCard}>
            <View style={s.loadBadge}>
              <View style={s.dotLive} />
              <Text style={s.loadBadgeTxt}>TASK B STYLIST · {String(elapsed).padStart(2, '0')}S</Text>
            </View>

            <Animated.View style={[s.loadIconBox, { transform: [{ scale: pulseAnim }] }]}>
              <PixelIcon name="sparkles" size={26} color={COLORS.primary} />
            </Animated.View>

            <Text style={s.loadMsg}>{LOAD_MSGS[loadIdx].msg.toUpperCase()}</Text>
            <Text style={s.loadSub}>{LOAD_MSGS[loadIdx].sub}</Text>

            <View style={s.loadBarWrap}>
              <Animated.View
                style={[
                  s.loadShimmer,
                  {
                    left: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-35%', '100%'],
                    }),
                  },
                ]}
              />
            </View>

            {base && (
              <View style={s.baseLoadPreview}>
                <Image source={{ uri: base.imageUri }} style={s.baseLoadImg} />
                <View style={{ flex: 1, marginLeft: GAP.sm }}>
                  <Text style={s.baseLoadTag}>ANCHOR GARMENT</Text>
                  <Text style={s.baseLoadTxt} numberOfLines={1}>{base.summary || base.category}</Text>
                </View>
              </View>
            )}

            <Text style={s.loadFooter}>
              Scoring color harmony, occasion, and silhouette compatibility
            </Text>
          </View>
        </View>
      )}

      {/* Header */}
      <View style={s.hdr}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <PixelIcon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.hdrTitle}>GET RECOMMENDATION</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Exhaustion Notice */}
        {exhausted && (
          <View style={s.exhaustedCard}>
            <PixelIcon name="shield" size={24} color={COLORS.primary} />
            <View style={{ flex: 1, marginLeft: GAP.md }}>
              <Text style={s.exhaustedTitle}>All Outfits Generated</Text>
              <Text style={s.exhaustedSub}>
                All {maxOutfits} combinations evaluated. View history to re-wear past styles.
              </Text>
            </View>
          </View>
        )}

        {/* Stats Row */}
        <View style={s.statsRow}>
          <View style={s.statChip}>
            <Text style={s.statNum}>{topCount}</Text>
            <Text style={s.statLbl}>Tops</Text>
          </View>
          <View style={s.statChip}>
            <Text style={[s.statNum, { color: COLORS.secondary }]}>{botCount}</Text>
            <Text style={s.statLbl}>Bottoms</Text>
          </View>
          <View style={s.statChip}>
            <Text style={[s.statNum, { color: COLORS.green }]}>{unusedCount}</Text>
            <Text style={s.statLbl}>Unused</Text>
          </View>
        </View>

        {/* Anchor/Base Garment */}
        <Text style={s.secLabel}>BASE ANCHOR (OPTIONAL)</Text>
        <TouchableOpacity style={s.baseCard} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
          {base ? (
            <View style={s.baseRow}>
              <Image source={{ uri: base.imageUri }} style={s.baseImg} />
              <View style={{ flex: 1, marginLeft: GAP.md }}>
                <Text style={s.baseName}>{base.summary}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: GAP.sm, marginTop: 4 }}>
                  <Text style={s.baseCat}>{base.category}</Text>
                  <View style={s.slotTag}>
                    <Text style={s.slotTxt}>{getSlotLabel(base.category)}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setBaseId(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={s.delBaseBtn}
              >
                <PixelIcon name="close" size={18} color={COLORS.textDim} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.baseEmpty}>
              <PixelIcon name="plus" size={20} color={COLORS.textDim} />
              <Text style={s.baseEmptyTxt}>Tap to lock an anchor piece</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Wardrobe Preview Strip */}
        <Text style={s.secLabel}>AVAILABLE PIECES</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: GAP.xxl }}
          contentContainerStyle={{ gap: GAP.sm }}
        >
          {wardrobe.map((g) => (
            <View key={g.id} style={[s.preview, baseId === g.id && s.previewSel]}>
              <Image source={{ uri: g.imageUri }} style={s.previewImg} />
              <Text style={s.previewCat} numberOfLines={1}>{g.category}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Generate Button (Von Restorff Effect) */}
        <TouchableOpacity
          style={[s.goBtn, exhausted && { opacity: 0.4 }]}
          onPress={go}
          activeOpacity={0.8}
        >
          <PixelIcon name="sparkles" size={22} color="#0B0C10" />
          <Text style={s.goTxt}>{exhausted ? 'ALL DONE!' : 'GENERATE OUTFIT'}</Text>
        </TouchableOpacity>

        {outfits.length > 0 && (
          <TouchableOpacity
            style={s.historyBtn}
            onPress={() => navigation.navigate('OutfitHistory')}
            activeOpacity={0.8}
          >
            <Text style={s.historyTxt}>VIEW SAVED OUTFITS ({outfits.length})</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BaseGarmentSelector
        visible={showPicker}
        wardrobe={wardrobe}
        selectedId={baseId}
        onSelect={setBaseId}
        onClose={() => setShowPicker(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 12, 16, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: GAP.xl,
    zIndex: 999,
  },
  loadCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: GAP.xl,
    alignItems: 'center',
  },
  loadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: GAP.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.cardLight,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: GAP.lg,
  },
  dotLive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  loadBadgeTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 9,
    letterSpacing: 1,
  },
  loadIconBox: {
    width: 54,
    height: 54,
    borderRadius: RAD.sm,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: GAP.md,
  },
  loadMsg: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.base,
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  loadSub: {
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    fontSize: TYPE.xs,
    textAlign: 'center',
    marginBottom: GAP.lg,
  },
  loadBarWrap: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.cardLight,
    borderRadius: RAD.xs,
    overflow: 'hidden',
    marginBottom: GAP.md,
    position: 'relative',
  },
  loadShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '35%',
    backgroundColor: COLORS.primary,
  },
  baseLoadPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: COLORS.cardLight,
    borderRadius: RAD.xs,
    padding: GAP.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: GAP.md,
  },
  baseLoadImg: {
    width: 38,
    height: 38,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.bg,
  },
  baseLoadTag: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 8,
    letterSpacing: 1,
  },
  baseLoadTxt: {
    fontFamily: FONTS.regular,
    color: COLORS.text,
    fontSize: TYPE.xs,
    marginTop: 2,
  },
  loadFooter: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },

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

  exhaustedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.lg,
    marginBottom: GAP.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  exhaustedTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: TYPE.sm,
    letterSpacing: 1,
  },
  exhaustedSub: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    marginTop: 2,
  },

  statsRow: { flexDirection: 'row', gap: GAP.sm, marginBottom: GAP.xl },
  statChip: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    paddingVertical: GAP.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNum: {
    fontFamily: FONTS.bold,
    fontSize: TYPE.xl,
    color: COLORS.primary,
  },
  statLbl: {
    fontFamily: FONTS.regular,
    fontSize: TYPE.xs,
    color: COLORS.textDim,
    marginTop: 2,
    textTransform: 'uppercase',
  },

  secLabel: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: GAP.sm,
  },

  baseCard: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    marginBottom: GAP.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  baseRow: { flexDirection: 'row', alignItems: 'center' },
  baseImg: { width: 56, height: 56, borderRadius: RAD.sm, backgroundColor: COLORS.cardLight },
  baseName: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: TYPE.sm,
  },
  baseCat: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  slotTag: {
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: GAP.sm,
    paddingVertical: 1,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotTxt: {
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    fontSize: 10,
  },
  delBaseBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  baseEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: GAP.md,
    gap: GAP.sm,
  },
  baseEmptyTxt: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
  },

  preview: { alignItems: 'center', width: 68 },
  previewSel: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: RAD.sm },
  previewImg: { width: 60, height: 60, borderRadius: RAD.sm, backgroundColor: COLORS.cardLight },
  previewCat: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 4,
  },

  goBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: RAD.md,
    paddingVertical: GAP.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: GAP.sm,
    minHeight: 56,
  },
  goTxt: {
    fontFamily: FONTS.pixel,
    color: '#0B0C10',
    fontSize: TYPE.base,
    letterSpacing: 1,
  },

  historyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: GAP.lg,
    minHeight: 44,
  },
  historyTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.secondary,
    fontSize: TYPE.xs,
    letterSpacing: 1,
  },
});
