import React from 'react';
import Svg, { Image as SvgImage } from 'react-native-svg';

export default function FitCheckLogo({ width = 200, height = 84, style }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 303 127" style={style}>
      <SvgImage
        x="0"
        y="0"
        width="303"
        height="127"
        preserveAspectRatio="xMidYMid meet"
        href={require('../../assets/logo.png')}
      />
    </Svg>
  );
}
