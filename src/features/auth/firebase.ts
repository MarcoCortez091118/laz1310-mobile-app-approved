import { getApp } from '@react-native-firebase/app';
import {
  AppCheck,
  ReactNativeFirebaseAppCheckProvider,
  getToken as getAppCheckToken,
  initializeAppCheck,
} from '@react-native-firebase/app-check';
import {
  User,
  createUserWithEmailAndPassword,
  getAuth,
  getIdToken,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@react-native-firebase/auth';
import { Platform } from 'react-native';

let appCheckInstance: AppCheck | null = null;

export interface FirebaseSecurityTokens {
  idToken?: string;
  appCheckToken: string;
}

export function firebaseAuth() {
  return getAuth(getApp());
}

export function observeFirebaseUser(listener: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth(), listener);
}

export async function initializeNativeAppCheck() {
  if (Platform.OS === 'web') {
    throw new Error('Firebase App Check is available only in native LA Z builds');
  }

  if (!appCheckInstance) {
    const provider = new ReactNativeFirebaseAppCheckProvider();

    provider.configure({
      android: {
        provider: __DEV__ ? 'debug' : 'playIntegrity',
      },
      apple: {
        provider: __DEV__ ? 'debug' : 'appAttestWithDeviceCheckFallback',
      },
    });

    appCheckInstance = initializeAppCheck(getApp(), {
      provider,
      isTokenAutoRefreshEnabled: true,
    });
  }

  return appCheckInstance;
}

export async function getFirebaseSecurityTokens(
  requireAuth = true,
  forceIdTokenRefresh = false,
): Promise<FirebaseSecurityTokens> {
  const appCheck = await initializeNativeAppCheck();
  const [{ token: appCheckToken }, user] = await Promise.all([
    getAppCheckToken(appCheck, false),
    Promise.resolve(firebaseAuth().currentUser),
  ]);

  if (!user && requireAuth) {
    throw new Error('Firebase authentication is required');
  }

  return {
    appCheckToken,
    idToken: user ? await getIdToken(user, forceIdTokenRefresh) : undefined,
  };
}

export async function registerFirebaseEmail(
  email: string,
  password: string,
  displayName: string,
) {
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth(),
    email.trim(),
    password,
  );

  await updateProfile(credential.user, {
    displayName: displayName.trim(),
  });

  return credential.user;
}

export async function signInFirebaseEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(
    firebaseAuth(),
    email.trim(),
    password,
  );

  return credential.user;
}

export async function signOutFirebase() {
  await signOut(firebaseAuth());
}

export async function updateFirebaseDisplayName(displayName: string) {
  const user = firebaseAuth().currentUser;

  if (!user) {
    throw new Error('Firebase authentication is required');
  }

  await updateProfile(user, { displayName: displayName.trim() });
}

export async function sendCurrentUserVerificationEmail() {
  const user = firebaseAuth().currentUser;

  if (!user) {
    throw new Error('Firebase authentication is required');
  }

  await sendEmailVerification(user);
}

export async function reloadCurrentFirebaseUser() {
  const user = firebaseAuth().currentUser;

  if (!user) {
    throw new Error('Firebase authentication is required');
  }

  await reload(user);
  await getIdToken(user, true);

  return user;
}

export type FirebaseUser = User;
