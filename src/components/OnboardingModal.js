import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FitCheckLogo from './FitCheckLogo';
import PixelIcon from './PixelIcon';
import LegalModal from './LegalModal';
import { useApp } from '../context/AppContext';
import { COLORS, GAP, RAD, FONTS } from '../constants/theme';

export default function OnboardingModal({ visible }) {
  const { completeOnboarding, gender: currentGender } = useApp();
  const [selectedGender, setSelectedGender] = useState(currentGender || 'male');
  const [legalTab, setLegalTab] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!visible) return null;

  async function handleFinish() {
    try {
      setSaving(true);
      await completeOnboarding({ gender: selectedGender });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Header & Logo */}
          <View style={s.header}>
            <View style={s.badge}>
              <View style={s.badgeDot} />
              <Text style={s.badgeTxt}>INITIAL BOOT · SETUP</Text>
            </View>
            <View style={s.logoWrap}>
              <FitCheckLogo width={220} height={92} />
            </View>
            <Text style={s.tagline}>AI WARDROBE & STYLE COMPANION</Text>
          </View>

          {/* Core Feature Highlights */}
          <View style={s.cardGroup}>
            <View style={s.featureRow}>
              <View style={[s.iconBox, { borderColor: COLORS.primary }]}>
                <PixelIcon name="shirt" size={18} color={COLORS.primary} />
              </View>
              <View style={s.featureText}>
                <Text style={s.featureTitle}>CATALOG YOUR CLOSET</Text>
                <Text style={s.featureDesc}>
                  Photograph or import clothes. Vision models extract silhouettes, cuts, and color schemes.
                </Text>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.featureRow}>
              <View style={[s.iconBox, { borderColor: COLORS.secondary }]}>
                <PixelIcon name="sunglasses" size={18} color={COLORS.secondary} />
              </View>
              <View style={s.featureText}>
                <Text style={s.featureTitle}>TASK B AI PAIRING</Text>
                <Text style={s.featureDesc}>
                  Evaluates pairwise harmony and compatibility logic to create balanced daily outfits.
                </Text>
              </View>
            </View>

            <View style={s.divider} />

            <View style={s.featureRow}>
              <View style={[s.iconBox, { borderColor: COLORS.green }]}>
                <PixelIcon name="shield" size={18} color={COLORS.green} />
              </View>
              <View style={s.featureText}>
                <Text style={s.featureTitle}>DEVICE-FIRST PRIVACY</Text>
                <Text style={s.featureDesc}>
                  Photos and wardrobe archives are kept in your local device sandbox.
                </Text>
              </View>
            </View>
          </View>

          {/* Style Preference */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTag}>STEP 1 OF 2</Text>
            <Text style={s.sectionTitle}>CHOOSE STYLE FOCUS</Text>
            <Text style={s.sectionDesc}>Calibrates recommendation silhouettes and pairing algorithms.</Text>
          </View>

          <View style={s.genderRow}>
            <TouchableOpacity
              style={[s.genderBtn, selectedGender === 'male' && s.genderActive]}
              onPress={() => setSelectedGender('male')}
              activeOpacity={0.75}
            >
              <PixelIcon
                name="user"
                size={22}
                color={selectedGender === 'male' ? COLORS.primary : COLORS.textDim}
              />
              <Text style={[s.genderTxt, selectedGender === 'male' && s.genderTxtActive]}>
                Men's Style
              </Text>
              {selectedGender === 'male' && (
                <View style={s.genderCheck}>
                  <PixelIcon name="check" size={14} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.genderBtn, selectedGender === 'female' && s.genderActive]}
              onPress={() => setSelectedGender('female')}
              activeOpacity={0.75}
            >
              <PixelIcon
                name="user"
                size={22}
                color={selectedGender === 'female' ? COLORS.primary : COLORS.textDim}
              />
              <Text style={[s.genderTxt, selectedGender === 'female' && s.genderTxtActive]}>
                Women's Style
              </Text>
              {selectedGender === 'female' && (
                <View style={s.genderCheck}>
                  <PixelIcon name="check" size={14} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Legal / Consent Clickwrap */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTag}>STEP 2 OF 2</Text>
            <Text style={s.sectionTitle}>LEGAL & DATA TERMS</Text>
          </View>

          <View style={s.legalBox}>
            <Text style={s.legalPrompt}>
              By continuing to use FitCheck, you confirm that you have read and agree to our:
            </Text>

            <View style={s.legalLinksRow}>
              <TouchableOpacity
                onPress={() => setLegalTab('terms')}
                style={s.legalLinkBtn}
                activeOpacity={0.7}
              >
                <Text style={s.legalLinkTxt}>[TERMS OF SERVICE]</Text>
              </TouchableOpacity>
              <Text style={s.legalSep}>·</Text>
              <TouchableOpacity
                onPress={() => setLegalTab('privacy')}
                style={s.legalLinkBtn}
                activeOpacity={0.7}
              >
                <Text style={s.legalLinkTxt}>[PRIVACY POLICY]</Text>
              </TouchableOpacity>
              <Text style={s.legalSep}>·</Text>
              <TouchableOpacity
                onPress={() => setLegalTab('compliance')}
                style={s.legalLinkBtn}
                activeOpacity={0.7}
              >
                <Text style={s.legalLinkTxt}>[AI NOTICE]</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[s.primaryBtn, saving && { opacity: 0.6 }]}
            onPress={handleFinish}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnTxt}>
              {saving ? 'CONFIGURING...' : 'AGREE & GET STARTED'}
            </Text>
            <PixelIcon name="chevron-right" size={18} color="#0B0C10" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <LegalModal
        visible={Boolean(legalTab)}
        initialTab={legalTab || 'terms'}
        onClose={() => setLegalTab(null)}
      />
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    paddingHorizontal: GAP.xl,
    paddingTop: GAP.lg,
    paddingBottom: GAP.huge,
  },
  header: {
    alignItems: 'center',
    marginBottom: GAP.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: RAD.xs,
    paddingHorizontal: GAP.sm,
    paddingVertical: 4,
    marginBottom: GAP.md,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 6,
  },
  badgeTxt: {
    fontFamily: FONTS.pixel,
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 1,
  },
  logoWrap: {
    marginVertical: GAP.xs,
  },
  tagline: {
    fontFamily: FONTS.pixel,
    fontSize: 10,
    color: COLORS.textDim,
    letterSpacing: 1.5,
    marginTop: GAP.xs,
  },
  cardGroup: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: GAP.lg,
    marginBottom: GAP.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RAD.sm,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: GAP.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: FONTS.pixel,
    fontSize: 11,
    color: COLORS.text,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  featureDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textDim,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: GAP.md,
  },
  sectionHeader: {
    marginBottom: GAP.md,
  },
  sectionTag: {
    fontFamily: FONTS.pixel,
    fontSize: 9,
    color: COLORS.secondary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  sectionDesc: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  genderRow: {
    flexDirection: 'row',
    gap: GAP.md,
    marginBottom: GAP.xl,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RAD.md,
    paddingVertical: GAP.lg,
    alignItems: 'center',
    position: 'relative',
  },
  genderActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.cardLight,
  },
  genderTxt: {
    fontFamily: FONTS.pixel,
    fontSize: 10,
    color: COLORS.textDim,
    marginTop: GAP.sm,
    letterSpacing: 0.5,
  },
  genderTxtActive: {
    color: COLORS.primary,
  },
  genderCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  legalBox: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: GAP.md,
    marginBottom: GAP.xl,
  },
  legalPrompt: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textDim,
    lineHeight: 17,
    textAlign: 'center',
  },
  legalLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: GAP.sm,
    gap: 6,
  },
  legalLinkBtn: {
    paddingVertical: 2,
  },
  legalLinkTxt: {
    fontFamily: FONTS.pixel,
    fontSize: 9,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  legalSep: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RAD.md,
    paddingVertical: GAP.md + 2,
    gap: GAP.sm,
  },
  primaryBtnTxt: {
    fontFamily: FONTS.pixel,
    fontSize: 12,
    color: '#0B0C10',
    letterSpacing: 1,
  },
});
