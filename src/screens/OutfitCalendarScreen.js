import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import PixelIcon from '../components/PixelIcon';
import SimpleCalendar from '../components/SimpleCalendar';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

export default function OutfitCalendarScreen({ navigation }) {
  const { outfits, wardrobe, outfitsForDate } = useApp();
  const [selectedDate, setSelectedDate] = useState(null);

  const markedDates = useMemo(() => {
    const map = {};
    outfits.forEach((o) => {
      if (o.status === 'worn' && o.wornDate) map[o.wornDate] = true;
    });
    return map;
  }, [outfits]);

  const dayOutfits = selectedDate ? outfitsForDate(selectedDate) : [];

  function formatDate(ds) {
    if (!ds) return '';
    const [y, m, d] = ds.split('-');
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.hdr}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <PixelIcon name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.hdrTitle}>OUTFIT CALENDAR</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <SimpleCalendar
          markedDates={markedDates}
          selectedDate={selectedDate}
          onDayPress={(ds) => setSelectedDate((curr) => (curr === ds ? null : ds))}
        />

        {selectedDate && (
          <View style={s.daySection}>
            <Text style={s.dayTitle}>{formatDate(selectedDate).toUpperCase()}</Text>

            {dayOutfits.length === 0 ? (
              <View style={s.noOutfit}>
                <PixelIcon name="briefcase" size={28} color={COLORS.textMuted} />
                <Text style={s.noOutfitTxt}>No outfit logged for this date</Text>
              </View>
            ) : (
              dayOutfits.map((outfit) => {
                const topG = wardrobe.find((g) => g.id === outfit.topId);
                const botG = wardrobe.find((g) => g.id === outfit.bottomId);

                return (
                  <TouchableOpacity
                    key={outfit.id}
                    style={s.outfitCard}
                    onPress={() => navigation.navigate('OutfitDetail', { outfitId: outfit.id })}
                    activeOpacity={0.7}
                  >
                    <View style={s.outfitImages}>
                      {topG ? (
                        <Image source={{ uri: topG.imageUri }} style={s.outfitImg} />
                      ) : (
                        <View style={[s.outfitImg, s.ph]}>
                          <PixelIcon name="briefcase" size={16} color={COLORS.textMuted} />
                        </View>
                      )}
                      {outfit.bottomLabel !== 'N/A' && (
                        botG ? (
                          <Image source={{ uri: botG.imageUri }} style={s.outfitImg} />
                        ) : (
                          <View style={[s.outfitImg, s.ph]}>
                            <PixelIcon name="sparkles" size={16} color={COLORS.textMuted} />
                          </View>
                        )
                      )}
                    </View>

                    <View style={s.outfitInfo}>
                      <Text style={s.outfitTop} numberOfLines={1}>{outfit.topLabel}</Text>
                      {outfit.bottomLabel !== 'N/A' && (
                        <Text style={s.outfitBot} numberOfLines={1}>+ {outfit.bottomLabel}</Text>
                      )}
                      <Text style={s.outfitWeather} numberOfLines={1}>{outfit.weather}</Text>
                    </View>

                    <PixelIcon name="chevron-right" size={18} color={COLORS.textDim} />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {!selectedDate && (
          <View style={s.hint}>
            <PixelIcon name="calendar" size={24} color={COLORS.textMuted} />
            <Text style={s.hintTxt}>Tap any date to inspect what was worn</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  hdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GAP.lg,
    paddingVertical: GAP.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  hdrTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.sm,
    letterSpacing: 1.5,
  },
  scroll: {
    padding: GAP.lg,
    paddingBottom: GAP.huge,
  },
  daySection: {
    marginTop: GAP.xl,
  },
  dayTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: GAP.sm,
  },
  noOutfit: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: GAP.xs,
  },
  noOutfitTxt: {
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontSize: TYPE.xs,
  },
  outfitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    marginBottom: GAP.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  outfitImages: {
    flexDirection: 'row',
    gap: 4,
  },
  outfitImg: {
    width: 44,
    height: 44,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.cardLight,
  },
  ph: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  outfitInfo: {
    flex: 1,
    marginLeft: GAP.md,
  },
  outfitTop: {
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontSize: TYPE.xs,
  },
  outfitBot: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: 11,
    marginTop: 1,
  },
  outfitWeather: {
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  hint: {
    alignItems: 'center',
    paddingVertical: GAP.xxxl,
    gap: GAP.sm,
  },
  hintTxt: {
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    fontSize: TYPE.xs,
  },
});
