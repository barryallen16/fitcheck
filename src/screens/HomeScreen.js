import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import PixelIcon from '../components/PixelIcon';
import ErrorBanner from '../components/ErrorBanner';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

export default function HomeScreen({ navigation }) {
  const { wardrobe, outfits, serverUrl, serverOk, modelName, setServerUrl, ping } = useApp();
  const [showCfg, setShowCfg] = useState(false);
  const [urlDraft, setUrlDraft] = useState(serverUrl);
  const [connecting, setConnecting] = useState(false);
  const [banner, setBanner] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { ping(); }, []));

  async function handleConnect() {
    const url = urlDraft.trim();
    if (!url) { setBanner({ message: 'Enter a URL', type: 'error' }); return; }
    setConnecting(true);
    const r = await setServerUrl(url);
    setConnecting(false);
    r.ok ? setBanner({ message: `Connected: ${r.model || 'model ready'}`, type: 'success' }) : setBanner({ message: `Failed: ${r.error}`, type: 'error' });
    if (r.ok) setShowCfg(false);
  }

  const cats = new Set(wardrobe.map((g) => g.category)).size;
  const worn = outfits.filter((o) => o.status === 'worn').length;
  const unworn = outfits.filter((o) => o.status === 'unworn').length;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {banner && <ErrorBanner message={banner.message} type={banner.type} onDismiss={() => setBanner(null)} />}

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await ping(); setRefreshing(false); }}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Brand Header */}
        <View style={s.logoWrap}>
          <Image
            style={s.logo}
            source={require('../../assets/logo.png')}
            contentFit="contain"
          />
          <Text style={s.tagline}>AI-Powered Wardrobe & Outfit Engine</Text>
        </View>

        {/* Server Connection Card */}
        <TouchableOpacity
          style={[s.statusCard, serverOk ? s.statusOnline : s.statusOffline]}
          onPress={() => setShowCfg((p) => !p)}
          activeOpacity={0.7}
        >
          <View style={s.statusRow}>
            <View style={[s.dot, { backgroundColor: serverOk ? COLORS.green : COLORS.red }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.statusTxt}>
                {serverOk
                  ? (serverUrl?.includes('hf.space') ? 'FITCHECK CLOUD' : 'LOCAL LM STUDIO')
                  : 'DISCONNECTED'}
              </Text>
              <Text style={s.modelTxt} numberOfLines={1}>
                {serverOk ? (modelName || 'Qwen3-VL 2B Active') : 'Tap to configure endpoint'}
              </Text>
            </View>
            <PixelIcon
              name={showCfg ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={COLORS.textDim}
            />
          </View>

          {showCfg && (
            <View style={s.cfgBox}>
              <Text style={s.cfgLabel}>ENDPOINT CONFIGURATION</Text>
              <View style={s.urlRow}>
                <TextInput
                  style={s.urlInput}
                  value={urlDraft}
                  onChangeText={setUrlDraft}
                  placeholder="https://barryallen16-fitcheck.hf.space"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <TouchableOpacity
                  style={[s.connectBtn, connecting && { opacity: 0.5 }]}
                  onPress={handleConnect}
                  disabled={connecting}
                >
                  <Text style={s.connectTxt}>{connecting ? '...' : 'SAVE'}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', gap: GAP.sm, marginTop: GAP.sm }}>
                <TouchableOpacity
                  onPress={() => { setUrlDraft('https://barryallen16-fitcheck.hf.space'); }}
                  style={s.resetBtn}
                >
                  <Text style={s.resetTxt}>Reset to Official Cloud</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Quick CTA */}
        <TouchableOpacity
          style={s.ctaCard}
          onPress={() => navigation.navigate('Style', { screen: 'Recommendation' })}
          activeOpacity={0.8}
        >
          <View style={s.ctaIconBox}>
            <PixelIcon name="sparkles" size={26} color="#0B0C10" />
          </View>
          <View style={{ flex: 1, marginLeft: GAP.md }}>
            <Text style={s.ctaTitle}>GENERATE TODAY'S FIT</Text>
            <Text style={s.ctaSub}>Instant pairwise match using fine-tuned Task B</Text>
          </View>
          <PixelIcon name="chevron-right" size={20} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Wardrobe Metrics Grid */}
        <Text style={s.secHeader}>WARDROBE METRICS</Text>
        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <Text style={s.statNum}>{wardrobe.length}</Text>
            <Text style={s.statLbl}>Garments</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statNum, { color: COLORS.secondary }]}>{cats}</Text>
            <Text style={s.statLbl}>Categories</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statNum, { color: COLORS.green }]}>{unworn}</Text>
            <Text style={s.statLbl}>Unworn Looks</Text>
          </View>
          <View style={s.statBox}>
            <Text style={[s.statNum, { color: COLORS.orange }]}>{worn}</Text>
            <Text style={s.statLbl}>Worn Fits</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { paddingHorizontal: GAP.lg, paddingBottom: GAP.huge },

  logoWrap: {
    alignItems: 'center',
    paddingTop: GAP.lg,
    paddingBottom: GAP.lg,
  },
  logo: {
    width: 220,
    height: 92,
  },
  tagline: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    marginTop: 6,
    letterSpacing: 0.5,
  },

  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: GAP.lg,
  },
  statusOnline: {
    borderColor: COLORS.border,
  },
  statusOffline: {
    borderColor: COLORS.redMuted,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTxt: {
    fontFamily: FONTS.pixel,
    fontSize: 11,
    color: COLORS.text,
    letterSpacing: 1,
  },
  modelTxt: {
    fontFamily: FONTS.regular,
    fontSize: TYPE.xs,
    color: COLORS.textDim,
    marginTop: 1,
  },

  cfgBox: {
    marginTop: GAP.md,
    paddingTop: GAP.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cfgLabel: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: GAP.xs,
  },
  urlRow: {
    flexDirection: 'row',
    gap: GAP.sm,
  },
  urlInput: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RAD.sm,
    paddingHorizontal: GAP.md,
    paddingVertical: GAP.sm,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: TYPE.xs,
  },
  connectBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: GAP.lg,
    borderRadius: RAD.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 40,
  },
  connectTxt: {
    fontFamily: FONTS.pixel,
    color: '#0B0C10',
    fontSize: 10,
    letterSpacing: 1,
  },
  resetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.cardLight,
    borderRadius: RAD.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetTxt: {
    color: COLORS.secondary,
    fontFamily: FONTS.medium,
    fontSize: TYPE.xs,
  },

  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: GAP.xl,
  },
  ctaIconBox: {
    width: 44,
    height: 44,
    borderRadius: RAD.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.sm,
    letterSpacing: 1,
  },
  ctaSub: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    marginTop: 2,
  },

  secHeader: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: GAP.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP.sm,
  },
  statBox: {
    width: '48.5%',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
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
  },
});
