import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import GarmentCard from '../components/GarmentCard';
import PixelIcon from '../components/PixelIcon';
import ErrorBanner from '../components/ErrorBanner';
import ConfirmModal from '../components/ConfirmModal';
import { isTop, isBottom, isFullBody } from '../utils/helpers';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

const FILTERS = [
  { key: 'ALL', label: 'ALL' },
  { key: 'TOPS', label: 'TOPS' },
  { key: 'BOTTOMS', label: 'BOTTOMS' },
  { key: 'FULL', label: 'DRESSES' },
  { key: 'OTHER', label: 'OTHER' },
];

export default function WardrobeScreen({ navigation }) {
  const { wardrobe, removeGarment, clearWardrobe, serverOk, ping } = useApp();
  const [banner, setBanner] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [confirmModal, setConfirmModal] = useState(null);

  const counts = useMemo(() => ({
    ALL: wardrobe.length,
    TOPS: wardrobe.filter((g) => isTop(g.category)).length,
    BOTTOMS: wardrobe.filter((g) => isBottom(g.category)).length,
    FULL: wardrobe.filter((g) => isFullBody(g.category)).length,
    OTHER: wardrobe.filter((g) => !isTop(g.category) && !isBottom(g.category) && !isFullBody(g.category)).length,
  }), [wardrobe]);

  const filteredWardrobe = useMemo(() => {
    if (filter === 'TOPS') return wardrobe.filter((g) => isTop(g.category));
    if (filter === 'BOTTOMS') return wardrobe.filter((g) => isBottom(g.category));
    if (filter === 'FULL') return wardrobe.filter((g) => isFullBody(g.category));
    if (filter === 'OTHER') return wardrobe.filter((g) => !isTop(g.category) && !isBottom(g.category) && !isFullBody(g.category));
    return wardrobe;
  }, [wardrobe, filter]);

  async function pick() {
    if (!serverOk) {
      void ping();
    }
    const { status, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      if (!canAskAgain) {
        Alert.alert('Photo Access Required', 'Please enable photo library access in Settings to catalog your clothes.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]);
      } else {
        setBanner({ message: 'Photo library permission is required to choose garments', type: 'warning' });
      }
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.6, selectionLimit: 0,
    });
    if (!r.canceled && r.assets?.length) navigation.navigate('Analyzing', { images: r.assets });
  }

  async function camera() {
    if (!serverOk) {
      void ping();
    }
    const { status, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      if (!canAskAgain) {
        Alert.alert('Camera Access Required', 'Please enable camera permissions in Settings to photograph your clothes.', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]);
      } else {
        setBanner({ message: 'Camera permission is required to photograph garments', type: 'warning' });
      }
      return;
    }
    const r = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!r.canceled && r.assets?.length) navigation.navigate('Analyzing', { images: r.assets });
  }

  return (
    <SafeAreaView style={s.c} edges={['top']}>
      {banner && <ErrorBanner message={banner.message} type={banner.type} onDismiss={() => setBanner(null)} />}

      {/* Header */}
      <View style={s.hdr}>
        <View>
          <Text style={s.title}>WARDROBE</Text>
          <Text style={s.subTitle}>{wardrobe.length} items logged</Text>
        </View>
        {wardrobe.length > 0 && (
          <TouchableOpacity
            style={s.clearBtn}
            onPress={() => setConfirmModal({
              title: 'CLEAR WARDROBE',
              message: 'Remove all garments from your wardrobe? This action cannot be reversed.',
              confirmText: 'CLEAR ALL',
              onConfirm: () => {
                clearWardrobe();
                setConfirmModal(null);
              },
            })}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <PixelIcon name="trash" size={18} color={COLORS.red} />
          </TouchableOpacity>
        )}
      </View>

      {/* Ingestion Buttons */}
      <View style={s.addRow}>
        <TouchableOpacity style={s.addBtn} onPress={pick} activeOpacity={0.7}>
          <PixelIcon name="image" size={20} color={COLORS.primary} />
          <Text style={s.addTxt}>Scan Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.addBtn} onPress={camera} activeOpacity={0.7}>
          <PixelIcon name="camera" size={20} color={COLORS.secondary} />
          <Text style={[s.addTxt, { color: COLORS.secondary }]}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      {wardrobe.length > 0 && (
        <View style={s.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipRow}>
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[s.chip, active && s.chipActive]}
                  onPress={() => setFilter(f.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.chipTxt, active && s.chipTxtActive]}>
                    {f.label} [{counts[f.key]}]
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Garments List */}
      <FlatList
        data={filteredWardrobe}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: GAP.lg, paddingBottom: GAP.huge }}
        renderItem={({ item }) => (
          <GarmentCard
            garment={item}
            onPress={() => navigation.navigate('GarmentDetail', { garment: item })}
            onDelete={(id) => setConfirmModal({
              title: 'REMOVE GARMENT',
              message: `Remove "${item.summary || 'item'}" from your wardrobe?`,
              confirmText: 'REMOVE',
              onConfirm: () => {
                removeGarment(id);
                setConfirmModal(null);
              },
            })}
          />
        )}
        ListEmptyComponent={
          wardrobe.length === 0 ? (
            <View style={s.empty}>
              <View style={s.emptyIconBox}>
                <PixelIcon name="briefcase" size={38} color={COLORS.textDim} />
              </View>
              <Text style={s.emptyTitle}>WARDROBE EMPTY</Text>
              <Text style={s.emptyTxt}>Upload tops, bottoms, or dresses to generate styled looks</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={pick} activeOpacity={0.8}>
                <PixelIcon name="plus" size={16} color="#0B0C10" />
                <Text style={s.emptyBtnTxt}>UPLOAD FIRST GARMENT</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>NO {filter} FOUND</Text>
              <Text style={s.emptyTxt}>Switch category filter or upload new items</Text>
            </View>
          )
        }
      />
      <ConfirmModal
        visible={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmText={confirmModal?.confirmText}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
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
    paddingTop: GAP.lg,
    paddingBottom: GAP.md,
  },
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
  clearBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  addRow: {
    flexDirection: 'row',
    paddingHorizontal: GAP.lg,
    paddingBottom: GAP.sm,
    gap: GAP.sm,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    paddingVertical: GAP.md,
    gap: GAP.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 48,
  },
  addTxt: {
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    fontSize: TYPE.sm,
  },

  filterContainer: {
    paddingBottom: GAP.md,
  },
  chipRow: {
    paddingHorizontal: GAP.lg,
    gap: GAP.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.cardLight,
  },
  chipTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  chipTxtActive: {
    color: COLORS.primary,
  },

  empty: {
    alignItems: 'center',
    paddingTop: GAP.huge,
    paddingHorizontal: GAP.xl,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: RAD.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: GAP.md,
  },
  emptyTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: TYPE.sm,
    letterSpacing: 1,
  },
  emptyTxt: {
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontSize: TYPE.xs,
    textAlign: 'center',
    marginTop: GAP.xs,
    marginBottom: GAP.lg,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: GAP.lg,
    paddingVertical: GAP.md,
    borderRadius: RAD.xs,
  },
  emptyBtnTxt: {
    fontFamily: FONTS.pixel,
    color: '#0B0C10',
    fontSize: TYPE.xs,
    letterSpacing: 0.8,
  },
});

