import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCopilot } from 'react-native-copilot';
import { useApp } from '../context/AppContext';
import PixelIcon from '../components/PixelIcon';
import ErrorBanner from '../components/ErrorBanner';
import LegalModal from '../components/LegalModal';
import ConfirmModal from '../components/ConfirmModal';
import { exportBackupData, importBackupData } from '../services/backupService';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const {
    gender, setGender, outfits, wardrobe, clearWardrobe,
    serverUrl, serverOk, modelName, setServerUrl, ping,
    personas, activeId, restoreFromBackup, resetAllData,
  } = useApp();
  const { start } = useCopilot();
  const [banner, setBanner] = useState(null);
  const [legalTab, setLegalTab] = useState(null);
  const [urlDraft, setUrlDraft] = useState(serverUrl);
  const [connecting, setConnecting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  async function handleExportBackup() {
    try {
      setExporting(true);
      const res = await exportBackupData({ personas, activeId, serverUrl });
      setBanner({
        message: `Archive created: ${res.garmentCount} items, ${res.imageCount} photos.`,
        type: 'success',
      });
    } catch (err) {
      setBanner({ message: `Export failed: ${err.message}`, type: 'error' });
    } finally {
      setExporting(false);
    }
  }

  async function handleImportBackup() {
    try {
      setImporting(true);
      const res = await importBackupData();
      if (res.canceled) return;
      if (res.ok) {
        await restoreFromBackup(res.data);
        setBanner({
          message: `Restored ${res.personaCount} profile(s), ${res.garmentCount} items, and ${res.imageCount} photos.`,
          type: 'success',
        });
      }
    } catch (err) {
      setBanner({ message: `Import failed: ${err.message}`, type: 'error' });
    } finally {
      setImporting(false);
    }
  }

  async function handleConnectUrl(target) {
    const u = (target || urlDraft || '').trim();
    if (!u) {
      setBanner({ message: 'Enter a valid URL', type: 'error' });
      return;
    }
    setConnecting(true);
    const r = await setServerUrl(u);
    setConnecting(false);
    if (r.ok) {
      setBanner({ message: `Connected: ${r.model || 'model ready'}`, type: 'success' });
    } else {
      setBanner({ message: `Failed: ${r.error}`, type: 'error' });
    }
  }

  const wornCount = (outfits || []).filter((o) => o.status === 'worn').length;
  const garmentCount = (wardrobe || []).length;
  const outfitCount = (outfits || []).length;

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      {banner && <ErrorBanner message={banner.message} type={banner.type} onDismiss={() => setBanner(null)} />}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.hdrRow}>
          <Text style={s.title}>SETTINGS</Text>
          <Text style={s.hdrSub}>Closet configuration & preferences</Text>
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

        {/* Server & AI Endpoint Configuration */}
        <Text style={[s.secLabel, { marginTop: GAP.xl }]}>AI INFERENCE BACKEND</Text>
        <View style={s.serverCard}>
          <View style={s.serverHdr}>
            <View style={[s.statusDot, { backgroundColor: serverOk ? COLORS.green : COLORS.red }]} />
            <View style={{ flex: 1, marginLeft: GAP.sm }}>
              <Text style={s.serverStatusTxt}>
                {serverOk
                  ? (serverUrl?.includes('hf.space') ? 'FITCHECK CLOUD' : 'LOCAL LM STUDIO')
                  : 'DISCONNECTED'}
              </Text>
              <Text style={s.serverModelTxt} numberOfLines={1}>
                {serverOk ? (modelName || 'Qwen3-VL 2B Active') : 'No endpoint reachable'}
              </Text>
            </View>
          </View>

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
              style={[s.saveBtn, connecting && { opacity: 0.5 }]}
              onPress={() => handleConnectUrl(urlDraft)}
              disabled={connecting}
              activeOpacity={0.7}
            >
              <Text style={s.saveBtnTxt}>{connecting ? '...' : 'SAVE'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={s.resetBtn}
            onPress={() => {
              const cloud = 'https://barryallen16-fitcheck.hf.space';
              setUrlDraft(cloud);
              handleConnectUrl(cloud);
            }}
            activeOpacity={0.7}
          >
            <PixelIcon name="refresh" size={12} color={COLORS.secondary} />
            <Text style={s.resetBtnTxt}>Reset to Official Cloud Endpoint</Text>
          </TouchableOpacity>
        </View>

        {/* Help & App Tour */}
        <Text style={[s.secLabel, { marginTop: GAP.xl }]}>GUIDE & HELP</Text>
        <TouchableOpacity
          style={s.menuBtn}
          onPress={() => {
            navigation.navigate('Home');
            setTimeout(() => {
              void start();
            }, 350);
          }}
          activeOpacity={0.7}
        >
          <View style={s.menuIconBox}>
            <PixelIcon name="zap" size={16} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: GAP.md }}>
            <Text style={s.menuTitle}>App Tour & Walkthrough</Text>
            <Text style={s.menuSub}>Step-by-step interactive interface tour</Text>
          </View>
          <PixelIcon name="chevron-right" size={16} color={COLORS.textDim} />
        </TouchableOpacity>

        {/* Data & Backup */}
        <Text style={[s.secLabel, { marginTop: GAP.xl }]}>DATA & BACKUP</Text>
        <Text style={s.secHint}>Export a complete archive with all clothes, photos, and outfits, or restore a previous backup.</Text>
        <View style={s.cardGroup}>
          <TouchableOpacity
            style={s.docRow}
            onPress={handleExportBackup}
            disabled={exporting || importing}
            activeOpacity={0.7}
          >
            <PixelIcon name="zap" size={18} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.docTxt}>Export Data Archive</Text>
              <Text style={s.backupSubTxt}>
                {exporting ? 'Packaging clothes and photos...' : 'Includes all images, settings, and wear logs'}
              </Text>
            </View>
            <PixelIcon name="chevron-right" size={16} color={COLORS.textDim} />
          </TouchableOpacity>

          <View style={s.docDivider} />

          <TouchableOpacity
            style={s.docRow}
            onPress={handleImportBackup}
            disabled={exporting || importing}
            activeOpacity={0.7}
          >
            <PixelIcon name="refresh" size={18} color={COLORS.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={s.docTxt}>Import & Restore Backup</Text>
              <Text style={s.backupSubTxt}>
                {importing ? 'Restoring files...' : 'Select a JSON backup file from your device'}
              </Text>
            </View>
            <PixelIcon name="chevron-right" size={16} color={COLORS.textDim} />
          </TouchableOpacity>
        </View>

        {/* Legal & Compliance */}
        <Text style={[s.secLabel, { marginTop: GAP.xl }]}>LEGAL & COMPLIANCE</Text>
        <View style={s.cardGroup}>
          <TouchableOpacity
            style={s.docRow}
            onPress={() => setLegalTab('privacy')}
            activeOpacity={0.7}
          >
            <PixelIcon name="shield" size={18} color={COLORS.primary} />
            <Text style={s.docTxt}>Privacy Policy</Text>
            <PixelIcon name="chevron-right" size={16} color={COLORS.textDim} />
          </TouchableOpacity>

          <View style={s.docDivider} />

          <TouchableOpacity
            style={s.docRow}
            onPress={() => setLegalTab('terms')}
            activeOpacity={0.7}
          >
            <PixelIcon name="briefcase" size={18} color={COLORS.secondary} />
            <Text style={s.docTxt}>Terms of Service</Text>
            <PixelIcon name="chevron-right" size={16} color={COLORS.textDim} />
          </TouchableOpacity>

          <View style={s.docDivider} />

          <TouchableOpacity
            style={s.docRow}
            onPress={() => setLegalTab('compliance')}
            activeOpacity={0.7}
          >
            <PixelIcon name="sunglasses" size={18} color={COLORS.primary} />
            <Text style={s.docTxt}>AI Transparency & Disclosure</Text>
            <PixelIcon name="chevron-right" size={16} color={COLORS.textDim} />
          </TouchableOpacity>
        </View>

        {/* Actions / Data Management */}
        <Text style={[s.secLabel, { marginTop: GAP.xl }]}>DATA MANAGEMENT</Text>

        <TouchableOpacity
          style={s.dangerBtn}
          onPress={() => setShowClearConfirm(true)}
          activeOpacity={0.7}
        >
          <PixelIcon name="trash" size={18} color={COLORS.red} />
          <Text style={s.dangerTxt}>Clear Wardrobe Items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.dangerBtn, { marginTop: GAP.sm }]}
          onPress={() => setShowResetConfirm(true)}
          activeOpacity={0.7}
        >
          <PixelIcon name="refresh" size={18} color={COLORS.red} />
          <Text style={s.dangerTxt}>Reset App & Erase All Data</Text>
        </TouchableOpacity>

        {/* App Version Tag */}
        <View style={s.verBox}>
          <Text style={s.verTxt}>FitCheck v2.1.0 · Qwen3-VL 2B Stylist</Text>
        </View>
      </ScrollView>

      <LegalModal
        visible={Boolean(legalTab)}
        initialTab={legalTab || 'privacy'}
        onClose={() => setLegalTab(null)}
      />

      <ConfirmModal
        visible={showResetConfirm}
        title="RESET ALL DATA"
        message="Permanently delete all wardrobe items, photos, outfits, and reset the app to the initial onboarding state? This cannot be undone."
        confirmText="RESET EVERYTHING"
        onConfirm={async () => {
          setShowResetConfirm(false);
          await resetAllData();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      <ConfirmModal
        visible={showClearConfirm}
        title="CLEAR WARDROBE"
        message="Remove all garments from your wardrobe? This action cannot be reversed."
        confirmText="CLEAR ALL"
        onConfirm={() => {
          clearWardrobe();
          setShowClearConfirm(false);
          setBanner({ type: 'success', message: 'Wardrobe cleared.' });
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
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
  hdrSub: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
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

  serverCard: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: GAP.md,
    marginBottom: GAP.sm,
  },
  serverHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: GAP.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serverStatusTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.xs,
    letterSpacing: 1,
  },
  serverModelTxt: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 1,
  },
  urlRow: {
    flexDirection: 'row',
    gap: GAP.sm,
    marginBottom: GAP.sm,
  },
  urlInput: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderRadius: RAD.xs,
    paddingHorizontal: GAP.sm,
    paddingVertical: 8,
    color: COLORS.text,
    fontFamily: FONTS.regular,
    fontSize: TYPE.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RAD.xs,
    paddingHorizontal: GAP.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnTxt: {
    fontFamily: FONTS.pixel,
    color: '#0B0C10',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  resetBtnTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.secondary,
    fontSize: 9,
    letterSpacing: 0.5,
  },

  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: GAP.sm,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  menuTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.xs,
    letterSpacing: 0.8,
  },
  menuSub: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 2,
  },

  cardGroup: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: GAP.sm,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: GAP.md,
    paddingHorizontal: GAP.md,
    gap: GAP.md,
  },
  docDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: GAP.md,
  },
  docTxt: {
    flex: 1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    fontSize: TYPE.sm,
  },
  backupSubTxt: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: 11,
    marginTop: 2,
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
