import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useCopilot } from 'react-native-copilot';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PixelIcon from './PixelIcon';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';

const STEP_TITLES = {
  brand: 'SYSTEM OVERVIEW',
  todayFit: 'DAILY ROTATION',
  stylist: 'GENERATE FIT',
  metrics: 'WARDROBE AUDIT',
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
      {/* Top terminal status row */}
      <View style={s.headerRow}>
        <View style={s.stepTag}>
          <Text style={s.stepTagTxt}>
            [{String(currentStepNumber).padStart(2, '0')}/{String(totalStepsNumber).padStart(2, '0')}]
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            AsyncStorage.setItem('@fitcheck_tour_seen', 'true').catch(() => {});
            void stop();
          }}
          style={s.skipBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Skip walkthrough"
          accessibilityRole="button"
        >
          <Text style={s.skipTxt}>[SKIP]</Text>
        </TouchableOpacity>
      </View>

      {/* Step title */}
      <Text style={s.stepTitle}>{title}</Text>

      {/* Step description */}
      <Text style={s.stepDesc}>{currentStep?.text}</Text>

      {/* Footer navigation actions */}
      <View style={s.navRow}>
        {!isFirstStep && (
          <TouchableOpacity
            onPress={() => void goToPrev()}
            style={s.prevBtn}
            activeOpacity={0.7}
            accessibilityLabel="Previous step"
            accessibilityRole="button"
          >
            <PixelIcon name="chevron-left" size={12} color={COLORS.textDim} />
            <Text style={s.prevTxt}>[PREV]</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            if (isLastStep) {
              AsyncStorage.setItem('@fitcheck_tour_seen', 'true').catch(() => {});
              void stop();
            } else {
              void goToNext();
            }
          }}
          style={s.nextBtn}
          activeOpacity={0.85}
          accessibilityLabel={isLastStep ? 'Finish walkthrough' : 'Next step'}
          accessibilityRole="button"
        >
          <Text style={s.nextTxt}>
            {isLastStep ? '[DONE]' : '[NEXT]'}
          </Text>
          <PixelIcon
            name={isLastStep ? 'check' : 'chevron-right'}
            size={12}
            color={COLORS.bg}
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
    borderRadius: RAD.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: GAP.lg,
    width: 290,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: GAP.sm,
  },
  stepTag: {
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: GAP.xs + 2,
    paddingVertical: 2,
    borderRadius: RAD.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepTagTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.primary,
    fontSize: 9,
    letterSpacing: 0.8,
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
    fontSize: TYPE.xs + 1,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  stepDesc: {
    fontFamily: FONTS.regular,
    color: COLORS.textDim,
    fontSize: TYPE.xs,
    lineHeight: 18,
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RAD.xs,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.primary,
    gap: 4,
  },
  nextTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.bg,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '600',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: RAD.xs,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.bg,
  },
  stepNumberTxt: {
    fontFamily: FONTS.pixel,
    color: COLORS.bg,
    fontSize: 10,
    lineHeight: 12,
  },
});
