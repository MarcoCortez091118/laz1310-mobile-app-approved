import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  LazUserProfile,
  acceptBusinessPrivacyPolicy,
  createBusinessSession,
  patchBusinessProfile,
} from './api';
import {
  FirebaseUser,
  getFirebaseSecurityTokens,
  observeFirebaseUser,
  registerFirebaseEmail,
  reloadCurrentFirebaseUser,
  sendCurrentUserVerificationEmail,
  signInFirebaseEmail,
  signOutFirebase,
  updateFirebaseDisplayName,
} from './firebase';
import { detachPushDeviceBeforeSignOut } from '../notifications/device';
import { PRIVACY_POLICY_VERSION } from '../privacy/policy';

type AuthStatus =
  | 'initializing'
  | 'signedOut'
  | 'syncing'
  | 'authenticated'
  | 'error';

interface AuthContextValue {
  status: AuthStatus;
  isReady: boolean;
  isAuthenticated: boolean;
  firebaseUser: FirebaseUser | null;
  profile: LazUserProfile | null;
  error: string | null;
  registerWithEmail: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  acceptPrivacyPolicyConsent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function deviceProfileDefaults() {
  const resolved = Intl.DateTimeFormat().resolvedOptions();

  return {
    locale: resolved.locale || 'es-US',
    timezone: resolved.timeZone || 'America/Detroit',
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<LazUserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const syncGeneration = useRef(0);

  const synchronize = useCallback(
    async (
      user: FirebaseUser,
      profileOverride?: { displayName?: string },
      forceTokenRefresh = false,
      privacyPolicyVersion?: string,
    ) => {
      const generation = ++syncGeneration.current;
      setStatus('syncing');
      setError(null);

      try {
        const tokens = await getFirebaseSecurityTokens(
          true,
          forceTokenRefresh,
        );
        let businessProfile = await createBusinessSession(tokens);
        const defaults = deviceProfileDefaults();

        const patch = {
          ...(!businessProfile.displayName && user.displayName
            ? { displayName: user.displayName }
            : {}),
          ...profileOverride,
          ...(!businessProfile.locale ? { locale: defaults.locale } : {}),
          ...(!businessProfile.timezone
            ? { timezone: defaults.timezone }
            : {}),
        };

        if (Object.keys(patch).length > 0) {
          businessProfile = await patchBusinessProfile(tokens, patch);
        }

        if (privacyPolicyVersion) {
          businessProfile = await acceptBusinessPrivacyPolicy(
            tokens,
            privacyPolicyVersion,
          );
        }

        if (generation === syncGeneration.current) {
          setFirebaseUser(user);
          setProfile(businessProfile);
          setStatus('authenticated');
        }

        return businessProfile;
      } catch (syncError) {
        if (generation === syncGeneration.current) {
          setProfile(null);
          setStatus('error');
          setError(
            syncError instanceof Error
              ? syncError.message
              : 'No pudimos sincronizar tu cuenta con LA Z.',
          );
        }
        throw syncError;
      }
    },
    [],
  );

  useEffect(() => {
    const unsubscribe = observeFirebaseUser((user) => {
      if (!user) {
        syncGeneration.current += 1;
        setFirebaseUser(null);
        setProfile(null);
        setError(null);
        setStatus('signedOut');
        return;
      }

      setFirebaseUser(user);
      void synchronize(user).catch(() => {
        // The provider exposes the synchronization error to UI.
      });
    });

    return unsubscribe;
  }, [synchronize]);

  const registerWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      const user = await registerFirebaseEmail(email, password, displayName);
      await synchronize(
        user,
        { displayName: displayName.trim() },
        true,
        PRIVACY_POLICY_VERSION,
      );
    },
    [synchronize],
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const user = await signInFirebaseEmail(email, password);
      await synchronize(user);
    },
    [synchronize],
  );

  const signOut = useCallback(async () => {
    syncGeneration.current += 1;
    await detachPushDeviceBeforeSignOut();
    await signOutFirebase();
    setFirebaseUser(null);
    setProfile(null);
    setError(null);
    setStatus('signedOut');
  }, []);

  const updateDisplayName = useCallback(
    async (displayName: string) => {
      if (!firebaseUser) {
        throw new Error('Firebase authentication is required');
      }

      const normalized = displayName.trim();
      await updateFirebaseDisplayName(normalized);
      const tokens = await getFirebaseSecurityTokens(true);
      const updated = await patchBusinessProfile(tokens, {
        displayName: normalized,
      });

      setProfile(updated);
    },
    [firebaseUser],
  );

  const refreshProfile = useCallback(async () => {
    const user = await reloadCurrentFirebaseUser();
    await synchronize(user, undefined, true);
  }, [synchronize]);

  const sendVerificationEmail = useCallback(async () => {
    await sendCurrentUserVerificationEmail();
  }, []);

  const acceptPrivacyPolicyConsent = useCallback(async () => {
    if (!firebaseUser) {
      throw new Error('Firebase authentication is required');
    }

    const tokens = await getFirebaseSecurityTokens(true);
    const updated = await acceptBusinessPrivacyPolicy(
      tokens,
      PRIVACY_POLICY_VERSION,
    );
    setProfile(updated);
  }, [firebaseUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isReady: status !== 'initializing',
      isAuthenticated: status === 'authenticated' && Boolean(profile),
      firebaseUser,
      profile,
      error,
      registerWithEmail,
      signInWithEmail,
      signOut,
      updateDisplayName,
      refreshProfile,
      sendVerificationEmail,
      acceptPrivacyPolicyConsent,
    }),
    [
      error,
      firebaseUser,
      profile,
      refreshProfile,
      registerWithEmail,
      sendVerificationEmail,
      acceptPrivacyPolicyConsent,
      signInWithEmail,
      signOut,
      status,
      updateDisplayName,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return value;
}
