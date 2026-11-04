import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PixelIcon from '../components/PixelIcon';
import { useApp } from '../context/AppContext';
import OutfitCard from '../components/OutfitCard';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';
import { todayStr } from '../utils/helpers';

export default function OutfitHistoryScreen({ navigation }) {
  const { outfits, wardrobe, wearOutfit, unwearOutfit, deleteOutfit } = useApp();
  const [tab, setTab] = useState('unworn');

  const unworn = outfits.filter((o) => o.status === 'unworn').reverse();
  const worn = outfits.filter((o) => o.status === 'worn').sort((a, b) => (b.wornDate || '').localeCompare(a.wornDate || ''));
  const list = tab === 'unworn' ? unworn : worn;

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      <View style={s.hdr}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <PixelIcon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.hdrTitle}>OUTFIT ARCHIVE</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, tab === 'unworn' && s.tabActive]}
          onPress={() => setTab('unworn')}
          activeOpacity={0.8}
        >
          <Text style={[s.tabTxt, tab === 'unworn' && s.tabTxtActive]}>
            UNWORN [{unworn.length}]
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === 'worn' && s.tabActive]}
          onPress={() => setTab('worn')}
          activeOpacity={0.8}
        >
          <Text style={[s.tabTxt, tab === 'worn' && s.tabTxtActive]}>
            WORN [{worn.length}]
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={list}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <OutfitCard
            outfit={item}
            wardrobe={wardrobe}
            onPress={() => navigation.navigate('OutfitDetail', { outfitId: item.id })}
            onWear={(id) => wearOutfit(id, todayStr())}
            onUnwear={unwearOutfit}
            onDelete={(id) => Alert.alert('Delete?', 'Remove this outfit?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => deleteOutfit(id) },
            ])}
          />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconCircle}>
              <PixelIcon name={tab === 'unworn' ? 'sparkles' : 'briefcase'} size={32} color={COLORS.textMuted} />
            </View>
            <Text style={s.emptyTitle}>{tab === 'unworn' ? 'NO UNWORN OUTFITS' : 'NO WORN OUTFITS'}</Text>
            <Text style={s.emptySub}>
              {tab === 'unworn'
                ? 'Generate daily recommendations to populate your rotation'
                : 'Mark outfits as worn today to build your style history'}
            </Text>
          </View>
        }
      />
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
    paddingVertical: GAP.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hdrTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.base,
    letterSpacing: 1.5,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: GAP.lg,
    paddingTop: GAP.md,
    gap: GAP.sm,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RAD.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: {
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primary,
  },
  tabTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 11,
    letterSpacing: 1,
  },
  tabTxtActive: {
    color: COLORS.primary,
  },
  list: {
    paddingHorizontal: GAP.lg,
    paddingTop: GAP.md,
    paddingBottom: GAP.huge,
  },
  empty: {
    alignItems: 'center',
    paddingTop: GAP.huge * 1.5,
    paddingHorizontal: GAP.xxl,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: RAD.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: GAP.lg,
  },
  emptyTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.sm,
    letterSpacing: 1,
  },
  emptySub: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.sm,
    textAlign: 'center',
    marginTop: GAP.xs,
    lineHeight: 18,
  },
});
