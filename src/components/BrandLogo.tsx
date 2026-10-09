import {
  Image,
  ImageStyle,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';

interface BrandLogoProps {
  variant?: 'negative' | 'positive';
  width?: number;
  style?: StyleProp<ViewStyle>;
}

const sources = {
  negative: require('../../assets/brand/La Z-02.webp'),
  positive: require('../../assets/brand/La Z-01.webp'),
};

export function BrandLogo({
  variant,
  width = 118,
  style,
}: BrandLogoProps) {
  const { preference } = useAppTheme();
  const resolvedVariant =
    variant ?? (preference === 'dark' ? 'negative' : 'positive');

  const imageStyle: ImageStyle = {
    width,
    height: width * 0.6,
    resizeMode: 'contain',
  };

  return (
    <View style={style}>
      <Image source={sources[resolvedVariant]} style={imageStyle} />
    </View>
  );
}
