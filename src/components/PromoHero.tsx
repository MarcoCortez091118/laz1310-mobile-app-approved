import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useContentVersion } from '../features/content/ContentVersionProvider';
import {
  DynamicCampaign,
  getDynamics,
} from '../features/dynamics/api';
import { dynamicDeadline } from '../features/dynamics/presentation';
import { useLanguage } from '../i18n/LanguageProvider';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts, radii, spacing } from '../theme/tokens';

const CARD_GAP = 10;
const AUTO_ADVANCE_MS = 5000;

interface PromoCardProps {
  campaign: DynamicCampaign;
  width: number;
}

function PromoCard({ campaign, width }: PromoCardProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const label = campaign.artworkLabel.trim() || (english ? 'Promotion' : 'Promoción');

  return (
    <Pressable
      accessibilityLabel={`${english ? 'Open dynamic' : 'Abrir dinámica'} ${campaign.title}`}
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: '/dynamics/[id]',
          params: { id: campaign.id },
        })
      }
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.86 : 1,
          width,
        },
      ]}
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={{ uri: campaign.imageUrl }}
        style={styles.image}
      />
      <View style={styles.scrim} />
      <View style={styles.bottomShade} />

      <View style={styles.labelPill}>
        <View style={[styles.labelDot, { backgroundColor: colors.red }]} />
        <Text style={styles.labelText}>{label.toUpperCase()}</Text>
      </View>

      <View style={styles.copy}>
        <Text numberOfLines={2} style={[styles.title, { color: '#FEFEFE' }]}>
          {campaign.title}
        </Text>
        <Text style={styles.deadline}>
          {dynamicDeadline(campaign.endsAt, campaign.timezone, language)}
        </Text>
        <View style={[styles.cta, { backgroundColor: colors.red }]}>
          <Text style={styles.ctaText}>{english ? 'JOIN' : 'PARTICIPAR'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function PromoHero() {
  const { width: viewportWidth } = useWindowDimensions();
  const { colors } = useAppTheme();
  const { releaseId } = useContentVersion();
  const carouselRef = useRef<ScrollView>(null);
  const [campaigns, setCampaigns] = useState<DynamicCampaign[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  const cardWidth = Math.max(280, viewportWidth - spacing.md * 2);
  const snapInterval = cardWidth + CARD_GAP;

  useEffect(() => {
    let active = true;

    void getDynamics(releaseId ?? undefined)
      .then((result) => {
        if (!active) return;

        const available = result.items
          .filter((item) => item.status === 'active')
          .slice()
          .sort((left, right) => Number(right.featured) - Number(left.featured));
        setCampaigns(available);
      })
      .catch(() => {
        if (active) setCampaigns([]);
      });

    return () => {
      active = false;
    };
  }, [releaseId]);

  useEffect(() => {
    if (activeIndex >= campaigns.length) setActiveIndex(0);
  }, [activeIndex, campaigns.length]);

  useEffect(() => {
    if (campaigns.length > 1 || activeIndex === 0) return;

    setActiveIndex(0);
    carouselRef.current?.scrollTo({ x: 0, y: 0, animated: false });
  }, [activeIndex, campaigns.length]);

  useEffect(() => {
    if (campaigns.length <= 1 || isInteracting || reduceMotion) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % campaigns.length;
        carouselRef.current?.scrollTo({
          x: next * snapInterval,
          y: 0,
          animated: true,
        });
        return next;
      });
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(interval);
  }, [campaigns.length, isInteracting, reduceMotion, snapInterval]);

  const indicators = useMemo(
    () => campaigns.map((campaign) => campaign.id),
    [campaigns],
  );

  if (!campaigns.length) return null;

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / snapInterval);
    setActiveIndex(Math.max(0, Math.min(next, campaigns.length - 1)));
  };

  return (
    <View>
      <ScrollView
        contentContainerStyle={styles.carouselContent}
        decelerationRate="fast"
        disableIntervalMomentum
        horizontal
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollBeginDrag={() => setIsInteracting(true)}
        onScrollEndDrag={() => setIsInteracting(false)}
        ref={carouselRef}
        scrollEnabled={campaigns.length > 1}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={snapInterval}
        style={styles.carousel}
      >
        {campaigns.map((campaign) => (
          <PromoCard campaign={campaign} key={campaign.id} width={cardWidth} />
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
  carousel: { marginHorizontal: 0 },
  carouselContent: { gap: CARD_GAP },
  card: {
    aspectRatio: 1,
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  scrim: {
    backgroundColor: 'rgba(5,1,1,0.22)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  bottomShade: {
    backgroundColor: 'rgba(5,1,1,0.62)',
    bottom: 0,
    height: '58%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  labelPill: {
    alignItems: 'center',
    backgroundColor: 'rgba(5,1,1,0.72)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 7,
    left: spacing.lg,
    paddingHorizontal: 11,
    paddingVertical: 7,
    position: 'absolute',
    top: spacing.lg,
  },
  labelDot: {
    borderRadius: 99,
    height: 7,
    width: 7,
  },
  labelText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  copy: {
    bottom: spacing.lg,
    left: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
  },
  title: {
    fontFamily: fonts.displayBlack,
    fontSize: 38,
    lineHeight: 38,
    maxWidth: '90%',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  deadline: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    marginTop: 5,
  },
  cta: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ctaText: {
    color: '#FEFEFE',
    fontFamily: fonts.bodyBold,
    fontSize: 12,
  },
  dots: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: 9,
  },
  dot: {
    borderRadius: 999,
    height: 6,
  },
});
