# LAZ1310 Mobile App

Official mobile application for **LA Z 1310 AM · Detroit, MI**, developed by NeuroMarket.

## Product architecture

- React Native + Expo
- TypeScript
- Expo Router
- `expo-audio` for direct live-stream playback
- FastAPI on Azure for application data and metadata
- Direct radio media plane to the configured external streaming endpoint

### Media plane

The audio stream is consumed **directly by the mobile device**:

```text
https://sh2.radioonlinehd.com:8050/stream
```

The FastAPI service must not proxy or retransmit audio.

### API

```text
https://laz1310-fastapi-enaeaghwfhbhgsa9.canadacentral-01.azurewebsites.net
```

## Design source

Figma is the source of truth for the current V1 design system, Home, Radio, Splash, and prototype flow.

## Development principles

- SOLID
- SDLC
- security by design
- separation of control plane and media plane
- reusable design-system components
- no secrets committed to the repository
