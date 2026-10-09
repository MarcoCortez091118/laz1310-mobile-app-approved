import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface IconButtonProps {
  name: IoniconName;
  onPress?: () => void;
  size?: number;
  iconSize?: number;
  backgroundColor?: string;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}

export function IconButton({
  name,
  onPress,
  size = 48,
  iconSize = 21,
  backgroundColor,
  iconColor,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: backgroundColor ?? colors.surfaceElevated,
          opacity: pressed ? 0.72 : 1,
        },
        style,
      ]}
    >
      <Ionicons
        name={name}
        color={iconColor ?? colors.white}
        size={iconSize}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
