import React from 'react';
import { View, Text, StyleSheet, Modal, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import PixelIcon from './PixelIcon';
import GarmentCard from './GarmentCard';
import { COLORS, TYPE, GAP, FONTS } from '../constants/theme';

export default function BaseGarmentSelector({ visible, wardrobe, selectedId, onSelect, onClose }) {
  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={s.wrap}>
        <View style={s.hdr}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={s.iconBtn}
          >
            <PixelIcon name="close" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={s.title}>SELECT ANCHOR PIECE</Text>
          <TouchableOpacity
            onPress={() => { onSelect(null); onClose(); }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={s.clearBtn}
          >
            <Text style={s.clear}>CLEAR</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.sub}>Choose a garment to anchor your recommendation</Text>
        <FlatList
          data={wardrobe}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: GAP.lg, paddingBottom: GAP.huge }}
          renderItem={({ item }) => (
            <GarmentCard
              garment={item}
              isSelected={selectedId === item.id}
              selectable
              onPress={() => { onSelect(item.id); onClose(); }}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: GAP.huge * 2 }}>
              <Text style={{ fontFamily: FONTS.regular, color: COLORS.textMuted, fontSize: TYPE.sm }}>
                No garments in wardrobe yet
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  hdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GAP.lg,
    paddingVertical: GAP.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.sm,
    letterSpacing: 1.5,
  },
  clearBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: GAP.xs,
  },
  clear: {
    fontFamily: FONTS.pixel,
    color: COLORS.red,
    fontSize: TYPE.xs,
    letterSpacing: 1,
  },
  sub: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    paddingHorizontal: GAP.lg,
    paddingVertical: GAP.md,
  },
});
