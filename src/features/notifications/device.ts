import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  deleteToken,
  getMessaging,
  getToken,
  hasPermission,
  registerDeviceForRemoteMessages,
  requestPermission,
} from '@react-native-firebase/messaging';
import Constants from 'expo-constants';
import { PermissionsAndroid, Platform } from 'react-native';

import { getFirebaseSecurityTokens } from '../auth/firebase';
import {
  deleteDevice,
  registerDevice,
  updateDevicePushToken,
  type DeviceResponse,
} from './api';

const INSTALLATION_ID_KEY = '@laz1310/device-installation-id';
const DEVICE_ID_KEY = '@laz1310/device-id';
const PUSH_ENABLED_KEY = '@laz1310/push-enabled';

export type PushPermissionState = 'authorized' | 'denied' | 'not-determined';

function messaging() {
  return getMessaging(getApp());
}

function newInstallationId(): string {
  const random = Math.random().toString(36).slice(2, 14);
  return `laz-${Date.now().toString(36)}-${random}`;
}

async function installationId(): Promise<string> {
  const existing = await AsyncStorage.getItem(INSTALLATION_ID_KEY);
  if (existing) return existing;
  const created = newInstallationId();
  await AsyncStorage.setItem(INSTALLATION_ID_KEY, created);
  return created;
}

export async function storedDeviceId(): Promise<string | null> {
  return AsyncStorage.getItem(DEVICE_ID_KEY);
}

export async function locallyEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(PUSH_ENABLED_KEY)) === 'true';
}

async function setLocallyEnabled(enabled: boolean) {
  await AsyncStorage.setItem(PUSH_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function currentPushPermission(): Promise<PushPermissionState> {
  if (Platform.OS === 'web') return 'denied';

  if (Platform.OS === 'android') {
    if (Number(Platform.Version) < 33) return 'authorized';
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return granted ? 'authorized' : 'not-determined';
  }

  const status = await hasPermission(messaging());
  if (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
  ) {
    return 'authorized';
  }
  if (status === AuthorizationStatus.NOT_DETERMINED) return 'not-determined';
  return 'denied';
}

export async function requestPushPermission(): Promise<PushPermissionState> {
  if (Platform.OS === 'web') return 'denied';

  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED ? 'authorized' : 'denied';
  }

  if (Platform.OS === 'android') return 'authorized';

  const status = await requestPermission(messaging(), {
    alert: true,
    badge: true,
    sound: true,
  });
  return status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL
    ? 'authorized'
    : 'denied';
}

export async function registerCurrentInstallation(input: {
  locale?: string | null;
  timezone?: string | null;
}): Promise<DeviceResponse> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    throw new Error('Push notification device registration requires a native build.');
  }

  const tokens = await getFirebaseSecurityTokens(true);
  const device = await registerDevice(tokens, {
    installationId: await installationId(),
    platform: Platform.OS,
    appVersion: Constants.expoConfig?.version ?? '0.1.0',
    deviceModel: null,
    osVersion: String(Platform.Version),
    locale: input.locale ?? Intl.DateTimeFormat().resolvedOptions().locale ?? null,
    timezone:
      input.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
  });
  await AsyncStorage.setItem(DEVICE_ID_KEY, device.id);
  return device;
}

export async function enablePushForDevice(deviceId: string): Promise<DeviceResponse> {
  const permission = await requestPushPermission();
  if (permission !== 'authorized') {
    await setLocallyEnabled(false);
    throw new Error(
      'Notification permission was not granted. Enable notifications in system settings and try again.',
    );
  }

  const service = messaging();
  await registerDeviceForRemoteMessages(service);
  const nativePushToken = await getToken(service);
  if (!nativePushToken.trim()) {
    throw new Error('Firebase did not return an FCM registration token.');
  }

  const tokens = await getFirebaseSecurityTokens(true);
  const device = await updateDevicePushToken(tokens, deviceId, {
    expoPushToken: null,
    nativePushToken,
    notificationsEnabled: true,
    nativePushProvider: 'fcm',
  });
  await setLocallyEnabled(true);
  return device;
}

export async function syncPushToken(
  deviceId: string,
  nativePushToken?: string,
): Promise<DeviceResponse | null> {
  if (!(await locallyEnabled())) return null;
  if ((await currentPushPermission()) !== 'authorized') {
    await setLocallyEnabled(false);
    const tokens = await getFirebaseSecurityTokens(true);
    return updateDevicePushToken(tokens, deviceId, {
      expoPushToken: null,
      nativePushToken: null,
      notificationsEnabled: false,
      nativePushProvider: null,
    });
  }

  const service = messaging();
  await registerDeviceForRemoteMessages(service);
  const token = nativePushToken ?? (await getToken(service));
  const tokens = await getFirebaseSecurityTokens(true);
  return updateDevicePushToken(tokens, deviceId, {
    expoPushToken: null,
    nativePushToken: token,
    notificationsEnabled: true,
    nativePushProvider: 'fcm',
  });
}

export async function disablePushForDevice(deviceId: string): Promise<void> {
  let apiError: unknown = null;
  try {
    const tokens = await getFirebaseSecurityTokens(true);
    await updateDevicePushToken(tokens, deviceId, {
      expoPushToken: null,
      nativePushToken: null,
      notificationsEnabled: false,
      nativePushProvider: null,
    });
  } catch (error) {
    apiError = error;
  }

  try {
    await deleteToken(messaging());
  } finally {
    await setLocallyEnabled(false);
  }

  if (apiError) throw apiError;
}

export async function detachPushDeviceBeforeSignOut(): Promise<void> {
  const deviceId = await storedDeviceId();

  if (deviceId) {
    try {
      const tokens = await getFirebaseSecurityTokens(true);
      await deleteDevice(tokens, deviceId);
    } catch {
      // Signing out must remain possible offline. Deleting the local FCM token below
      // makes any stale server-side token unusable; the backend invalidates it if retried.
    }
  }

  try {
    await deleteToken(messaging());
  } catch {
    // The token may not exist yet; local identity is still cleared below.
  }

  await AsyncStorage.multiRemove([
    DEVICE_ID_KEY,
    INSTALLATION_ID_KEY,
    PUSH_ENABLED_KEY,
  ]);
}
