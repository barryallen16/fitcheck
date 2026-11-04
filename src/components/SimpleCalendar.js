import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PixelIcon from './PixelIcon';
import { COLORS, TYPE, GAP, RAD, FONTS } from '../constants/theme';
import { todayStr } from '../utils/helpers';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function SimpleCalendar({ markedDates = {}, onDayPress, selectedDate }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const today = todayStr();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function dateStr(day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={prevMonth} style={s.arrow} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <PixelIcon name="chevron-left" size={18} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.monthLabel}>{MONTHS[month].toUpperCase()} {year}</Text>
        <TouchableOpacity onPress={nextMonth} style={s.arrow} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <PixelIcon name="chevron-right" size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Day names */}
      <View style={s.row}>
        {DAYS.map((d) => (
          <View key={d} style={s.cell}>
            <Text style={s.dayName}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Date grid */}
      {Array.from({ length: cells.length / 7 }, (_, rowIdx) => (
        <View key={rowIdx} style={s.row}>
          {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
            if (day === null) {
              return <View key={`empty-${rowIdx}-${colIdx}`} style={s.cell} />;
            }
            const ds = dateStr(day);
            const isToday = ds === today;
            const isSel = ds === selectedDate;
            const hasOutfit = Boolean(markedDates[ds]);

            return (
              <TouchableOpacity
                key={ds}
                style={[
                  s.cell,
                  s.dayCell,
                  isToday && s.todayCell,
                  isSel && s.selectedCell,
                ]}
                onPress={() => onDayPress?.(ds)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.dayNum,
                    isToday && s.todayNum,
                    isSel && s.selectedNum,
                  ]}
                >
                  {day}
                </Text>
                {hasOutfit && <View style={[s.dot, isSel && s.selectedDot]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: RAD.md,
    padding: GAP.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: GAP.md,
  },
  arrow: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabel: {
    fontFamily: FONTS.pixel,
    color: COLORS.text,
    fontSize: TYPE.sm,
    letterSpacing: 1.5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    marginHorizontal: 1,
  },
  dayName: {
    fontFamily: FONTS.pixel,
    color: COLORS.textDim,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  dayCell: {
    borderRadius: RAD.xs,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  selectedCell: {
    backgroundColor: COLORS.primary,
  },
  dayNum: {
    fontFamily: FONTS.regular,
    color: COLORS.text,
    fontSize: TYPE.xs,
  },
  todayNum: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  selectedNum: {
    color: '#0B0C10',
    fontFamily: FONTS.bold,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
    position: 'absolute',
    bottom: 3,
  },
  selectedDot: {
    backgroundColor: '#0B0C10',
  },
});
