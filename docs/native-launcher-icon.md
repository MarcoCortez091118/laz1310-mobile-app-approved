# Official LA Z 1310 Native Launcher Icon

Issue: #56. Source of truth: `assets/brand/La Z Icon.webp`.

## Branding and target platforms

- Main iOS/Android launcher: `assets/brand/la-z-launcher-icon.png` (1024x1024 opaque RGB, preserving the source's complete square artwork). Referenced as `icon` from `app.config.js`.
- Android adaptive foreground: `assets/brand/la-z-adaptive-foreground.png` (1024x1024 RGBA, central approved artwork inset to 608x608 with transparent margins). Referenced as `android.adaptiveIcon.foregroundImage`; background stays #050101.
- The older `app-icon.png` and `adaptive-icon-foreground.png` are retained for easy rollback. No changes to app bundle IDs, Play listing, splash screen, Firebase, React Native views, stream URL or API contracts.

The source art is not redrawn, retouched or regenerated. Native PNG exports are technical format/size adaptations of the user's approved WebP.

## Reproducible generation

Requires Python 3.12+ and Pillow 11.3.0:

```bash
python -m pip install Pillow==11.3.0
python scripts/generate_launcher_icons.py
python scripts/generate_launcher_icons.py --check
npx expo config --type public
```

The `--check` mode verifies dimensions, format, transparency in Android padding, and byte-independent pixel equality to a fresh conversion from the approved WebP. The mobile CI runs this check on all PRs after installing Pillow.

## Android/iOS device acceptance

1. Build the **downloadable APK** using existing EAS preview workflow after PR is approved and merged; uninstall any earlier app with an outdated launcher cache if necessary, then install the new binary.
2. Verify the *actual launcher icon* (not splash screen) in Android standard/round/squircle masks, light and dark launcher background; check that the LA Z identity is not clipped.
3. Verify iOS icon in an iOS build; verify there are no transparent/white corners or cropping.
4. Confirm product name LA Z 1310, `com.neuromarket.laz1310` bundle/package and existing splash logo stay unchanged.
5. Confirm radio playback, native sharing, Home navigation and Firebase auth unaffected.

## Deployment / rollback

Native app icons are compiled by Expo/EAS and are not updated via FastAPI release data or OTA JavaScript updates. Merge only after code review and green CI; rebuild to observe any visual change. For rollback, revert this PR (the old source PNGs remain present) and rebuild. No change to production without authorization.
