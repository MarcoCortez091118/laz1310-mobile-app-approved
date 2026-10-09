import {
  AccessibilityInfo,
  Animated,
  AppState,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { WeatherConditionCode } from '../../features/weather/api';
import {
  weatherVisualTheme,
  type WeatherVisualTheme,
} from '../../features/weather/visuals';

const MAX_PARTICLES = 26;

interface WeatherSceneProps extends PropsWithChildren {
  conditionCode: WeatherConditionCode;
  isDay: boolean;
  precipitationMm?: number;
  windKph?: number;
}

function cloudOpacity(
  visual: WeatherVisualTheme,
  factor: number,
) {
  return Math.min(1, visual.cloudOpacity * factor);
}

function CloudShape({
  color,
  opacity,
  scale = 1,
}: {
  color: string;
  opacity: number;
  scale?: number;
}) {
  return (
    <View
      style={[
        styles.cloud,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <View
        style={[
          styles.cloudBase,
          { backgroundColor: color },
        ]}
      />
      <View
        style={[
          styles.cloudBubbleLarge,
          { backgroundColor: color },
        ]}
      />
      <View
        style={[
          styles.cloudBubbleSmall,
          { backgroundColor: color },
        ]}
      />
    </View>
  );
}

export function WeatherScene({
  children,
  conditionCode,
  isDay,
  precipitationMm = 0,
  windKph = 0,
}: WeatherSceneProps) {
  const { width, height } = useWindowDimensions();
  const [appActive, setAppActive] = useState(
    AppState.currentState === 'active',
  );
  const [reduceMotion, setReduceMotion] = useState(false);
  const cloudTravel = useRef(new Animated.Value(0)).current;
  const fogTravel = useRef(new Animated.Value(0)).current;
  const lightning = useRef(new Animated.Value(0)).current;
  const particleValues = useRef(
    Array.from({ length: MAX_PARTICLES }, () => new Animated.Value(0)),
  ).current;

  const visual = useMemo(
    () =>
      weatherVisualTheme({
        conditionCode,
        isDay,
        precipitationMm,
      }),
    [conditionCode, isDay, precipitationMm],
  );

  const particleCount = useMemo(() => {
    if (
      visual.scene !== 'rain' &&
      visual.scene !== 'snow' &&
      visual.scene !== 'storm'
    ) {
      return 0;
    }

    return Math.max(
      8,
      Math.round(8 + visual.precipitationIntensity * 18),
    );
  }, [visual.precipitationIntensity, visual.scene]);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AppState.addEventListener('change', (state) => {
      setAppActive(state === 'active');
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!appActive || reduceMotion) return;

    cloudTravel.setValue(0);
    const animation = Animated.loop(
      Animated.timing(cloudTravel, {
        duration: 28_000,
        easing: Easing.linear,
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    animation.start();

    return () => animation.stop();
  }, [appActive, cloudTravel, reduceMotion]);

  useEffect(() => {
    if (!appActive || reduceMotion || visual.scene !== 'fog') return;

    fogTravel.setValue(0);
    const animation = Animated.loop(
      Animated.timing(fogTravel, {
        duration: 18_000,
        easing: Easing.inOut(Easing.linear),
        toValue: 1,
        useNativeDriver: true,
      }),
    );
    animation.start();

    return () => animation.stop();
  }, [appActive, fogTravel, reduceMotion, visual.scene]);

  useEffect(() => {
    if (
      !appActive ||
      reduceMotion ||
      !visual.lightning
    ) {
      lightning.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(2800),
        Animated.timing(lightning, {
          duration: 70,
          toValue: 0.72,
          useNativeDriver: true,
        }),
        Animated.timing(lightning, {
          duration: 110,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.delay(180),
        Animated.timing(lightning, {
          duration: 55,
          toValue: 0.42,
          useNativeDriver: true,
        }),
        Animated.timing(lightning, {
          duration: 120,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.delay(3600),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [
    appActive,
    lightning,
    reduceMotion,
    visual.lightning,
  ]);

  useEffect(() => {
    if (
      !appActive ||
      reduceMotion ||
      particleCount === 0
    ) {
      return;
    }

    const animations = particleValues
      .slice(0, particleCount)
      .map((value, index) => {
        value.setValue((index % 7) / 7);
        const duration =
          visual.scene === 'snow'
            ? 5200 + (index % 5) * 520
            : 1050 + (index % 6) * 120;

        const animation = Animated.loop(
          Animated.timing(value, {
            duration,
            easing: Easing.linear,
            toValue: 1,
            useNativeDriver: true,
          }),
          { resetBeforeIteration: true },
        );
        animation.start();
        return animation;
      });

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [
    appActive,
    particleCount,
    particleValues,
    reduceMotion,
    visual.scene,
  ]);

  const windShift = Math.max(
    -90,
    Math.min(90, (windKph / 50) * 70),
  );
  const cloudShift = cloudTravel.interpolate({
    inputRange: [0, 1],
    outputRange: [-45, 55],
  });
  const cloudShiftReverse = cloudTravel.interpolate({
    inputRange: [0, 1],
    outputRange: [45, -55],
  });
  const fogShift = fogTravel.interpolate({
    inputRange: [0, 1],
    outputRange: [-55, 45],
  });

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: visual.bottomColor },
      ]}
    >
      <View
        style={[
          styles.skyTop,
          { backgroundColor: visual.topColor },
        ]}
      />
      <View
        style={[
          styles.skyMiddle,
          { backgroundColor: visual.middleColor },
        ]}
      />
      <View
        style={[
          styles.skyBottom,
          { backgroundColor: visual.bottomColor },
        ]}
      />

      {visual.showCelestialBody ? (
        <View
          style={[
            styles.celestialGlow,
            {
              backgroundColor: visual.celestialColor,
              opacity: isDay ? 0.24 : 0.12,
            },
          ]}
        >
          <View
            style={[
              styles.celestial,
              {
                backgroundColor: visual.celestialColor,
                opacity: isDay ? 0.9 : 0.82,
              },
            ]}
          />
        </View>
      ) : null}

      {visual.cloudOpacity > 0 ? (
        <>
          <Animated.View
            style={[
              styles.cloudLayerTop,
              { transform: [{ translateX: cloudShift }] },
            ]}
          >
            <CloudShape
              color={visual.cloudColor}
              opacity={cloudOpacity(visual, 0.84)}
              scale={1.22}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.cloudLayerMiddle,
              { transform: [{ translateX: cloudShiftReverse }] },
            ]}
          >
            <CloudShape
              color={visual.cloudColor}
              opacity={cloudOpacity(visual, 0.62)}
              scale={0.92}
            />
          </Animated.View>
        </>
      ) : null}

      {visual.scene === 'fog' ? (
        <Animated.View
          style={[
            styles.fogLayer,
            { transform: [{ translateX: fogShift }] },
          ]}
        >
          <View style={styles.fogBand} />
          <View style={[styles.fogBand, styles.fogBandSecond]} />
          <View style={[styles.fogBand, styles.fogBandThird]} />
        </Animated.View>
      ) : null}

      {!reduceMotion
        ? particleValues
            .slice(0, particleCount)
            .map((value, index) => {
              const left =
                ((index * 47 + 13) % 101) / 100 * width;
              const phase = (index % 9) / 9;
              const startY = -80 - phase * 260;
              const endY = height + 120;
              const translateY = value.interpolate({
                inputRange: [0, 1],
                outputRange: [startY, endY],
              });
              const translateX = value.interpolate({
                inputRange: [0, 1],
                outputRange: [0, windShift],
              });

              if (visual.scene === 'snow') {
                const sway = value.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [
                    -8 - (index % 3) * 4,
                    8 + (index % 4) * 4,
                    -5,
                  ],
                });

                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.snowflake,
                      {
                        left,
                        opacity:
                          0.38 +
                          (index % 5) * 0.1,
                        transform: [
                          { translateY },
                          { translateX: sway },
                        ],
                      },
                    ]}
                  />
                );
              }

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.raindrop,
                    {
                      height:
                        18 +
                        (index % 5) * 5,
                      left,
                      opacity:
                        0.3 +
                        (index % 4) * 0.1,
                      transform: [
                        { translateY },
                        { translateX },
                        {
                          rotate: `${
                            windShift > 0
                              ? -10
                              : windShift < 0
                                ? 10
                                : 0
                          }deg`,
                        },
                      ],
                    },
                  ]}
                />
              );
            })
        : null}

      {visual.lightning ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.lightning,
            { opacity: lightning },
          ]}
        />
      ) : null}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  skyTop: {
    height: '38%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  skyMiddle: {
    bottom: '26%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '34%',
  },
  skyBottom: {
    bottom: 0,
    height: '30%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  celestialGlow: {
    alignItems: 'center',
    borderRadius: 999,
    height: 126,
    justifyContent: 'center',
    position: 'absolute',
    right: 34,
    top: 76,
    width: 126,
  },
  celestial: {
    borderRadius: 999,
    height: 58,
    width: 58,
  },
  cloud: {
    height: 92,
    position: 'relative',
    width: 210,
  },
  cloudBase: {
    borderRadius: 999,
    bottom: 0,
    height: 48,
    left: 20,
    position: 'absolute',
    width: 180,
  },
  cloudBubbleLarge: {
    borderRadius: 999,
    height: 86,
    left: 70,
    position: 'absolute',
    top: 2,
    width: 92,
  },
  cloudBubbleSmall: {
    borderRadius: 999,
    height: 62,
    left: 28,
    position: 'absolute',
    top: 24,
    width: 68,
  },
  cloudLayerTop: {
    left: -12,
    position: 'absolute',
    top: 110,
  },
  cloudLayerMiddle: {
    position: 'absolute',
    right: -28,
    top: 205,
  },
  fogLayer: {
    left: -60,
    position: 'absolute',
    right: -60,
    top: 170,
  },
  fogBand: {
    backgroundColor: 'rgba(238,244,246,0.18)',
    borderRadius: 999,
    height: 66,
    width: '86%',
  },
  fogBandSecond: {
    marginLeft: 80,
    marginTop: 38,
    opacity: 0.8,
    width: '78%',
  },
  fogBandThird: {
    marginLeft: 20,
    marginTop: 44,
    opacity: 0.58,
    width: '92%',
  },
  raindrop: {
    backgroundColor: 'rgba(205,230,244,0.74)',
    borderRadius: 999,
    position: 'absolute',
    top: 0,
    width: 1.5,
  },
  snowflake: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    height: 6,
    position: 'absolute',
    top: 0,
    width: 6,
  },
  lightning: {
    backgroundColor: '#EAF4FF',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  content: {
    flex: 1,
  },
});
