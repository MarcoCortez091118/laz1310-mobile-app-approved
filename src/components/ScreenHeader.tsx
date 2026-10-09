import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useLanguage } from '../i18n/LanguageProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/tokens';

interface ScreenHeaderProps {
  title: string;
  back?: boolean;
}

export function ScreenHeader({
  title,
  back = true,
}: ScreenHeaderProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { language } = useLanguage();

  return (
    <View style={styles.row}>
      {back ? (
        <Pressable
          accessibilityLabel={language === 'en' ? 'Back' : 'Volver'}
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.side}
        >
          <Ionicons
            color={colors.white}
            name="chevron-back"
            size={25}
          />
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
      <Text style={[styles.title, { color: colors.white }]}> 
        {title}
      </Text>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
  },
  side: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 48,
    width: 48,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
});
