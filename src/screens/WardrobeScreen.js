import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import GarmentCard from '../components/GarmentCard';
import PixelIcon from '../components/PixelIcon';
import ErrorBanner from '../components/ErrorBanner';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

export default function WardrobeScreen({ navigation }) {
  const { wardrobe, removeGarment, clearWardrobe, serverOk } = useApp();
  const [banner, setBanner] = useState(null);

  async function pick() {
    if (!serverOk) { setBanner({ message: 'Connect to AI endpoint first', type: 'error' }); return; }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { setBanner({ message: 'Permission required', type: 'error' }); return; }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.6, selectionLimit: 0,
    });
    if (!r.canceled && r.assets?.length) navigation.navigate('Analyzing', { images: r.assets });
  }

  async function camera() {
    if (!serverOk) { setBanner({ message: 'Connect to AI endpoint first', type: 'error' }); return; }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { setBanner({ message: 'Permission required', type: 'error' }); return; }
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
            onPress={() => Alert.alert('Clear All', 'Remove all garments?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: clearWardrobe }
            ])}
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

      {/* Garments List */}
      <FlatList
        data={wardrobe}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ paddingHorizontal: GAP.lg, paddingBottom: GAP.huge }}
        renderItem={({ item }) => (
          <GarmentCard
            garment={item}
            onPress={() => navigation.navigate('GarmentDetail', { garment: item })}
            onDelete={(id) => Alert.alert('Remove Garment?', '', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', style: 'destructive', onPress: () => removeGarment(id) }
            ])}
          />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconBox}>
              <PixelIcon name="briefcase" size={40} color={COLORS.textDim} />
            </View>
            <Text style={s.emptyTitle}>WARDROBE EMPTY</Text>
            <Text style={s.emptyTxt}>Upload tops, bottoms, or dresses to generate styled looks</Text>
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
    paddingBottom: GAP.md,
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

  empty: {
    alignItems: 'center',
    paddingTop: GAP.huge * 1.5,
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
  },
});
