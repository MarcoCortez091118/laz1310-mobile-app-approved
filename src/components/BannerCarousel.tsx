import {
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useContentVersion } from '../features/content/ContentVersionProvider';
import {
  getHomeBanners,
  type BannerItem,
} from '../features/banners/api';
import { useAppTheme } from '../theme/ThemeProvider';
import { radii, spacing } from '../theme/tokens';

const CARD_GAP = 10;
const BANNER_ASPECT_RATIO = 3;

function BannerCard({
  banner,
  width,
}: {
  banner: BannerItem;
  width: number;
}) {
  const interactive =
    banner.link?.kind === 'external' &&
    banner.link.target.startsWith('https://');

  async function openBanner() {
    if (!interactive || !banner.link) return;
    await Linking.openURL(banner.link.target);
  }

  return (
    <Pressable
      accessibilityLabel={banner.title}
      accessibilityRole={interactive ? 'link' : 'image'}
      disabled={!interactive}
      onPress={() => void openBanner()}
      style={({ pressed }) => [
        styles.card,
        {
          opacity: pressed && interactive ? 0.86 : 1,
          width,
        },
      ]}
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={{ uri: banner.imageUrl! }}
        style={StyleSheet.absoluteFill}
      />
    </Pressable>
  );
}

export function BannerCarousel() {
  const { width: viewportWidth } = useWindowDimensions();
  const { colors } = useAppTheme();
  const { releaseId } = useContentVersion();
  const carouselRef = useRef<ScrollView>(null);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = Math.max(280, viewportWidth - spacing.md * 2);
  const snapInterval = cardWidth + CARD_GAP;

  useEffect(() => {
    let active = true;

    void getHomeBanners(releaseId)
      .then((items) => {
        if (!active) return;
        setBanners(items);
        setActiveIndex(0);
        carouselRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      })
      .catch(() => {
        if (active) setBanners([]);
      });

    return () => {
      active = false;
    };
  }, [releaseId]);

  const indicators = useMemo(
    () => banners.map((banner, index) => `${banner.title}-${index}`),
    [banners],
  );

  if (!banners.length) return null;

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    setActiveIndex(Math.max(0, Math.min(next, banners.length - 1)));
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.content}
        decelerationRate="fast"
        disableIntervalMomentum
        horizontal
        onMomentumScrollEnd={handleMomentumEnd}
        ref={carouselRef}
        scrollEnabled={banners.length > 1}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={snapInterval}
      >
        {banners.map((banner, index) => (
          <BannerCard
            banner={banner}
            key={`${banner.title}-${index}`}
            width={cardWidth}
          />
        ))}
      </ScrollView>

      {indicators.length > 1 ? (
        <View style={styles.dots}>
          {indicators.map((id, index) => (
            <View
              key={id}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === activeIndex ? colors.red : colors.border,
                  width: index === activeIndex ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  content: {
    gap: CARD_GAP,
  },
  card: {
    aspectRatio: BANNER_ASPECT_RATIO,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    borderRadius: 999,
    height: 6,
  },
});
