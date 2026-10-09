# Figma → React Native handoff

Figma file:

```text
https://www.figma.com/design/gIoWq3zh2op0lVSxqr4fvv
```

## Component mapping

| Figma | React Native |
| --- | --- |
| BrandLogo | `src/components/BrandLogo.tsx` |
| VinylArtwork | `src/components/VinylArtwork.tsx` |
| LiveBadge | `src/components/LiveBadge.tsx` |
| PlayPauseButton | `src/components/PlayPauseButton.tsx` |
| MiniPlayer | `src/components/MiniPlayer.tsx` |
| LiveRadioCard | `src/components/LiveRadioCard.tsx` |
| PromoHero | `src/components/PromoHero.tsx` |
| ProgramCard | `src/components/ProgramCard.tsx` |
| BottomNavigation | `src/components/BottomNavigation.tsx` |
| Splash / V1 | `app/index.tsx` |
| Home / V1 | `app/home.tsx` |
| Radio / V1 | `app/radio.tsx` |

## Design tokens

Primary runtime colors:

- black: `#050101`
- red: `#D30A12`
- burgundy: `#2F0908`
- white: `#FEFEFE`
- gray: `#8A8A8A`

Runtime tokens are centralized in:

```text
src/theme/tokens.ts
```

## Playback mapping

| Runtime state | Figma intent |
| --- | --- |
| idle | Vinyl Idle + Play |
| connecting | Loading |
| playing | Vinyl Playing + Pause + MiniPlayer Playing |
| paused | Vinyl Idle + Play + MiniPlayer Paused |
| reconnecting | Loading / reconnecting message |
| error | LiveRadioCard Error |

## Asset policy

The official logo and vinyl assets are stored locally under:

```text
assets/brand/
```

Do not regenerate the brand marks with AI or substitute them with approximations in production code.
