import { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  View,
} from 'react-native';

import { colors } from '../theme/tokens';

interface VinylArtworkProps {
  size?: number;
  playing?: boolean;
}

export function VinylArtwork({
  size = 280,
  playing = false,
}: VinylArtworkProps) {
  const rotation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    animationRef.current?.stop();

    if (!playing) {
      return;
    }

    animationRef.current = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 12_000,
        useNativeDriver: true,
      }),
    );

    animationRef.current.start();

    return () => animationRef.current?.stop();
  }, [playing, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderColor: playing ? colors.red : colors.border,
          borderWidth: playing ? 2 : 1,
        },
      ]}
    >
      <Animated.View
        style={{
          width: size - 10,
          height: size - 10,
          transform: [{ rotate }],
        }}
      >
        <Image
          source={require('../../assets/brand/vinyl-primary.png')}
          style={styles.image}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    resizeMode: 'contain',
    width: '100%',
  },
});
