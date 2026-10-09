import { getApp } from '@react-native-firebase/app';
import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Href, useRouter } from 'expo-router';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';

import { useLanguage } from '../../i18n/LanguageProvider';
import { useAuth } from '../auth/AuthProvider';
import { useContentVersion } from '../content/ContentVersionProvider';
import {
  currentPushPermission,
  disablePushForDevice,
  enablePushForDevice,
  locallyEnabled,
  registerCurrentInstallation,
  syncPushToken,
  type PushPermissionState,
} from './device';
import {
  ensureSystemNotificationChannel,
  presentForegroundSystemNotification,
  systemNotificationTarget,
} from './system';

type PushStatus = 'idle' | 'syncing' | 'ready' | 'error';

interface PushNotificationsContextValue {
  status: PushStatus;
  enabled: boolean;
  permission: PushPermissionState;
  deviceId: string | null;
  error: string | null;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  refresh: () => Promise<void>;
}

const PushNotificationsContext =
  createContext<PushNotificationsContextValue | null>(null);

function notificationTarget(value: unknown): Href | null {
  if (
    value === '/home' ||
    value === '/radio' ||
    value === '/dynamics' ||
    value === '/programs'
  ) {
    return value;
  }
  if (
    typeof value === 'string' &&
    (
      /^\/dynamics\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value) ||
      /^\/programs\/[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)
    )
  ) {
    return value as Href;
  }
  return null;
}

export function PushNotificationsProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const { isAuthenticated, profile } = useAuth();
  const { refresh: refreshContentVersion } = useContentVersion();
  const { language } = useLanguage();
  const english = language === 'en';
  const [status, setStatus] = useState<PushStatus>('idle');
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] =
    useState<PushPermissionState>('not-determined');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !profile || Platform.OS === 'web') {
      setStatus('idle');
      setEnabled(false);
      setDeviceId(null);
      return;
    }

    setStatus('syncing');
    setError(null);
    try {
      await ensureSystemNotificationChannel();
      const device = await registerCurrentInstallation({
        locale: profile.locale,
        timezone: profile.timezone,
      });
      setDeviceId(device.id);

      const nextPermission = await currentPushPermission();
      const shouldEnable = await locallyEnabled();
      setPermission(nextPermission);

      if (shouldEnable && nextPermission === 'authorized') {
        const synced = await syncPushToken(device.id);
        setEnabled(Boolean(synced?.notificationsEnabled));
      } else if (shouldEnable && nextPermission !== 'authorized') {
        await syncPushToken(device.id);
        setEnabled(false);
      } else {
        setEnabled(device.notificationsEnabled && nextPermission === 'authorized');
      }
      setStatus('ready');
    } catch (syncError) {
      setStatus('error');
      setEnabled(false);
      setError(
        syncError instanceof Error
          ? syncError.message
          : english
            ? 'We could not register this device for notifications.'
            : 'No pudimos registrar este dispositivo para notificaciones.',
      );
    }
  }, [english, isAuthenticated, profile]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!deviceId || !enabled || Platform.OS === 'web') return;
    const service = getMessaging(getApp());
    return onTokenRefresh(service, (token) => {
      void syncPushToken(deviceId, token).catch((refreshError) => {
        setStatus('error');
        setError(
          refreshError instanceof Error
            ? refreshError.message
            : english
              ? 'We could not renew the FCM token.'
              : 'No pudimos renovar el token FCM.',
        );
      });
    });
  }, [deviceId, enabled, english]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const service = getMessaging(getApp());

    const openTarget = async (value: unknown) => {
      await refreshContentVersion();
      const target = notificationTarget(value);
      if (target) router.push(target);
    };

    const unsubscribeMessage = onMessage(service, (message) => {
      void refreshContentVersion();
      const title = message.notification?.title ?? 'LA Z 1310';
      const body = message.notification?.body ?? '';
      void presentForegroundSystemNotification({
        id: message.messageId,
        title,
        body,
        targetValue:
          typeof message.data?.targetValue === 'string'
            ? message.data.targetValue
            : null,
      });
    });

    const unsubscribeOpened = onNotificationOpenedApp(service, (message) => {
      void openTarget(message.data?.targetValue);
    });

    const expoResponseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        void openTarget(
          systemNotificationTarget(response.notification.request.content.data),
        );
      });

    void getInitialNotification(service).then((message) => {
      if (message) void openTarget(message.data?.targetValue);
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const target = systemNotificationTarget(
        response.notification.request.content.data,
      );
      if (target) void openTarget(target);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeOpened();
      expoResponseSubscription.remove();
    };
  }, [refreshContentVersion, router]);

  const enable = useCallback(async () => {
    if (!isAuthenticated || !profile) {
      throw new Error(
        english
          ? 'Sign in to enable notifications.'
          : 'Inicia sesión para activar las notificaciones.',
      );
    }
    setStatus('syncing');
    setError(null);
    try {
      await ensureSystemNotificationChannel();
      const device = deviceId
        ? { id: deviceId }
        : await registerCurrentInstallation({
            locale: profile.locale,
            timezone: profile.timezone,
          });
      setDeviceId(device.id);
      const updated = await enablePushForDevice(device.id);
      setEnabled(updated.notificationsEnabled);
      setPermission('authorized');
      setStatus('ready');
    } catch (enableError) {
      setPermission(await currentPushPermission());
      setStatus('error');
      setEnabled(false);
      const message =
        enableError instanceof Error
          ? enableError.message
          : english
            ? 'We could not enable notifications.'
            : 'No pudimos activar las notificaciones.';
      setError(message);
      throw enableError;
    }
  }, [deviceId, english, isAuthenticated, profile]);

  const disable = useCallback(async () => {
    setStatus('syncing');
    setError(null);
    try {
      if (deviceId) await disablePushForDevice(deviceId);
      setEnabled(false);
      setPermission(await currentPushPermission());
      setStatus('ready');
    } catch (disableError) {
      setStatus('error');
      const message =
        disableError instanceof Error
          ? disableError.message
          : english
            ? 'We could not disable notifications.'
            : 'No pudimos desactivar las notificaciones.';
      setError(message);
      throw disableError;
    }
  }, [deviceId, english]);

  const value = useMemo<PushNotificationsContextValue>(
    () => ({
      status,
      enabled,
      permission,
      deviceId,
      error,
      enable,
      disable,
      refresh,
    }),
    [deviceId, disable, enable, enabled, error, permission, refresh, status],
  );

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
}

export function usePushNotifications() {
  const value = useContext(PushNotificationsContext);
  if (!value) {
    throw new Error(
      'usePushNotifications must be used within PushNotificationsProvider',
    );
  }
  return value;
}
