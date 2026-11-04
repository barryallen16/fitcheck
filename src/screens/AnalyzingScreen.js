import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PixelIcon from '../components/PixelIcon';
import { useApp } from '../context/AppContext';
import lm from '../services/lmStudioService';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

const ANALYSIS_STEPS = [
  'SCANNING GARMENT SILHOUETTE...',
  'EXTRACTING COLOR PALETTE & TEXTURE...',
  'QUERYING TASK A ATTRIBUTE HEADS...',
  'CLASSIFYING CATEGORY, CUT & FIT...',
  'ENCODING EMBEDDING VECTOR...',
];

export default function AnalyzingScreen({ route, navigation }) {
  const { images } = route.params;
  const { addGarment } = useApp();
  const [results, setResults] = useState([]);
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const prog = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    run();

    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    );
    scanLoop.start();

    const stepInterval = setInterval(() => {
      setStepIdx((p) => (p + 1) % ANALYSIS_STEPS.length);
    }, 2400);

    const timerInterval = setInterval(() => {
      setElapsed((p) => p + 1);
    }, 1000);

    return () => {
      scanLoop.stop();
      clearInterval(stepInterval);
      clearInterval(timerInterval);
    };
  }, []);

  async function run() {
    const out = [];
    for (let i = 0; i < images.length; i++) {
      setIdx(i);
      Animated.timing(prog, {
        toValue: (i + 0.85) / images.length,
        duration: 18000,
        useNativeDriver: false,
      }).start();

      try {
        const analysis = await lm.analyzeGarment(images[i].uri);
        const g = await addGarment({ ...analysis, imageUri: images[i].uri });
        out.push({ ok: true, garment: g, imageUri: images[i].uri });
      } catch (err) {
        out.push({ ok: false, error: err.message, imageUri: images[i].uri });
      }
      Animated.timing(prog, {
        toValue: (i + 1) / images.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    setResults(out);
    setDone(true);
  }

  const okC = results.filter((r) => r.ok).length;
  const failC = results.filter((r) => !r.ok).length;
  const pW = prog.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const scanTranslateY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 154] });

  if (!done) {
    return (
      <SafeAreaView style={s.c} edges={['top']}>
        <View style={s.hdr}>
          <Text style={s.hdrTxt}>VLM ANALYSIS</Text>
        </View>
        <View style={s.center}>
          <View style={s.curImgWrapper}>
            <Image source={{ uri: images[idx]?.uri }} style={s.curImg} />
            <Animated.View
              style={[
                s.scanLine,
                { transform: [{ translateY: scanTranslateY }] },
              ]}
            />
          </View>

          <View style={s.statusBadge}>
            <View style={s.dotLive} />
            <Text style={s.statusBadgeTxt}>
              INFERENCE ACTIVE · {String(elapsed).padStart(2, '0')}S
            </Text>
          </View>

          <Text style={s.curTxt}>
            ANALYZING {idx + 1} OF {images.length}
          </Text>
          <Text style={s.stepTxt}>{ANALYSIS_STEPS[stepIdx]}</Text>

          <View style={s.bar}>
            <Animated.View style={[s.fill, { width: pW }]} />
          </View>
          <Text style={s.hint}>Vision-language model indexing category, cut, and attributes</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.hdr}>
        <Text style={s.hdrTxt}>ANALYSIS COMPLETE</Text>
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.summary}>
          {okC > 0 && (
            <View style={s.sumItem}>
              <View style={[s.sumIconBox, { borderColor: COLORS.green }]}>
                <PixelIcon name="check" size={18} color={COLORS.green} />
              </View>
              <Text style={s.sumNum}>{okC}</Text>
              <Text style={s.sumLbl}>SUCCESS</Text>
            </View>
          )}
          {failC > 0 && (
            <View style={s.sumItem}>
              <View style={[s.sumIconBox, { borderColor: COLORS.red }]}>
                <PixelIcon name="info-box" size={18} color={COLORS.red} />
              </View>
              <Text style={[s.sumNum, { color: COLORS.red }]}>{failC}</Text>
              <Text style={s.sumLbl}>FAILED</Text>
            </View>
          )}
        </View>

        {results.map((r, i) => (
          <View key={i} style={[s.resCard, !r.ok && s.resErr]}>
            <Image source={{ uri: r.imageUri }} style={s.resImg} />
            <View style={{ flex: 1, marginHorizontal: GAP.md }}>
              {r.ok ? (
                <>
                  <Text style={s.resTitle}>{r.garment.summary}</Text>
                  <Text style={s.resCat}>{r.garment.category}</Text>
                </>
              ) : (
                <>
                  <Text style={s.errTitle}>ANALYSIS FAILED</Text>
                  <Text style={s.errMsg} numberOfLines={2}>{r.error}</Text>
                </>
              )}
            </View>
            <PixelIcon
              name={r.ok ? 'check' : 'close'}
              size={18}
              color={r.ok ? COLORS.green : COLORS.red}
            />
          </View>
        ))}

        <TouchableOpacity
          style={s.doneBtn}
          onPress={() => navigation.getParent()?.goBack?.() || navigation.popToTop()}
          activeOpacity={0.8}
        >
          <Text style={s.doneTxt}>RETURN TO WARDROBE</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg },
  hdr: {
    paddingHorizontal: GAP.lg,
    paddingVertical: GAP.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  hdrTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.base,
    letterSpacing: 1.5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: GAP.xxl,
  },
  curImgWrapper: {
    width: 160,
    height: 160,
    borderRadius: RAD.md,
    marginBottom: GAP.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.cardLight,
  },
  curImg: {
    width: '100%',
    height: '100%',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: GAP.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.card,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: GAP.sm,
  },
  dotLive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  statusBadgeTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 9,
    letterSpacing: 1,
  },
  curTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.sm,
    letterSpacing: 1,
    marginBottom: 4,
  },
  stepTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.secondary,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: GAP.md,
    textAlign: 'center',
  },
  bar: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.cardLight,
    borderRadius: RAD.xs,
    overflow: 'hidden',
    marginBottom: GAP.sm,
  },
  fill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  hint: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  scroll: {
    paddingHorizontal: GAP.lg,
    paddingVertical: GAP.lg,
    paddingBottom: GAP.huge,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: GAP.xxxl,
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.lg,
    marginBottom: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sumItem: {
    alignItems: 'center',
  },
  sumIconBox: {
    width: 32,
    height: 32,
    borderRadius: RAD.xs,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: GAP.xs,
  },
  sumNum: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: TYPE.xxl,
  },
  sumLbl: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 2,
  },
  resCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    marginBottom: GAP.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resErr: {
    borderColor: COLORS.redMuted,
  },
  resImg: {
    width: 48,
    height: 48,
    borderRadius: RAD.sm,
    backgroundColor: COLORS.cardLight,
  },
  resTitle: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: TYPE.sm,
  },
  resCat: {
    fontFamily: FONTS.pixel,
    color: COLORS.secondary,
    fontSize: 9,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  errTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.red,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  errMsg: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RAD.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: GAP.lg,
  },
  doneTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.white,
    fontSize: 11,
    letterSpacing: 1,
  },
});
