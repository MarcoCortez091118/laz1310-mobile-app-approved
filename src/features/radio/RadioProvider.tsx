import Constants from 'expo-constants';
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { RADIO_CONFIG } from '../../config/radio';
import type {
  RadioContextValue,
  RadioPlaybackState,
} from './types';

const MAX_RECONNECT_ATTEMPTS = 4;
const RECONNECT_DELAYS_MS = [1_000, 2_000, 4_000, 8_000] as const;

/**
 * Expo Go cannot apply this project's native expo-audio config plugin.
 * Foreground playback is still useful there, but lock-screen controls and
 * sustained background playback require a custom development/native build.
 */
// appOwnership is deprecated for general environment detection, but it is
// intentionally used here because it uniquely reports "expo" for Expo Go and
// remains null in our custom development/standalone builds. executionEnvironment
// cannot distinguish Expo Go from expo-dev-client because both are StoreClient.
const isExpoGo = Constants.appOwnership === 'expo';

export const RadioContext = createContext<RadioContextValue | null>(null);

export function RadioProvider({ children }: PropsWithChildren) {
  const player = useAudioPlayer(null, {
    updateInterval: 500,
    downloadFirst: false,
    preferredForwardBufferDuration: 6,
  });
  const status = useAudioPlayerStatus(player);

  const [desiredPlayback, setDesiredPlayback] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [manualState, setManualState] =
    useState<RadioPlaybackState>('idle');

  const preparedRef = useRef(false);
  const hasPlayedRef = useRef(false);
  const needsLiveEdgeRef = useRef(false);
  const retryAttemptRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: !isExpoGo,
      interruptionMode: 'doNotMix',
    });

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      // useAudioPlayer owns the native AudioPlayer lifecycle and releases the
      // SharedObject during unmount. Calling a player method from a sibling
      // cleanup can race with that release on Android and throw
      // "Cannot use shared object that was already released".
      // The native player release is responsible for disposing its media
      // session / lock-screen integration.
    };
  }, []);

  const activateLockScreen = useCallback(() => {
    if (isExpoGo) {
      return;
    }

    player.setActiveForLockScreen(
      true,
      {
        title: RADIO_CONFIG.name,
        artist: RADIO_CONFIG.city,
        albumTitle: RADIO_CONFIG.slogan,
      },
      {
        isLiveStream: true,
        showSeekBackward: false,
        showSeekForward: false,
      },
    );
  }, [player]);

  const loadStream = useCallback(
    (fresh = false) => {
      const separator = RADIO_CONFIG.streamUrl.includes('?') ? '&' : '?';
      const source = fresh
        ? `${RADIO_CONFIG.streamUrl}${separator}t=${Date.now()}`
        : RADIO_CONFIG.streamUrl;

      player.replace(source);
      preparedRef.current = true;
    },
    [player],
  );

  const play = useCallback(() => {
    setDesiredPlayback(true);
    setHasStarted(true);
    setManualState(hasPlayedRef.current ? 'reconnecting' : 'connecting');

    if (!preparedRef.current || needsLiveEdgeRef.current) {
      loadStream(needsLiveEdgeRef.current);
      needsLiveEdgeRef.current = false;
    }

    activateLockScreen();
    player.play();
  }, [activateLockScreen, loadStream, player]);

  const pause = useCallback(() => {
    setDesiredPlayback(false);
    retryAttemptRef.current = 0;

    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    player.pause();

    // A live broadcast must resume at the current live edge rather than from
    // the player's buffered pause position.
    needsLiveEdgeRef.current = true;

    setManualState(preparedRef.current ? 'paused' : 'idle');
  }, [player]);

  const retry = useCallback(() => {
    retryAttemptRef.current = 0;
    setDesiredPlayback(true);
    setHasStarted(true);
    setManualState('reconnecting');
    needsLiveEdgeRef.current = false;
    loadStream(true);
    activateLockScreen();
    player.play();
  }, [activateLockScreen, loadStream, player]);

  const toggle = useCallback(() => {
    if (status.playing || desiredPlayback) {
      pause();
      return;
    }

    play();
  }, [desiredPlayback, pause, play, status.playing]);

  useEffect(() => {
    if (status.playing) {
      hasPlayedRef.current = true;
      retryAttemptRef.current = 0;
      setManualState('playing');
      return;
    }

    if (!desiredPlayback) {
      setManualState(preparedRef.current ? 'paused' : 'idle');
      return;
    }

    if (status.error) {
      if (retryTimerRef.current) {
        return;
      }

      const attempt = retryAttemptRef.current;

      if (attempt >= MAX_RECONNECT_ATTEMPTS) {
        setManualState('error');
        return;
      }

      setManualState(hasPlayedRef.current ? 'reconnecting' : 'connecting');

      const delay =
        RECONNECT_DELAYS_MS[
          Math.min(attempt, RECONNECT_DELAYS_MS.length - 1)
        ] ?? 8_000;

      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        retryAttemptRef.current += 1;
        loadStream(true);
        activateLockScreen();
        player.play();
      }, delay);

      return;
    }

    if (status.isBuffering || !status.isLoaded) {
      setManualState(hasPlayedRef.current ? 'reconnecting' : 'connecting');
    }
  }, [
    activateLockScreen,
    desiredPlayback,
    loadStream,
    player,
    status.error,
    status.isBuffering,
    status.isLoaded,
    status.playing,
  ]);

  const value = useMemo<RadioContextValue>(
    () => ({
      state: manualState,
      error: status.error,
      isPlaying: manualState === 'playing',
      hasStarted,
      play,
      pause,
      toggle,
      retry,
    }),
    [
      hasStarted,
      manualState,
      pause,
      play,
      retry,
      status.error,
      toggle,
    ],
  );

  return (
    <RadioContext.Provider value={value}>
      {children}
    </RadioContext.Provider>
  );
}
