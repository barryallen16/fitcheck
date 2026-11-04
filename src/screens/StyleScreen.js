import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import PixelIcon from '../components/PixelIcon';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';
import { getMaxOutfits, getUnusedCombinations } from '../utils/helpers';

export default function StyleScreen({ navigation }) {
  const { wardrobe, outfits } = useApp();
  const unused = getUnusedCombinations(wardrobe, outfits).length;
  const worn = outfits.filter((o) => o.status === 'worn').length;

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.hdr}>
          <Text style={s.title}>STYLE LAB</Text>
          <Text style={s.subTitle}>AI-curated outfit recommendations</Text>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.stat}>
            <Text style={s.statNum}>{outfits.length}</Text>
            <Text style={s.statLbl}>Generated</Text>
          </View>
          <View style={s.stat}>
            <Text style={[s.statNum, { color: COLORS.secondary }]}>{unused}</Text>
            <Text style={s.statLbl}>Unused</Text>
          </View>
          <View style={s.stat}>
            <Text style={[s.statNum, { color: COLORS.green }]}>{worn}</Text>
            <Text style={s.statLbl}>Worn</Text>
          </View>
        </View>

        {/* Primary CTA (Von Restorff Effect) */}
        <TouchableOpacity
          style={s.mainBtn}
          onPress={() => navigation.navigate('Recommendation')}
          activeOpacity={0.8}
        >
          <View style={s.mainIconBox}>
            <PixelIcon name="shirt" size={24} color="#0B0C10" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.mainTxt}>GET OUTFIT RECOMMENDATION</Text>
            <Text style={s.mainSub}>
              {unused > 0
                ? `${unused} fresh combinations ready`
                : wardrobe.length < 2
                ? 'Scan at least 1 top and 1 bottom'
                : 'All pairs generated! Tap to regenerate'}
            </Text>
          </View>
          <PixelIcon name="chevron-right" size={20} color="#0B0C10" />
        </TouchableOpacity>

        {/* Secondary Navigation Options */}
        <Text style={s.secHeader}>OUTFIT ARCHIVE</Text>

        <TouchableOpacity
          style={s.secBtn}
          onPress={() => navigation.navigate('OutfitHistory')}
          activeOpacity={0.7}
        >
          <View style={s.secIconBox}>
            <PixelIcon name="sunglasses" size={20} color={COLORS.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.secTxt}>OUTFIT HISTORY</Text>
            <Text style={s.secSub}>{outfits.length} generated combinations saved</Text>
          </View>
          <PixelIcon name="chevron-right" size={18} color={COLORS.textDim} />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secBtn}
          onPress={() => navigation.navigate('OutfitCalendar')}
          activeOpacity={0.7}
        >
          <View style={s.secIconBox}>
            <PixelIcon name="calendar" size={20} color={COLORS.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.secTxt}>OUTFIT CALENDAR</Text>
            <Text style={s.secSub}>Track wear history across dates</Text>
          </View>
          <PixelIcon name="chevron-right" size={18} color={COLORS.textDim} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: GAP.lg, paddingBottom: GAP.huge },

  hdr: { paddingTop: GAP.lg, marginBottom: GAP.lg },
  title: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.xl,
    letterSpacing: 1.5,
  },
  subTitle: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    marginTop: 2,
  },

  statsRow: { flexDirection: 'row', gap: GAP.sm, marginBottom: GAP.xl },
  stat: {
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

  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RAD.md,
    padding: GAP.lg,
    gap: GAP.md,
    marginBottom: GAP.xl,
    minHeight: 64,
  },
  mainIconBox: {
    width: 40,
    height: 40,
    borderRadius: RAD.sm,
    backgroundColor: 'rgba(11, 12, 16, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTxt: {
    fontFamily: FONTS.pixel,
    color: '#0B0C10',
    fontSize: TYPE.sm,
    letterSpacing: 1,
  },
  mainSub: {
    fontFamily: FONTS.regular,
    color: '#0B0C10',
    fontSize: TYPE.xs,
    opacity: 0.85,
    marginTop: 2,
  },

  secHeader: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: GAP.sm,
  },
  secBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    gap: GAP.md,
    marginBottom: GAP.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 56,
  },
  secIconBox: {
    width: 38,
    height: 38,
    borderRadius: RAD.sm,
    backgroundColor: COLORS.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.xs,
    letterSpacing: 1,
  },
  secSub: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    marginTop: 2,
  },
});
