import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { usePathname, useRouter } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useLanguage } from '../i18n/LanguageProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, spacing } from '../theme/tokens';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type TabRoute = '/home' | '/radio' | '/explore' | '/profile';

interface TabItem {
  id: 'home' | 'radio' | 'explore' | 'profile';
  icon: IoniconName;
  iconActive: IoniconName;
  route: TabRoute;
}

const items: TabItem[] = [
  { id: 'home', icon: 'home-outline', iconActive: 'home', route: '/home' },
  { id: 'radio', icon: 'radio-outline', iconActive: 'radio', route: '/radio' },
  { id: 'explore', icon: 'compass-outline', iconActive: 'compass', route: '/explore' },
  { id: 'profile', icon: 'person-outline', iconActive: 'person', route: '/profile' },
];

function isActive(pathname: string, route: string) {

  if (route === '/home') {
    return pathname === '/home' || pathname.startsWith('/notifications');
  }

  if (route === '/explore') {
    return (
      pathname === '/explore' ||
      pathname.startsWith('/dynamics') ||
      pathname.startsWith('/weather') ||
      pathname.startsWith('/programs')
    );
  }

  if (route === '/profile') {
    return pathname === '/profile' || pathname.startsWith('/profile/');
  }

  return pathname === route;
}

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const labels: Record<TabItem['id'], string> = {
    home: english ? 'Home' : 'Inicio',
    radio: 'Radio',
    explore: english ? 'Explore' : 'Explorar',
    profile: english ? 'Profile' : 'Perfil',
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.black,
          borderTopColor: colors.border,
        },
      ]}
    >
      {items.map((item) => {
        const active = isActive(pathname, item.route);
        const isRadio = item.id === 'radio';
        const label = labels[item.id];

        return (
          <Pressable
            accessibilityLabel={label}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={item.id}
            onPress={() => {
              if (!active) router.replace(item.route);
            }}
            style={({ pressed }) => [
              styles.item,
              { opacity: pressed ? 0.72 : 1 },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                isRadio && styles.radio,
                isRadio && {
                  backgroundColor: colors.red,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                color={
                  isRadio
                    ? '#FEFEFE'
                    : active
                      ? colors.red
                      : colors.gray
                }
                name={active ? item.iconActive : item.icon}
                size={isRadio ? 25 : 23}
              />
            </View>
            <Text
              style={[
                styles.label,
                { color: active ? colors.red : colors.gray },
                active && styles.activeLabel,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    height: 84,
    justifyContent: 'space-around',
    left: 0,
    paddingHorizontal: spacing.xs,
    position: 'absolute',
    right: 0,
  },
  item: {
    alignItems: 'center',
    gap: 4,
    minWidth: 64,
    minHeight: 56,
    justifyContent: 'center',
  },
  iconWrap: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 44,
  },
  radio: {
    borderRadius: 28,
    borderWidth: 1,
    height: 52,
    marginTop: -16,
    width: 52,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
  activeLabel: {
    fontFamily: fonts.bodySemiBold,
  },
});
