import { PropsWithChildren, useEffect } from 'react';
import { Platform } from 'react-native';

import { getFirebaseSecurityTokens } from '../auth/firebase';
import { useAuth } from '../auth/AuthProvider';
import { useContentVersion } from '../content/ContentVersionProvider';
import {
  getNotificationPreferences,
} from '../notifications/api';
import { usePushNotifications } from '../notifications/PushNotificationsProvider';
import { getPublishedPrograms } from './api';
import {
  pauseProgramReminders,
  syncSavedProgramReminders,
} from './reminders';

export function ProgramRemindersProvider({ children }: PropsWithChildren) {
  const { releaseId } = useContentVersion();
  const { isAuthenticated } = useAuth();
  const push = usePushNotifications();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let active = true;

    void (async () => {
      if (!isAuthenticated || !push.enabled) {
        await pauseProgramReminders();
        return;
      }

      const tokens = await getFirebaseSecurityTokens(true);
      const preferences = await getNotificationPreferences(tokens);

      if (!active) return;

      if (!preferences.programs) {
        await pauseProgramReminders();
        return;
      }

      const programs = await getPublishedPrograms(releaseId);
      if (!active) return;

      await syncSavedProgramReminders(programs);
    })().catch(() => {
      // Program reminders are an enhancement. Push registration and the
      // published Programs experience must remain usable if local resync fails.
    });

    return () => {
      active = false;
    };
  }, [isAuthenticated, push.enabled, releaseId]);

  return children;
}
