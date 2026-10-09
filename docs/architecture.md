# LAZ1310 Mobile Architecture

## 1. Purpose

This document defines the initial technical architecture for the LAZ1310 mobile application.

The V1 foundation follows NeuroMarket engineering principles:

- architecture before implementation
- SOLID boundaries
- SDLC traceability
- security by design
- minimal infrastructure coupling
- observable failure states
- reusable UI primitives
- independent mobile and backend release cycles

## 2. System boundaries

### Control plane

FastAPI on Azure provides application data and control-plane capabilities:

- bootstrap/content configuration
- stations and station metadata
- now-playing metadata
- users/session
- devices/push registration
- future news, events, campaigns, and programming

Base URL:

```text
https://laz1310-fastapi-enaeaghwfhbhgsa9.canadacentral-01.azurewebsites.net
```

### Media plane

The mobile application consumes the radio stream directly from the radio provider:

```text
Device
  |
  +--> https://sh2.radioonlinehd.com:8050/stream
```

The audio stream MUST NOT be proxied through FastAPI, Azure App Service, Firebase, or application storage.

Reasons:

1. avoid duplicated bandwidth/egress costs
2. reduce latency and failure domains
3. preserve separation between application data and media delivery
4. avoid unnecessary infrastructure ownership for the radio transport

## 3. Mobile structure

```text
app/
  _layout.tsx
  index.tsx
  home.tsx
  radio.tsx

src/
  api/
  components/
  config/
  features/
    radio/
  theme/

assets/
  brand/
```

## 4. Audio ownership

The audio player is owned by `RadioProvider` above navigation.

```text
RootLayout
  |
  +-- RadioProvider
       |
       +-- Navigation
       |    +-- Splash
       |    +-- Home
       |    +-- Radio
       |
       +-- MiniPlayer
```

This prevents playback from being tied to the lifecycle of the Radio screen.

## 5. Playback state model

```text
idle
connecting
playing
paused
reconnecting
error
```

The UI maps directly to these states so Figma and runtime behavior use the same vocabulary.

## 6. Resilience

A stream interruption while playback is desired uses bounded exponential backoff:

```text
1s -> 2s -> 4s -> 8s -> error
```

API failure must not automatically stop an already available direct radio stream.

## 7. Background playback

`expo-audio` is configured with background playback enabled.

The player activates lock-screen controls while live playback is requested. This is required for sustained background playback on Android and enables native media controls on supported platforms.

## 8. Configuration

Public runtime configuration:

- API base URL: `EXPO_PUBLIC_API_BASE_URL`
- radio stream: source-controlled public station configuration

The stream URL is not a secret.

Secrets and credentials must never use `EXPO_PUBLIC_*` variables or be committed.

## 9. Current V1 scope

Included:

- Splash
- Home
- Radio
- MiniPlayer
- direct live stream
- playback states
- reconnect strategy
- lock-screen/background foundation
- API client foundation
- official LAZ1310 brand assets

Deferred:

- complete authentication UX
- news
- events
- profile
- production push notification UX
- analytics
- store release automation

## 10. Source of truth

- Figma: visual system and approved interaction reference
- GitHub: implementation, review, audit trail, CI
- FastAPI OpenAPI: backend/mobile contract
