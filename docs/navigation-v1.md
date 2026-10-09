# LA Z 1310 Mobile — Navigation Contract V1

Issue: #16

## Goal

Integrate the approved Figma V1 modules into one Expo Router application shell
without creating backend endpoints before the UI/data contracts are stable.

## Provider hierarchy

```text
SafeAreaProvider
└── ThemeProvider
    └── AuthProvider
        └── RadioProvider
            └── AppNavigator
                ├── Expo Router Stack
                └── MiniPlayer
```

The radio provider stays above route transitions so playback is not owned by any
single screen.

## Routes

```text
/
├── /home
├── /radio
├── /weather
│   └── /weather/[city]
├── /dynamics
│   ├── /dynamics/[id]
│   ├── /dynamics/[id]/participate
│   └── /dynamics/confirmation
├── /explore
├── /contact
├── /advertise
├── /auth
└── /profile
    └── /profile/settings
        ├── /profile/settings/appearance
        ├── /profile/settings/account
        └── /profile/settings/privacy
```

## Global responsibilities

### Theme

V1 stores the user preference locally on the device:

- `dark`
- `light`

No FastAPI call is required. The preference can be synchronized with an account
in a later contract if product requirements justify it.

### Authentication

This branch provides a UI/navigation shell only. It intentionally does **not**
implement Firebase Auth yet. Demo authentication is in-memory and no password,
email, or form data is sent over the network.

### Radio

The existing direct-stream architecture remains unchanged:

```text
Device -> configured external live-stream endpoint
```

FastAPI must not proxy, retransmit, cache, or store the audio stream.

## Live API integration

Issue #19 replaces the Weather and Dynamics fixtures with the deployed
FastAPI V1 contracts.

### Weather

Mobile now consumes:

- `GET /api/v1/weather/locations`
- `GET /api/v1/weather/{location_id}`

The backend remains the only client of the weather provider. Mobile keeps the
canonical Celsius/km/h/mm response in memory and converts units only for
presentation. The °F/°C preference is persisted locally with AsyncStorage.

The UI renders loading, retry, 404/503-safe states, stale-cache indication and
the provider attribution returned by the API. No fixture weather is shown when
the service is unavailable.

### Dynamics

Mobile now consumes:

- `GET /api/v1/dynamics`
- `GET /api/v1/dynamics/{dynamic_id}`
- `POST /api/v1/dynamics/{dynamic_id}/participations`

Campaigns, artwork, dates, status, form fields, legal URLs and participation
mode come from the published API contract. Form submissions carry the
`X-Content-Release` value returned by the detail read as `releaseId`, plus a
stable UUID `Idempotency-Key` and explicit terms/privacy consent.

The transport supports Firebase ID token and App Check headers without
embedding credentials. Production/staging form acceptance remains gated on the
separate Firebase mobile Auth/App Check integration; public Weather and Dynamics
reads are live independently of that work.

Supported participation types remain:

```ts
type DynamicParticipationType =
  | 'form'
  | 'external_url';
```

External URLs are taken only from the API and are never fabricated.

## Deferred product work

- Firebase Auth and App Check token integration
- account deletion
- favorites/saved content
- notification preference synchronization and notification center

## Figma source

Design file:
`gIoWq3zh2op0lVSxqr4fvv`

Primary pages:

- 03 Prototype
- 04 Auth & Profile
- 05 Weather
- 06 Dynamics
- 00 References — Weather
- 00 References - Dynamics

## Physical acceptance flow

1. Open the Development Build.
2. Splash routes to Home.
3. Start the radio and confirm MiniPlayer persists across routes.
4. Open Weather, select Detroit, return.
5. Open Dynamics from the Home campaign or Explore.
6. Open a form-based dynamic, complete the local form, reach confirmation.
7. Open Profile/Auth and complete the demo auth flow.
8. Open Settings -> Appearance and select Light.
9. Navigate across Home, Weather, Dynamics and Profile and confirm the global
   theme stays selected.
10. Reopen the app and confirm the theme preference persists.
11. Confirm background radio behavior remains unchanged from the previously
   accepted Development Build.

A new Development Build may be required because this branch adds the native
AsyncStorage dependency used for persisted theme preference.
