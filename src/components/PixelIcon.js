import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { PIXEL_PATHS } from './pixelPaths';

const ALIASES = {
  'checkmark': 'check',
  'checkmark-circle': 'check',
  'checkmark-circle-outline': 'check',
  'close-circle': 'close',
  'close-circle-outline': 'close',
  'arrow-back': 'arrow-left',
  'arrow-forward': 'arrow-right',
  'chevron-forward': 'chevron-right',
  'chevron-back': 'chevron-left',
  'chevron-up': 'chevron-left',
  'chevron-down': 'chevron-right',
  'trash-outline': 'trash',
  'camera-outline': 'camera',
  'camera-reverse-outline': 'camera',
  'images-outline': 'image',
  'calendar-outline': 'calendar',
  'information-circle-outline': 'info-box',
  'warning-outline': 'info-box',
  'alert-circle': 'info-box',
  'shirt-outline': 'shirt',
  'cut-outline': 'shirt',
  'shield-checkmark': 'shield',
  'layers-outline': 'shirt',
  'refresh-outline': 'refresh',
  'color-palette-outline': 'sunglasses',
  'body-outline': 'user',
  'person': 'user',
  'man': 'user',
  'woman': 'user',
  'add': 'plus',
  'add-circle-outline': 'plus',
  'trophy': 'shield',
  'help-circle-outline': 'info-box',
  'partly-sunny': 'sun',
  'sunny': 'sun',
  'cloudy': 'cloud',
  'time-outline': 'clock',
  'search-outline': 'search',
  'shades': 'sunglasses',
};

export default function PixelIcon({ name, size = 24, color = '#E6E7EB', style }) {
  const resolved = ALIASES[name] || name;
  const paths = PIXEL_PATHS[resolved] || PIXEL_PATHS['shirt'] || [];

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {paths.map((p, i) => (
        <Path key={i} d={p} fill={color} />
      ))}
    </Svg>
  );
}
