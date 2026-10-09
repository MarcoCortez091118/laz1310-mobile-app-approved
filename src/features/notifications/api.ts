import { apiRequest } from '../../api/client';
import { FirebaseSecurityTokens } from '../auth/firebase';

export interface DeviceResponse {
  id: string;
  userId: string;
  installationId: string;
  platform: 'ios' | 'android';
  appVersion: string;
  deviceModel: string | null;
  osVersion: string | null;
  locale: string | null;
  timezone: string | null;
  expoPushToken: string | null;
  nativePushToken: string | null;
  nativePushProvider: 'fcm' | 'apns' | null;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
}

export interface RegisterDeviceInput {
  installationId: string;
  platform: 'ios' | 'android';
  appVersion: string;
  deviceModel?: string | null;
  osVersion?: string | null;
  locale?: string | null;
  timezone?: string | null;
}

export interface NotificationPreferences {
  general: boolean;
  radio: boolean;
  programs: boolean;
  dynamics: boolean;
}

export type NotificationPreferencePatch = Partial<NotificationPreferences>;
export type NotificationCategory = 'general' | 'radio' | 'programs' | 'dynamics';

export interface NotificationRouteTarget {
  kind: 'route';
  value: string;
}

export interface NotificationInboxItem {
  id: string;
  type: NotificationCategory;
  title: string;
  body: string;
  target: NotificationRouteTarget;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationInboxPage {
  items: NotificationInboxItem[];
  nextCursor: string | null;
}

export interface ReadAllNotificationsResponse {
  readAt: string;
}

function authHeaders(tokens: FirebaseSecurityTokens) {
  if (!tokens.idToken) {
    throw new Error('Firebase ID token is required for notification registration');
  }

  return {
    Authorization: 'Bearer ' + tokens.idToken,
    'X-Firebase-AppCheck': tokens.appCheckToken,
  };
}

export function registerDevice(
  tokens: FirebaseSecurityTokens,
  input: RegisterDeviceInput,
) {
  return apiRequest<DeviceResponse>('/api/v1/devices', {
    method: 'POST',
    headers: authHeaders(tokens),
    body: JSON.stringify(input),
  });
}

export function updateDevicePushToken(
  tokens: FirebaseSecurityTokens,
  deviceId: string,
  input: {
    expoPushToken: string | null;
    nativePushToken: string | null;
    notificationsEnabled: boolean;
    nativePushProvider: 'fcm' | 'apns' | null;
  },
) {
  return apiRequest<DeviceResponse>(
    `/api/v1/devices/${encodeURIComponent(deviceId)}/push-token`,
    {
      method: 'PUT',
      headers: authHeaders(tokens),
      body: JSON.stringify(input),
    },
  );
}

export function deleteDevice(
  tokens: FirebaseSecurityTokens,
  deviceId: string,
) {
  return apiRequest<void>(`/api/v1/devices/${encodeURIComponent(deviceId)}`, {
    method: 'DELETE',
    headers: authHeaders(tokens),
  });
}

export function getNotificationPreferences(tokens: FirebaseSecurityTokens) {
  return apiRequest<NotificationPreferences>(
    '/api/v1/me/notification-preferences',
    { headers: authHeaders(tokens) },
  );
}

export function patchNotificationPreferences(
  tokens: FirebaseSecurityTokens,
  patch: NotificationPreferencePatch,
) {
  return apiRequest<NotificationPreferences>(
    '/api/v1/me/notification-preferences',
    {
      method: 'PATCH',
      headers: authHeaders(tokens),
      body: JSON.stringify(patch),
    },
  );
}

export function getNotificationInbox(
  tokens: FirebaseSecurityTokens,
  input?: { limit?: number; after?: string | null },
) {
  const params = new URLSearchParams();
  params.set('limit', String(input?.limit ?? 50));
  if (input?.after) params.set('after', input.after);
  return apiRequest<NotificationInboxPage>(`/api/v1/notifications?${params.toString()}`, {
    headers: authHeaders(tokens),
  });
}

export function markNotificationRead(
  tokens: FirebaseSecurityTokens,
  notificationId: string,
) {
  return apiRequest<NotificationInboxItem>(
    `/api/v1/notifications/${encodeURIComponent(notificationId)}/read`,
    {
      method: 'PATCH',
      headers: authHeaders(tokens),
    },
  );
}

export function markAllNotificationsRead(tokens: FirebaseSecurityTokens) {
  return apiRequest<ReadAllNotificationsResponse>('/api/v1/notifications/read-all', {
    method: 'POST',
    headers: authHeaders(tokens),
  });
}
