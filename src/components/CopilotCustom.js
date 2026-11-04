import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useCopilot } from 'react-native-copilot';
import PixelIcon from './PixelIcon';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

const STEP_TITLES = {
  brand: 'FITCHECK OVERVIEW',
  todayFit: 'WHAT TO WEAR TODAY',
  endpoint: 'AI INFERENCE BACKEND',
  stylist: 'DAILY OUTFIT MATCH',
  metrics: 'WARDROBE TRACKING',
};

export function CustomTooltip() {
  const {
    goToNext,
    goToPrev,
    stop,
    currentStep,
    currentStepNumber,
    totalStepsNumber,
    isFirstStep,
    isLastStep,
  } = useCopilot();

  const title = (currentStep && STEP_TITLES[currentStep.name]) || 'GUIDE';

  return (
    <View style={s.tooltipContainer}>
      {/* Neon cyber accent top bar */}
      <View style={s.accentBar} />

      {/* Step header */}
      <View style={s.headerRow}>
        <View style={s.badge}>
          <Text style={s.badgeTxt}>
            STEP 0{currentStepNumber} / 0{totalStepsNumber}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => void stop()}
          style={s.skipBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={s.skipTxt}>SKIP TOUR</Text>
        </TouchableOpacity>
      </View>

      {/* Step title & description */}
      <Text style={s.stepTitle}>{title}</Text>
      <Text style={s.stepDesc}>{currentStep?.text}</Text>

      {/* Navigation action buttons */}
      <View style={s.navRow}>
        {!isFirstStep && (
          <TouchableOpacity
            onPress={() => void goToPrev()}
            style={s.prevBtn}
            activeOpacity={0.7}
          >
            <PixelIcon name="chevron-left" size={14} color={COLORS.textDim} />
            <Text style={s.prevTxt}>PREV</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => (isLastStep ? void stop() : void goToNext())}
          style={s.nextBtn}
          activeOpacity={0.7}
        >
          <Text style={s.nextTxt}>{isLastStep ? 'DONE' : 'NEXT'}</Text>
          <PixelIcon
            name={isLastStep ? 'check' : 'chevron-right'}
            size={14}
            color="#0B0C10"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function CustomStepNumber() {
  const { currentStepNumber } = useCopilot();
  return (
    <View style={s.stepNumber}>
      <Text style={s.stepNumberTxt}>{currentStepNumber}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  tooltipContainer: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: GAP.lg,
    width: 295,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: GAP.sm,
  },
  badge: {
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  skipBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  skipTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  stepTitle: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.xs,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  stepDesc: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    lineHeight: 19,
    marginBottom: GAP.lg,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: GAP.sm,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.cardLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 3,
  },
  prevTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.primary,
    gap: 4,
  },
  nextTxt: {
    fontFamily: FONTS.pixel,
    color: '#0B0C10',
    fontSize: 10,
    letterSpacing: 1,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0B0C10',
  },
  stepNumberTxt: {
    fontFamily: FONTS.pixel,
    color: '#0B0C10',
    fontSize: 10,
    lineHeight: 12,
  },
});
