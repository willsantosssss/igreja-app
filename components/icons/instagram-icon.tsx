import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';

interface InstagramIconProps {
  size?: number;
  color?: string;
}

export function InstagramIcon({ size = 24, color = '#E4405F' }: InstagramIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="instagramGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#FD5949" />
          <Stop offset="5%" stopColor="#D6249F" />
          <Stop offset="45%" stopColor="#285AEB" />
        </LinearGradient>
      </Defs>
      
      {/* Fundo arredondado */}
      <Rect x="2" y="2" width="20" height="20" rx="4.5" fill="url(#instagramGradient)" />
      
      {/* Círculo do meio */}
      <Circle cx="12" cy="12" r="3.5" fill="white" />
      
      {/* Ponto de flash */}
      <Circle cx="17" cy="7" r="1" fill="white" />
    </Svg>
  );
}
