import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import PixelIcon from '../components/PixelIcon';
import ErrorBanner from '../components/ErrorBanner';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const { gender, setGender, outfits, wardrobe, clearWardrobe } = useApp();
  const [banner, setBanner] = useState(null);

  const wornCount = (outfits || []).filter((o) => o.status === 'worn').length;
  const garmentCount = (wardrobe || []).length;
  const outfitCount = (outfits || []).length;

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      {banner && <ErrorBanner message={banner.message} type={banner.type} onDismiss={() => setBanner(null)} />}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.hdrRow}>
          <Text style={s.title}>PROFILE</Text>
        </View>

        {/* User Card */}
        <View style={s.userCard}>
          <View style={s.avatarWrap}>
            <PixelIcon name="user" size={32} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: GAP.md }}>
            <Text style={s.userName}>Personal Closet</Text>
            <Text style={s.userSub}>AI Stylist Profile</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statNum}>{garmentCount}</Text>
            <Text style={s.statLbl}>Garments</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statNum, { color: COLORS.secondary }]}>{outfitCount}</Text>
            <Text style={s.statLbl}>Outfits</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statNum, { color: COLORS.green }]}>{wornCount}</Text>
            <Text style={s.statLbl}>Worn</Text>
          </View>
        </View>

        {/* ─── Gender Selection ─────────────────────── */}
        <Text style={s.secLabel}>STYLE PREFERENCE</Text>
        <Text style={s.secHint}>Tailors recommendation silhouettes and occasion pairings</Text>

        <View style={s.genderRow}>
          <TouchableOpacity
            style={[s.genderBtn, gender === 'male' && s.genderActive]}
            onPress={() => setGender('male')}
            activeOpacity={0.7}
          >
            <PixelIcon
              name="user"
              size={24}
              color={gender === 'male' ? COLORS.primary : COLORS.textDim}
            />
            <Text style={[s.genderTxt, gender === 'male' && s.genderTxtActive]}>Men's Style</Text>
            {gender === 'male' && (
              <View style={s.genderCheck}>
                <PixelIcon name="check" size={14} color={COLORS.primary} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.genderBtn, gender === 'female' && s.genderActive]}
            onPress={() => setGender('female')}
            activeOpacity={0.7}
          >
            <PixelIcon
              name="user"
              size={24}
              color={gender === 'female' ? COLORS.primary : COLORS.textDim}
            />
            <Text style={[s.genderTxt, gender === 'female' && s.genderTxtActive]}>Women's Style</Text>
            {gender === 'female' && (
              <View style={s.genderCheck}>
                <PixelIcon name="check" size={14} color={COLORS.primary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Actions / Data Management */}
        <Text style={[s.secLabel, { marginTop: GAP.xl }]}>DATA MANAGEMENT</Text>

        <TouchableOpacity
          style={s.dangerBtn}
          onPress={() => Alert.alert('Clear Wardrobe', 'Remove all garments from your wardrobe?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear All', style: 'destructive', onPress: clearWardrobe },
          ])}
          activeOpacity={0.7}
        >
          <PixelIcon name="trash" size={18} color={COLORS.red} />
          <Text style={s.dangerTxt}>Clear Wardrobe Items</Text>
        </TouchableOpacity>

        {/* App Version Tag */}
        <View style={s.verBox}>
          <Text style={s.verTxt}>FitCheck v1.0.0 · Qwen3-VL 2B Stylist</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: GAP.lg, paddingBottom: GAP.huge },

  hdrRow: { marginTop: GAP.lg, marginBottom: GAP.md },
  title: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.xl,
    letterSpacing: 1.5,
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: GAP.lg,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: RAD.sm,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: TYPE.base,
    color: COLORS.text,
  },
  userSub: {
    fontFamily: FONTS.regular,
    fontSize: TYPE.xs,
    color: COLORS.textDim,
    marginTop: 2,
  },

  statsRow: {
    flexDirection: 'row',
    gap: GAP.sm,
    marginBottom: GAP.xl,
  },
  statBox: {
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
    fontSize: TYPE.xs,
    letterSpacing: 1,
    marginBottom: 4,
  },
  secHint: {
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontSize: TYPE.xs,
    marginBottom: GAP.md,
  },

  genderRow: {
    flexDirection: 'row',
    gap: GAP.md,
    marginBottom: GAP.lg,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    paddingVertical: GAP.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 56,
    gap: GAP.xs,
  },
  genderActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.cardLight,
  },
  genderTxt: {
    fontFamily: FONTS.medium,
    color: COLORS.textDim,
    fontSize: TYPE.sm,
  },
  genderTxtActive: {
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  genderCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    gap: GAP.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  dangerTxt: {
    fontFamily: FONTS.medium,
    color: COLORS.red,
    fontSize: TYPE.sm,
  },

  verBox: {
    alignItems: 'center',
    paddingVertical: GAP.xxl,
  },
  verTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.textMuted,
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
