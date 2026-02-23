import Svg, { Rect, Path } from 'react-native-svg';

interface YouTubeIconProps {
  size?: number;
  color?: string;
}

export function YouTubeIcon({ size = 24, color = '#FF0000' }: YouTubeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      {/* Fundo arredondado */}
      <Rect x="2" y="3" width="20" height="18" rx="2.5" fill={color} />
      
      {/* Triângulo de play branco */}
      <Path
        d="M9.5 8L9.5 16L16 12Z"
        fill="white"
      />
    </Svg>
  );
}
