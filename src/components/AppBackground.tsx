import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
} from 'react-native';

import { getBootstrap } from '../features/content/api';
import { useContentVersion } from '../features/content/ContentVersionProvider';
import { useAppTheme } from '../theme/ThemeProvider';

interface AppBackgroundProps extends PropsWithChildren {
  enabled?: boolean;
}

export function AppBackground({
  children,
  enabled = true,
}: AppBackgroundProps) {
  const { colors, preference } = useAppTheme();
  const { releaseId } = useContentVersion();
  const [remoteImageUrl, setRemoteImageUrl] = useState<string | null>(null);
  const [remoteEnabled, setRemoteEnabled] = useState(true);
  const [remoteFailed, setRemoteFailed] = useState(false);

  useEffect(() => {
    let active = true;

    void getBootstrap(releaseId)
      .then((bootstrap) => {
        if (!active) return;
        setRemoteEnabled(bootstrap.theme.backgroundEnabled ?? true);
        setRemoteImageUrl(bootstrap.theme.backgroundImageUrl ?? null);
        setRemoteFailed(false);
      })
      .catch(() => {
        if (!active) return;
        setRemoteEnabled(true);
        setRemoteImageUrl(null);
        setRemoteFailed(false);
      });

    return () => {
      active = false;
    };
  }, [releaseId]);

  const source = useMemo(
    () =>
      remoteImageUrl && !remoteFailed
        ? { uri: remoteImageUrl }
        : require('../../assets/brand/Back.png'),
    [remoteFailed, remoteImageUrl],
  );

  if (!enabled || !remoteEnabled) {
    return (
      <View style={[styles.root, { backgroundColor: colors.black }]}>
        {children}
      </View>
    );
  }

  const imageOpacity = 1;
  const overlayColor =
    preference === 'dark'
      ? 'rgba(5,1,1,0.18)'
      : 'rgba(254,254,254,0.52)';

  return (
    <ImageBackground
      imageStyle={{ opacity: imageOpacity }}
      onError={() => setRemoteFailed(true)}
      resizeMode="cover"
      source={source}
      style={[styles.root, { backgroundColor: colors.black }]}
    >
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]}
      />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
