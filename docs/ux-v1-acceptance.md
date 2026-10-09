# LA Z 1310 — UX/UI V1 Usability Acceptance

Issue: #47

## Decision

LA Z is radio-first. The four principal destinations are Inicio, Radio,
Explorar and Perfil. News and Events are out of V1 until publishing contracts
and working journeys exist. Do not show a fake selected filter or disabled
product controls.

The native audio stream remains device -> the configured live-stream endpoint; mobile authentication,
notifications, published Program/Dynamics/Weather contracts and backend release
semantics remain unchanged.

## Navigation and home hierarchy

- Replace top-level destinations rather than pushing them into an unbounded stack.
- Top-level destination switches have no transition; detail routes use a
  horizontal push; browser/system share handles its own native presentation.
- Radio remains accessible from Home and the MiniPlayer while the stream
  continues across navigation.
- Product-approved Home order (top to bottom): header with logo, weather and
  notifications; horizontally scrollable shortcut buttons (Todos, Dinámicas,
  Clima, Programas, Notificaciones); published banners; live radio card;
  published Dynamics carousel; Programs with actionable cards; Spotify playlist;
  persistent bottom navigation.
- Shortcut buttons are navigation, **not content filters**. `Todos` means all
  Home modules are visible and scrolls Home to the top when pressed. Other
  buttons open their existing published module routes; no fake filtering state.
- Published promotional/dynamic content disappears naturally when not available.
  Home Banners are user-swiped, Dynamics retains its intentionally approved
  auto-advance (PR #34); never show two competing automatically moving banners.
- Programs open `/programs/{programId}`. The detail route/parameters remain
  unchanged and publication is controlled by FastAPI.

## Sharing

- Radio Share is the native React Native `Share.share({ message })`; this
  invokes Android's Sharesheet or the system sharing UI on iOS.
- Spanish Android text (product-provided):
  `Estoy escuchando LA Z Detroit. Escúchanos aquí: https://www.laz1310.com/`
- Sharing intentionally uses the official LA Z website on Android and iOS.
  Never link to another company's Play Store listing or claim the new app is
  published before NeuroMarket verifies its store URL. Product copy and
  destination live in `src/config/share.ts`.
- Sharesheet options such as WhatsApp, Gmail and Facebook are supplied by
  the OS and installed applications, not a custom hardcoded share menu.

## Accessibility and scope

- The bottom bar displays only actionable destinations and exposes
  `accessibilityState.selected`.
- The primary notification bell and Radio share affordance have 48dp targets.
- The Radio screen scrolls on small devices, with the vinyl size constrained
  by viewport width/height.
- Guest Profile exposes Sign In/Register, Appearance, Language and public
  Privacy Policy without forcing authentication. Auth-dependent features stay
  behind existing token checks.
- Explore offers guest-accessible Contact and Advertise with us. Contact
  exposes LA Z's public website, Facebook, Instagram and WhatsApp. Advertise
  uses a native mail composer to sales@laz1310.com and does not mix it with
  NeuroMarket technical support (Support@neuromarket.io).
- The UI does not expose unavailable Sleep Timer, Favorite, Volume, Events,
  unsupported Terms routes or empty News navigation. NeuroMarket Support is
  actionable in guest Profile, Settings and Privacy & About.
- Account deletion is a **separate hard launch gate** in Issue #48; hiding a
  dummy disabled control is not compliance.

## Manual device acceptance (required before merge/release)

1. Android small and normal-size devices: Home loads in the specified order
   (Header -> horizontal shortcuts -> Banners -> Radio -> Dynamics -> Programs
   -> Spotify -> bottom navigation); swipe the shortcuts and check all five
   labels/buttons work. `Todos` returns to the complete Home feed. Verify
   mini player does not cover an actionable button. Test light/dark appearance.
2. Change all four tabs repeatedly: no growing back history, no unreachable
   routes, and the radio stream keeps playing.
3. Tap Radio Share: Android system Sharesheet opens with LA Z website link
   and Spanish copy; copy text; verify WhatsApp/Gmail targets when installed.
   Canceling the share must not stop live radio.
4. iOS: system share sheet with website fallback (no unverified App Store ID);
   same navigation and background playback invariants.
5. Check English and Spanish copy in Radio/Profile/Notifications/Weather and
   on the share sheet.
6. Open Home program card and verify it resolves an existing published Program.
7. Confirm Dynamics auto-advance remains deliberate; banners no longer compete;
   gestures still work and first visible content remains accessible.
8. Logged out: navigate Profile -> Appearance/Language/NeuroMarket Privacy,
   and tap Support to open a mail composer addressed to Support@neuromarket.io.
   Sign in to participate or manage account. Logged in: Profile, Preferences
   and Privacy/About Support function correctly.
9. Loading/empty/errors for Weather, Programs, Dynamics, inbox; keyboard,
   narrow-width, large text, TalkBack/VoiceOver and reduced motion.
10. Confirm the NeuroMarket policy `neuromarket-laz1310-mobile-v1` has been
    formally approved, the companion FastAPI version PR deployed first, and
    account deletion Issue #48 resolved before production submission.

## Gates / rollback

GitHub PR CI: Expo compatibility, Expo Doctor, TypeScript,
web export smoke test and dependency audit. Manual QA must be recorded as
evidence. No FastAPI, Firestore, API schema, store release or EAS build changes
are in scope. Roll back by reverting this PR and rebuilding the APK if required.
