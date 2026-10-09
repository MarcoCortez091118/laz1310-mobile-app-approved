import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii } from '../theme/tokens';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: PrimaryButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: secondary
            ? colors.surfaceElevated
            : colors.red,
          borderColor: secondary ? colors.border : colors.red,
          opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: secondary ? colors.white : '#FEFEFE' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: radii.round,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
});
