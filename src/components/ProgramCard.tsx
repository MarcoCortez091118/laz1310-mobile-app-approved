import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii, spacing } from '../theme/tokens';

interface ProgramCardProps {
  title: string;
  schedule: string;
  hostName?: string | null;
  imageUrl?: string | null;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export function ProgramCard({
  title,
  schedule,
  hostName,
  imageUrl,
  style,
  onPress,
}: ProgramCardProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? title : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.burgundy,
          borderColor: colors.border,
        },
        style,
        { opacity: pressed ? 0.78 : 1 },
      ]}
    >
      <View style={[styles.artwork, { backgroundColor: colors.surface }]}>
        {imageUrl ? (
          <>
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="cover"
              source={{ uri: imageUrl }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.imageScrim} />
            <View style={styles.artworkLabel}>
              <Ionicons color="#FEFEFE" name="mic" size={15} />
              <Text numberOfLines={1} style={styles.artworkLabelText}>
                {hostName || 'LA Z 1310'}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={[styles.glow, { backgroundColor: colors.red }]} />
            <View style={[styles.diagonal, { backgroundColor: colors.red }]} />
            <Ionicons
              color={colors.white}
              name="mic"
              size={30}
              style={styles.mic}
            />
            <Text style={[styles.mark, { color: colors.white }]}>LA Z</Text>
          </>
        )}
      </View>
      <View style={styles.copy}>
        <Text
          numberOfLines={2}
          style={[styles.title, { color: colors.white }]}
        >
          {title}
        </Text>
        {hostName ? (
          <Text numberOfLines={1} style={[styles.host, { color: colors.muted }]}>
            {hostName}
          </Text>
        ) : null}
        <Text
          numberOfLines={2}
          style={[styles.schedule, { color: colors.red }]}
        >
          {schedule}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 230,
    overflow: 'hidden',
  },
  artwork: {
    height: 132,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    padding: spacing.md,
  },
  imageScrim: {
    backgroundColor: 'rgba(5,1,1,0.18)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  artworkLabel: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(5,1,1,0.76)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    maxWidth: '92%',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  artworkLabelText: {
    color: '#FEFEFE',
    flexShrink: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  glow: {
    borderRadius: 90,
    height: 150,
    opacity: 0.13,
    position: 'absolute',
    right: -45,
    top: -40,
    width: 150,
  },
  diagonal: {
    height: 190,
    opacity: 0.88,
    position: 'absolute',
    right: 0,
    top: -62,
    transform: [{ rotate: '28deg' }],
    width: 24,
  },
  mic: {
    marginBottom: 8,
    opacity: 0.92,
  },
  mark: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
  },
  copy: {
    gap: 5,
    padding: spacing.sm,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    lineHeight: 18,
    minHeight: 38,
  },
  host: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
  },
  schedule: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 14,
  },
});
