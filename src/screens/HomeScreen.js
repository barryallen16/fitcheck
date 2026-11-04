import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Animated, PanResponder, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { CopilotStep, walkthroughable, useCopilot } from 'react-native-copilot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import PixelIcon from '../components/PixelIcon';
import ErrorBanner from '../components/ErrorBanner';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';
import { getUnusedCombinations, todayStr } from '../utils/helpers';

const NativeWalkableView = React.forwardRef((props, ref) => (
  <View ref={ref} collapsable={false} {...props} />
));
const CopilotView = walkthroughable(NativeWalkableView);

export default function HomeScreen({ navigation }) {
  const { wardrobe, outfits, serverUrl, serverOk, ping, wearOutfit, unwearOutfit, addOutfit } = useApp();
  const { start, copilotEvents } = useCopilot();
  const scrollRef = useRef(null);
  const [banner, setBanner] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fitIdx, setFitIdx] = useState(0);

  useFocusEffect(useCallback(() => { ping(); }, []));

  useEffect(() => {
    async function checkAutoTour() {
      try {
        const seen = await AsyncStorage.getItem('@fitcheck_tour_seen');
        if (!seen) {
          setTimeout(() => {
            start();
          }, 800);
        }
      } catch (_) {}
    }
    checkAutoTour();

    const onStop = () => {
      AsyncStorage.setItem('@fitcheck_tour_seen', 'true').catch(() => {});
    };
    const onStepChange = (step) => {
      if (!step) return;
      if (step.name === 'metrics') {
        scrollRef.current?.scrollToEnd({ animated: true });
      } else if (step.name === 'brand' || step.name === 'todayFit') {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    };
    copilotEvents.on('stop', onStop);
    copilotEvents.on('stepChange', onStepChange);
    return () => {
      copilotEvents.off('stop', onStop);
      copilotEvents.off('stepChange', onStepChange);
    };
  }, [copilotEvents, start]);

  const cats = new Set(wardrobe.map((g) => g.category)).size;
  const worn = outfits.filter((o) => o.status === 'worn').length;
  const todayDate = todayStr();

  // Startup & live check: has an outfit already been logged/selected for today?
  const todayWornOutfit = useMemo(() => {
    return outfits.find((o) => o.status === 'worn' && o.wornDate === todayDate) || null;
  }, [outfits, todayDate]);

  const todayTop = useMemo(() => {
    if (!todayWornOutfit) return null;
    return wardrobe.find((g) => g.id === todayWornOutfit.topId) || {
      id: 'today-top',
      category: 'Top',
      summary: todayWornOutfit.topLabel || 'Top Garment',
    };
  }, [todayWornOutfit, wardrobe]);

  const todayBot = useMemo(() => {
    if (!todayWornOutfit) return null;
    return wardrobe.find((g) => g.id === todayWornOutfit.bottomId) || (
      todayWornOutfit.bottomLabel
        ? { id: 'today-bot', category: 'Bottom', summary: todayWornOutfit.bottomLabel }
        : null
    );
  }, [todayWornOutfit, wardrobe]);

  const unwornOutfits = useMemo(() => outfits.filter((o) => o.status === 'unworn'), [outfits]);
  const unusedCombinations = useMemo(() => getUnusedCombinations(wardrobe, outfits), [wardrobe, outfits]);

  const currentFitIndex = unwornOutfits.length > 0 ? (fitIdx % unwornOutfits.length) : 0;
  const visibleDotIndices = useMemo(() => {
    const total = unwornOutfits.length;
    if (total <= 1) return [];
    const maxDots = 6;
    if (total <= maxDots) {
      return Array.from({ length: total }, (_, i) => i);
    }
    let start = currentFitIndex - Math.floor(maxDots / 2);
    if (start < 0) start = 0;
    if (start + maxDots > total) start = total - maxDots;
    return Array.from({ length: maxDots }, (_, i) => start + i);
  }, [unwornOutfits.length, currentFitIndex]);

  const activeFit = unwornOutfits.length > 0
    ? unwornOutfits[currentFitIndex]
    : null;

  const fallbackCandidate = !activeFit && unusedCombinations.length > 0
    ? unusedCombinations[0]
    : null;

  const topGarment = activeFit
    ? wardrobe.find((g) => g.id === activeFit.topId)
    : fallbackCandidate?.top;

  const botGarment = activeFit
    ? wardrobe.find((g) => g.id === activeFit.bottomId)
    : fallbackCandidate?.bottom;

  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateToNext = useCallback(() => {
    if (unwornOutfits.length <= 1) return;
    Animated.timing(slideAnim, {
      toValue: -1,
      duration: 110,
      useNativeDriver: true,
    }).start(() => {
      setFitIdx((p) => (p + 1) % unwornOutfits.length);
      slideAnim.setValue(1);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 12,
        useNativeDriver: true,
      }).start();
    });
  }, [unwornOutfits.length, slideAnim]);

  const animateToPrev = useCallback(() => {
    if (unwornOutfits.length <= 1) return;
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 110,
      useNativeDriver: true,
    }).start(() => {
      setFitIdx((p) => (p === 0 ? unwornOutfits.length - 1 : p - 1));
      slideAnim.setValue(-1);
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 12,
        useNativeDriver: true,
      }).start();
    });
  }, [unwornOutfits.length, slideAnim]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          if (unwornOutfits.length <= 1) return false;
          return (
            Math.abs(gestureState.dx) > 16 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.3
          );
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -30) {
            animateToNext();
          } else if (gestureState.dx > 30) {
            animateToPrev();
          }
        },
      }),
    [unwornOutfits.length, animateToNext, animateToPrev]
  );

  const translateX = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-45, 0, 45],
  });
  const cardOpacity = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0.4, 1, 0.4],
  });

  function handleUnwearToday() {
    if (!todayWornOutfit) return;
    Alert.alert(
      "Change Today's Outfit?",
      "Unmark this outfit as worn for today so you can choose another look?",
      [
        { text: 'Keep Worn', style: 'cancel' },
        {
          text: 'Change',
          style: 'destructive',
          onPress: () => {
            unwearOutfit(todayWornOutfit.id);
            setBanner({ message: 'Outfit unlogged. You can pick another look for today.', type: 'info' });
          },
        },
      ]
    );
  }

  async function handleWearCurrent() {
    if (activeFit) {
      wearOutfit(activeFit.id, todayDate);
      setBanner({ message: "Logged as today's fit! View in Outfit Calendar.", type: 'success' });
    } else if (fallbackCandidate) {
      const topLabel = fallbackCandidate.top.summary || fallbackCandidate.top.category;
      const botLabel = fallbackCandidate.bottom
        ? (fallbackCandidate.bottom.summary || fallbackCandidate.bottom.category)
        : 'N/A';
      const o = await addOutfit({
        topId: fallbackCandidate.top.id,
        bottomId: fallbackCandidate.bottom?.id || null,
        topLabel,
        bottomLabel: botLabel,
        weather: 'Direct Pair',
        score: 4.5,
        probability: 0.9,
      });
      if (o?.id) {
        wearOutfit(o.id, todayDate);
        setBanner({ message: "Saved and logged as today's fit!", type: 'success' });
      }
    }
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {banner && <ErrorBanner message={banner.message} type={banner.type} onDismiss={() => setBanner(null)} />}

      {/* Top utility bar */}
      <View style={s.topBar}>
        <TouchableOpacity
          style={s.serverPill}
          onPress={() => navigation.navigate('Me')}
          activeOpacity={0.7}
        >
          <View style={[s.serverDot, { backgroundColor: serverOk ? COLORS.green : COLORS.red }]} />
          <Text style={s.serverPillTxt}>
            {serverOk
              ? (serverUrl?.includes('hf.space') ? 'CLOUD ACTIVE' : 'LOCAL LM STUDIO')
              : 'OFFLINE'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.tourBtn}
          onPress={() => start()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <PixelIcon name="zap" size={13} color={COLORS.primary} />
          <Text style={s.tourBtnTxt}>TOUR</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => { setRefreshing(true); await ping(); setRefreshing(false); }}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Brand Header */}
        <CopilotStep
          name="brand"
          order={1}
          text="FitCheck organizes your clothes into tops and bottoms, then scores daily outfit pairs based on temperature and color balance."
        >
          <CopilotView style={s.logoWrap}>
            <Image
              style={s.logo}
              source={require('../../assets/logo.png')}
              contentFit="contain"
            />
            <Text style={s.tagline}>AI-Powered Wardrobe & Outfit Engine</Text>
          </CopilotView>
        </CopilotStep>

        {/* What to Wear Today or Today's Selected Outfit */}
        <CopilotStep
          name="todayFit"
          order={2}
          text={
            todayWornOutfit
              ? "Your locked-in outfit for today. You can tap Change to swap it or view it in your outfit calendar."
              : "Check today's suggested look with your top and bottom garments stacked in order. You can log it as worn with one tap."
          }
        >
          <CopilotView style={s.fitCard}>
            {todayWornOutfit ? (
              // Selected / Worn Outfit for Today
              <View>
                <View style={s.fitHdr}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <PixelIcon name="check" size={14} color={COLORS.green} />
                    <Text style={s.fitHdrTitle}>TODAY'S OUTFIT</Text>
                  </View>
                  <View style={[s.fitBadge, { borderColor: COLORS.green }]}>
                    <Text style={[s.fitBadgeTxt, { color: COLORS.green }]}>LOCKED IN</Text>
                  </View>
                </View>

                <View style={s.stackContainer}>
                  {/* Top Garment */}
                  <View style={s.pieceRow}>
                    {todayTop?.imageUri ? (
                      <Image source={{ uri: todayTop.imageUri }} style={s.pieceImg} contentFit="cover" />
                    ) : (
                      <View style={[s.pieceImg, s.piecePh]}>
                        <PixelIcon name="briefcase" size={20} color={COLORS.textMuted} />
                      </View>
                    )}
                    <View style={s.pieceMeta}>
                      <View style={s.slotTagTop}>
                        <Text style={s.slotTagTxtTop}>TOP</Text>
                      </View>
                      <Text style={s.pieceTitle} numberOfLines={1}>
                        {todayTop?.summary || todayTop?.category || 'Top Garment'}
                      </Text>
                      <Text style={s.pieceSub} numberOfLines={1}>
                        {todayTop?.category} {todayTop?.color ? `· ${todayTop.color}` : ''}
                      </Text>
                    </View>
                  </View>

                  {/* Vertical Connector */}
                  <View style={s.connector}>
                    <View style={[s.connectorLine, { backgroundColor: COLORS.green }]} />
                    <View style={[s.connectorBadge, { borderColor: COLORS.green }]}>
                      <PixelIcon name="check" size={11} color={COLORS.green} />
                    </View>
                    <View style={[s.connectorLine, { backgroundColor: COLORS.green }]} />
                  </View>

                  {/* Bottom Garment */}
                  <View style={s.pieceRow}>
                    {todayBot?.imageUri ? (
                      <Image source={{ uri: todayBot.imageUri }} style={s.pieceImg} contentFit="cover" />
                    ) : (
                      <View style={[s.pieceImg, s.piecePh]}>
                        <PixelIcon name="sparkles" size={20} color={COLORS.textMuted} />
                      </View>
                    )}
                    <View style={s.pieceMeta}>
                      <View style={s.slotTagBot}>
                        <Text style={s.slotTagTxtBot}>BOTTOM</Text>
                      </View>
                      <Text style={s.pieceTitle} numberOfLines={1}>
                        {todayBot ? (todayBot.summary || todayBot.category) : 'Full Body Piece'}
                      </Text>
                      <Text style={s.pieceSub} numberOfLines={1}>
                        {todayBot ? `${todayBot.category} ${todayBot.color ? `· ${todayBot.color}` : ''}` : 'One-Piece'}
                      </Text>
                    </View>
                  </View>

                  {/* Footer Actions */}
                  <View style={s.fitFooter}>
                    <View style={[s.scoreBox, { borderColor: COLORS.green }]}>
                      <Text style={[s.scoreBoxTxt, { color: COLORS.green }]}>
                        {todayWornOutfit.score
                          ? `${Math.round((todayWornOutfit.probability || (todayWornOutfit.score / 5)) * 100)}% MATCH`
                          : 'WORN TODAY'}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', gap: GAP.sm }}>
                      <TouchableOpacity
                        style={s.cycleBtn}
                        onPress={handleUnwearToday}
                        activeOpacity={0.7}
                      >
                        <PixelIcon name="refresh" size={13} color={COLORS.secondary} />
                        <Text style={s.cycleTxt}>CHANGE</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[s.wearBtn, { backgroundColor: COLORS.cardLight, borderWidth: 1, borderColor: COLORS.border }]}
                        onPress={() => navigation.navigate('Style', { screen: 'OutfitCalendar' })}
                        activeOpacity={0.7}
                      >
                        <PixelIcon name="calendar" size={14} color={COLORS.text} />
                        <Text style={[s.wearTxt, { color: COLORS.text }]}>CALENDAR</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              // Unworn Suggestion: What to Wear Today
              <View>
                <View style={s.fitHdr}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <PixelIcon name="sparkles" size={14} color={COLORS.primary} />
                    <Text style={s.fitHdrTitle}>WHAT TO WEAR TODAY</Text>
                  </View>
                  {unwornOutfits.length > 0 ? (
                    <View style={s.fitBadge}>
                      <Text style={s.fitBadgeTxt}>
                        {((fitIdx % unwornOutfits.length) + 1)} OF {unwornOutfits.length}
                        {unwornOutfits.length > 1 ? ' · SWIPE' : ''}
                      </Text>
                    </View>
                  ) : fallbackCandidate ? (
                    <View style={s.fitBadge}>
                      <Text style={s.fitBadgeTxt}>FRESH PAIR</Text>
                    </View>
                  ) : null}
                </View>

                {topGarment ? (
                  <View>
                    <Animated.View
                      style={[
                        s.stackContainer,
                        { transform: [{ translateX }], opacity: cardOpacity },
                      ]}
                      {...panResponder.panHandlers}
                    >
                      {/* Top Garment */}
                      <View style={s.pieceRow}>
                        {topGarment.imageUri ? (
                          <Image source={{ uri: topGarment.imageUri }} style={s.pieceImg} contentFit="cover" />
                        ) : (
                          <View style={[s.pieceImg, s.piecePh]}>
                            <PixelIcon name="briefcase" size={20} color={COLORS.textMuted} />
                          </View>
                        )}
                        <View style={s.pieceMeta}>
                          <View style={s.slotTagTop}>
                            <Text style={s.slotTagTxtTop}>TOP</Text>
                          </View>
                          <Text style={s.pieceTitle} numberOfLines={1}>
                            {topGarment.summary || topGarment.category}
                          </Text>
                          <Text style={s.pieceSub} numberOfLines={1}>
                            {topGarment.category} {topGarment.color ? `· ${topGarment.color}` : ''}
                          </Text>
                        </View>
                      </View>

                      {/* Vertical Connector */}
                      <View style={s.connector}>
                        <View style={s.connectorLine} />
                        <View style={s.connectorBadge}>
                          <PixelIcon name="sliders" size={11} color={COLORS.textDim} />
                        </View>
                        <View style={s.connectorLine} />
                      </View>

                      {/* Bottom Garment */}
                      <View style={s.pieceRow}>
                        {botGarment?.imageUri ? (
                          <Image source={{ uri: botGarment.imageUri }} style={s.pieceImg} contentFit="cover" />
                        ) : (
                          <View style={[s.pieceImg, s.piecePh]}>
                            <PixelIcon name="sparkles" size={20} color={COLORS.textMuted} />
                          </View>
                        )}
                        <View style={s.pieceMeta}>
                          <View style={s.slotTagBot}>
                            <Text style={s.slotTagTxtBot}>BOTTOM</Text>
                          </View>
                          <Text style={s.pieceTitle} numberOfLines={1}>
                            {botGarment ? (botGarment.summary || botGarment.category) : 'Full Body Piece'}
                          </Text>
                          <Text style={s.pieceSub} numberOfLines={1}>
                            {botGarment ? `${botGarment.category} ${botGarment.color ? `· ${botGarment.color}` : ''}` : 'One-Piece'}
                          </Text>
                        </View>
                      </View>
                    </Animated.View>

                    {/* Footer Action Row with Chevron Buttons, Dots & Wear Button */}
                    <View style={s.fitFooter}>
                      {activeFit?.score ? (
                        <View style={s.scoreBox}>
                          <Text style={s.scoreBoxTxt}>
                            {Math.round((activeFit.probability || (activeFit.score / 5)) * 100)}% MATCH
                          </Text>
                        </View>
                      ) : (
                        <View style={s.scoreBox}>
                          <Text style={s.scoreBoxTxt}>UNWORN</Text>
                        </View>
                      )}

                      {unwornOutfits.length > 1 && (
                        <View style={s.navRow}>
                          <TouchableOpacity
                            onPress={animateToPrev}
                            style={s.navArrowBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            activeOpacity={0.6}
                            accessibilityLabel="Previous outfit"
                          >
                            <PixelIcon name="chevron-left" size={12} color={COLORS.textDim} />
                          </TouchableOpacity>

                          <View style={s.dotsWrap}>
                            {visibleDotIndices.map((realIdx) => (
                              <View
                                key={realIdx}
                                style={[
                                  s.navDot,
                                  realIdx === currentFitIndex && s.navDotActive,
                                ]}
                              />
                            ))}
                          </View>

                          <TouchableOpacity
                            onPress={animateToNext}
                            style={s.navArrowBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            activeOpacity={0.6}
                            accessibilityLabel="Next outfit"
                          >
                            <PixelIcon name="chevron-right" size={12} color={COLORS.textDim} />
                          </TouchableOpacity>
                        </View>
                      )}

                      <TouchableOpacity
                        style={s.wearBtn}
                        onPress={handleWearCurrent}
                        activeOpacity={0.7}
                      >
                        <PixelIcon name="check" size={14} color="#0B0C10" />
                        <Text style={s.wearTxt}>WEAR TODAY</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={s.emptyFit}>
                    <PixelIcon name="briefcase" size={28} color={COLORS.textDim} />
                    <Text style={s.emptyFitTitle}>NO OUTFIT READY YET</Text>
                    <Text style={s.emptyFitSub}>Catalog clothes in your wardrobe to preview daily pairings.</Text>
                    <TouchableOpacity
                      style={s.openWardrobeBtn}
                      onPress={() => navigation.navigate('Wardrobe')}
                      activeOpacity={0.7}
                    >
                      <Text style={s.openWardrobeTxt}>OPEN WARDROBE</Text>
                      <PixelIcon name="chevron-right" size={14} color="#0B0C10" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </CopilotView>
        </CopilotStep>

        {/* Quick CTA - Generate Today's Fit */}
        <CopilotStep
          name="stylist"
          order={3}
          text="Generates a recommended look for today. You can anchor a specific shirt or pants first, or let the model pick an unworn combination."
        >
          <CopilotView>
            <TouchableOpacity
              style={s.ctaCard}
              onPress={() => navigation.navigate('Style', { screen: 'Recommendation' })}
              activeOpacity={0.8}
            >
              <View style={s.ctaIconBox}>
                <PixelIcon name="sparkles" size={24} color="#0B0C10" />
              </View>
              <View style={{ flex: 1, marginLeft: GAP.md }}>
                <Text style={s.ctaTitle}>GENERATE TODAY'S FIT</Text>
                <Text style={s.ctaSub}>Pairwise compatibility scored by fine-tuned Task B</Text>
              </View>
              <PixelIcon name="chevron-right" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </CopilotView>
        </CopilotStep>

        {/* Condensed Wardrobe Metrics Strip */}
        <CopilotStep
          name="metrics"
          order={4}
          text="Shows your total garment inventory and worn rotation history so you can see which pieces rarely get used."
        >
          <CopilotView style={s.metricsCard}>
            <TouchableOpacity
              style={s.metricItem}
              onPress={() => navigation.navigate('Wardrobe')}
              activeOpacity={0.7}
            >
              <Text style={s.metricNum}>{wardrobe.length}</Text>
              <Text style={s.metricLbl}>Items</Text>
            </TouchableOpacity>
            <View style={s.metricDivider} />
            <TouchableOpacity
              style={s.metricItem}
              onPress={() => navigation.navigate('Wardrobe')}
              activeOpacity={0.7}
            >
              <Text style={[s.metricNum, { color: COLORS.secondary }]}>{cats}</Text>
              <Text style={s.metricLbl}>Categories</Text>
            </TouchableOpacity>
            <View style={s.metricDivider} />
            <TouchableOpacity
              style={s.metricItem}
              onPress={() => navigation.navigate('Style', { screen: 'OutfitHistory' })}
              activeOpacity={0.7}
            >
              <Text style={[s.metricNum, { color: COLORS.green }]}>{unwornOutfits.length}</Text>
              <Text style={s.metricLbl}>Unworn</Text>
            </TouchableOpacity>
            <View style={s.metricDivider} />
            <TouchableOpacity
              style={s.metricItem}
              onPress={() => navigation.navigate('Style', { screen: 'OutfitCalendar' })}
              activeOpacity={0.7}
            >
              <Text style={[s.metricNum, { color: COLORS.orange }]}>{worn}</Text>
              <Text style={s.metricLbl}>Worn</Text>
            </TouchableOpacity>
          </CopilotView>
        </CopilotStep>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: GAP.lg,
    paddingVertical: GAP.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.cardLight,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  serverPillTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  tourBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.cardLight,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tourBtnTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  scroll: {
    paddingHorizontal: GAP.lg,
    paddingBottom: GAP.huge,
  },

  logoWrap: {
    alignItems: 'center',
    paddingTop: GAP.md,
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
    marginTop: 4,
    letterSpacing: 0.5,
  },

  // Today's Fit Card
  fitCard: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: GAP.md,
    marginBottom: GAP.lg,
  },
  fitHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: GAP.md,
    paddingBottom: GAP.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  fitHdrTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  fitBadge: {
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fitBadgeTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.secondary,
    fontSize: 8,
    letterSpacing: 0.8,
  },

  stackContainer: {
    width: '100%',
  },
  pieceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardLight,
    borderRadius: RAD.xs,
    padding: GAP.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pieceImg: {
    width: 60,
    height: 60,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.bg,
  },
  piecePh: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceMeta: {
    flex: 1,
    marginLeft: GAP.md,
  },
  slotTagTop: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 4,
  },
  slotTagTxtTop: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 8,
    letterSpacing: 1,
  },
  slotTagBot: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.card,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    marginBottom: 4,
  },
  slotTagTxtBot: {
    fontFamily: FONTS.pixel,
    color: COLORS.secondary,
    fontSize: 8,
    letterSpacing: 1,
  },
  pieceTitle: {
    fontFamily: FONTS.medium,
    color: COLORS.text,
    fontSize: TYPE.xs,
  },
  pieceSub: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 2,
  },

  connector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  connectorLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  connectorBadge: {
    paddingHorizontal: 8,
  },

  fitFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: GAP.md,
    paddingTop: GAP.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  scoreBox: {
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scoreBoxTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  cycleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.cardLight,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cycleTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.secondary,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  wearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: RAD.xs,
  },
  wearTxt: {
    fontFamily: FONTS.pixel,
    color: '#0B0C10',
    fontSize: 10,
    letterSpacing: 1,
  },
  dotsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navArrowBtn: {
    width: 26,
    height: 26,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    width: 14,
  },

  emptyFit: {
    alignItems: 'center',
    paddingVertical: GAP.xl,
    gap: GAP.xs,
  },
  emptyFitTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.xs,
    letterSpacing: 1,
    marginTop: GAP.xs,
  },
  emptyFitSub: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: 10,
    textAlign: 'center',
    marginBottom: GAP.sm,
  },
  openWardrobeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RAD.xs,
  },
  openWardrobeTxt: {
    fontFamily: FONTS.pixel,
    color: '#0B0C10',
    fontSize: 10,
    letterSpacing: 1,
  },

  // CTA Card
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: GAP.lg,
  },
  ctaIconBox: {
    width: 40,
    height: 40,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.xs,
    letterSpacing: 1,
  },
  ctaSub: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 2,
  },

  // Condensed Metrics Card
  metricsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: GAP.md,
    paddingHorizontal: GAP.xs,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricNum: {
    fontFamily: FONTS.bold,
    fontSize: TYPE.lg,
    color: COLORS.primary,
  },
  metricLbl: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: COLORS.textDim,
    marginTop: 1,
    textTransform: 'uppercase',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
});
