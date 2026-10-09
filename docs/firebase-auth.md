# Firebase Auth + App Check — Mobile V1

LA Z Mobile uses native Firebase SDKs through React Native Firebase.

## Identity flow

```text
email + password
      ↓
Firebase Authentication
      ↓
Firebase ID token
      +
Firebase App Check token
      ↓
POST /api/v1/auth/session
      ↓
LA Z business profile
      ↓
GET/PATCH /api/v1/me
```

FastAPI never receives or stores the user's password.

## Packages

- `@react-native-firebase/app`
- `@react-native-firebase/auth`
- `@react-native-firebase/app-check`

This is native functionality and is not available in Expo Go. A new Development
Build is required after introducing these modules.

## Firebase native app registration

The Firebase project must contain apps matching:

```text
Android: com.neuromarket.laz1310
iOS:     com.neuromarket.laz1310
```

Download the platform configuration files directly from Firebase Console:

- Android: `google-services.json`
- iOS: `GoogleService-Info.plist`

Do not commit either file.

The Expo config reads file paths from:

```text
GOOGLE_SERVICES_JSON
GOOGLE_SERVICE_INFO_PLIST
```

For EAS, configure these as file environment variables/secrets.

## App Check

Development native builds use the Firebase App Check debug provider.

Production providers:

```text
Android → Play Integrity
Apple   → App Attest with DeviceCheck fallback
```

For a Development Build, create/register a debug token in Firebase Console and
provide it to the EAS development build environment as:

```text
FIREBASE_APP_CHECK_DEBUG_TOKEN
```

Never commit that token and never expose it through an `EXPO_PUBLIC_*`
variable.

## Backend headers

Protected requests are sent with:

```http
Authorization: Bearer <Firebase ID token>
X-Firebase-AppCheck: <App Check token>
```

The shared mobile auth boundary obtains both tokens on demand. Firebase ID
tokens are refreshed by the SDK; profile refresh can force an ID-token refresh
after email verification.

## Current V1 behavior

Implemented:

- email/password account creation
- email/password sign-in
- native persistent Firebase session
- `POST /auth/session` synchronization
- real `GET/PATCH /me` profile
- display-name editing
- email verification request + refresh
- sign-out
- App Check token acquisition
- Dynamics participation security headers

Deferred:

- notification permission / FCM token registration
- Notification Center
- notification category preferences
- Google / Apple sign-in
- password reset UI
- account deletion
- favorites / saved items / interest personalization

## Physical QA

1. Install a new Development Build containing the Firebase native modules.
2. Create a new email/password account.
3. Confirm Firebase Console shows the new Auth user.
4. Confirm Profile shows the LA Z API business profile.
5. Kill/reopen the app and verify the session is restored.
6. Sign out and sign back in.
7. Send an email-verification message and refresh after verification.
8. Edit display name and confirm persistence.
9. Submit an App-Check-protected Dynamic.
10. Regression-test radio background playback.
