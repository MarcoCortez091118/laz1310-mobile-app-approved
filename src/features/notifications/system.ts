import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const PUSH_CHANNEL_ID = 'laz-general';
export const PROGRAM_REMINDER_MARKER = 'lazProgramReminder';
const FOREGROUND_COPY_MARKER = 'lazForegroundCopy';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const isForegroundCopy = data?.[FOREGROUND_COPY_MARKER] === '1';
    const isProgramReminder = data?.[PROGRAM_REMINDER_MARKER] === '1';
    const shouldPresent = isForegroundCopy || isProgramReminder;

    return {
      shouldPlaySound: shouldPresent,
      shouldSetBadge: false,
      shouldShowBanner: shouldPresent,
      shouldShowList: shouldPresent,
    };
  },
});

export async function ensureSystemNotificationChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(PUSH_CHANNEL_ID, {
    name: 'LA Z 1310',
    description: 'LA Z updates, programs, radio and promotions',
    importance: Notifications.AndroidImportance.HIGH,
    enableVibrate: true,
    vibrationPattern: [0, 220, 120, 220],
    lightColor: '#D30A12',
  });
}

export async function presentForegroundSystemNotification(input: {
  id?: string;
  title: string;
  body: string;
  targetValue?: string | null;
}) {
  await ensureSystemNotificationChannel();

  const content: Notifications.NotificationContentInput = {
    title: input.title,
    body: input.body,
    sound: true,
    data: {
      [FOREGROUND_COPY_MARKER]: '1',
      ...(input.targetValue ? { targetValue: input.targetValue } : {}),
    },
  };

  if (Platform.OS === 'android') {
    await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
        channelId: PUSH_CHANNEL_ID,
      },
    });
    return;
  }

  await Notifications.scheduleNotificationAsync({ content, trigger: null });
}

export function systemNotificationTarget(
  data: Record<string, unknown> | null | undefined,
) {
  const value = data?.targetValue;
  return typeof value === 'string' ? value : null;
}
