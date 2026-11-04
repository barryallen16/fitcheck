import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PixelIcon from '../components/PixelIcon';
import ConfirmModal from '../components/ConfirmModal';
import { useApp } from '../context/AppContext';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

const W = Dimensions.get('window').width;

export default function GarmentDetailScreen({ route, navigation }) {
  const { garment } = route.params;
  const { removeGarment } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDel() {
    setShowConfirm(true);
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.hdr}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.btn}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <PixelIcon name="arrow-left" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={s.hdrTitle}>GARMENT INSPECTION</Text>
          <TouchableOpacity
            onPress={handleDel}
            style={s.btn}
            accessibilityLabel="Delete garment"
            accessibilityRole="button"
          >
            <PixelIcon name="trash" size={18} color={COLORS.red} />
          </TouchableOpacity>
        </View>

        <View style={s.imgWrap}>
          <Image source={{ uri: garment.imageUri }} style={s.img} resizeMode="cover" />
        </View>

        <View style={s.body}>
          <View style={s.catBadge}>
            <Text style={s.catTxt}>{garment.category}</Text>
          </View>
          <Text style={s.title}>{garment.summary}</Text>

          <View style={s.card}>
            <Text style={s.secLabel}>VLM ATTRIBUTE ANALYSIS</Text>
            <Text style={s.desc}>{garment.analyzed_garment}</Text>
          </View>

          <View style={s.metaCard}>
            <View style={s.metaRow}>
              <Text style={s.metaKey}>ID</Text>
              <Text style={s.metaVal} numberOfLines={1}>{garment.id}</Text>
            </View>
            <View style={s.metaDivider} />
            <View style={s.metaRow}>
              <Text style={s.metaKey}>INDEXED</Text>
              <Text style={s.metaVal}>
                {new Date(garment.addedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showConfirm}
        title="REMOVE GARMENT"
        message={`Remove "${garment.summary}" from your wardrobe?`}
        confirmText="REMOVE"
        onConfirm={() => {
          setShowConfirm(false);
          removeGarment(garment.id);
          navigation.goBack();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  hdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: GAP.lg,
    paddingVertical: GAP.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: RAD.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hdrTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  imgWrap: {
    alignItems: 'center',
    paddingTop: GAP.lg,
  },
  img: {
    width: W - GAP.lg * 2,
    height: W - GAP.lg * 2,
    borderRadius: RAD.md,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  body: {
    paddingHorizontal: GAP.lg,
    paddingTop: GAP.lg,
    paddingBottom: GAP.huge,
  },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.secondaryMuted + '30',
    paddingHorizontal: GAP.sm,
    paddingVertical: 3,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.secondaryMuted,
    marginBottom: GAP.sm,
  },
  catTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.secondary,
    fontSize: 10,
    letterSpacing: 1,
  },
  title: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: TYPE.xl,
    marginBottom: GAP.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: GAP.md,
  },
  secLabel: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: GAP.sm,
  },
  desc: {
    fontFamily: FONTS.regular,
    color: COLORS.text,
    fontSize: TYPE.sm,
    lineHeight: 20,
  },
  metaCard: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaKey: {
    fontFamily: FONTS.pixel,
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1,
  },
  metaVal: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    maxWidth: '70%',
  },
  metaDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: GAP.sm,
  },
});
