import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PixelIcon from './PixelIcon';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';
import { LEGAL_DOCS } from '../constants/legalDocs';

export default function LegalModal({ visible, initialTab = 'privacy', onClose }) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab, visible]);

  const doc = LEGAL_DOCS[tab] || LEGAL_DOCS.privacy;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={s.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={s.hdr}>
          <View>
            <Text style={s.hdrTag}>LEGAL & COMPLIANCE</Text>
            <Text style={s.hdrTitle}>{doc.title}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <PixelIcon name="close" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Tab switcher */}
        <View style={s.tabs}>
          <TouchableOpacity
            style={[s.tabBtn, tab === 'privacy' && s.tabBtnActive]}
            onPress={() => setTab('privacy')}
            activeOpacity={0.7}
          >
            <Text style={[s.tabTxt, tab === 'privacy' && s.tabTxtActive]}>PRIVACY</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tabBtn, tab === 'terms' && s.tabBtnActive]}
            onPress={() => setTab('terms')}
            activeOpacity={0.7}
          >
            <Text style={[s.tabTxt, tab === 'terms' && s.tabTxtActive]}>TERMS</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tabBtn, tab === 'compliance' && s.tabBtnActive]}
            onPress={() => setTab('compliance')}
            activeOpacity={0.7}
          >
            <Text style={[s.tabTxt, tab === 'compliance' && s.tabTxtActive]}>AI NOTICE</Text>
          </TouchableOpacity>
        </View>

        {/* Document content */}
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.metaBox}>
            <Text style={s.metaTxt}>EFFECTIVE: {doc.lastUpdated.toUpperCase()}</Text>
          </View>

          {doc.sections.map((sec, idx) => (
            <View key={idx} style={s.section}>
              <Text style={s.sectionHeading}>{sec.heading}</Text>
              <Text style={s.sectionBody}>{sec.body}</Text>
            </View>
          ))}

          <View style={s.footer}>
            <Text style={s.footerTxt}>FitCheck AI Wardrobe Engine · Version 2.1.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
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
  hdrTag: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 2,
  },
  hdrTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.base,
    letterSpacing: 1.2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: GAP.lg,
    paddingTop: GAP.sm,
    paddingBottom: GAP.xs,
    gap: GAP.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  tabBtn: {
    paddingVertical: GAP.sm,
    paddingHorizontal: GAP.md,
    borderRadius: RAD.xs,
  },
  tabBtnActive: {
    backgroundColor: COLORS.cardLight,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1,
  },
  tabTxtActive: {
    color: COLORS.primary,
  },
  content: {
    padding: GAP.lg,
    paddingBottom: GAP.huge,
  },
  metaBox: {
    marginBottom: GAP.lg,
    paddingBottom: GAP.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  metaTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1,
  },
  section: {
    marginBottom: GAP.xl,
  },
  sectionHeading: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: TYPE.xs,
    letterSpacing: 1,
    marginBottom: GAP.xs,
  },
  sectionBody: {
    fontFamily: FONTS.regular,
    color: COLORS.text,
    fontSize: TYPE.sm,
    lineHeight: 22,
  },
  footer: {
    marginTop: GAP.lg,
    paddingTop: GAP.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  footerTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1,
  },
});
