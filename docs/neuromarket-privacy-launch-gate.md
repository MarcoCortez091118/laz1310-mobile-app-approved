# NeuroMarket LA Z 1310 — product identity & privacy acceptance

Issue [LAZ-MOBILE #52](https://github.com/MarcoCortez091118/laz1310-mobile-app/issues/52).
Companion API [#57](https://github.com/MarcoCortez091118/laz1310-services-fastapi/issues/57).

## Approved product decisions

- LA Z 1310 is a **NeuroMarket** application. Never present a streaming
  vendor as the legal/product operator, technical support provider, owner of
  user data or owner of NeuroMarket's Play Store app.
- Customer support: **Support@neuromarket.io**. Privacy/About, Settings, and
  logged-out Profile each expose a functional mail composer and visible
  copyable address.
- Sharing uses `https://www.laz1310.com/` on both Android and iOS until
  NeuroMarket owns a **verified store listing**. Do not share any legacy
  third-party package URL.
- Playback still uses the externally hosted live-stream endpoint configured
  in `src/config/radio.ts`; product branding has no effect on audio routing.

## Privacy and legal release gate

The policy in `src/features/privacy/policy.ts` is **a new bilingual draft for
legal/product approval, not a verified legal instrument**. It must not ship
to users or stores until NeuroMarket confirms, in writing:

1. Full **registered legal name**, physical address, controller identity and
   relevant jurisdiction(s) for US and Mexico users.
2. Exact collection and processing purposes based on deployed services:
   Firebase Auth, App Check, Firestore profiles, push tokens/preferences,
   Dynamics forms and consent, telemetry, live streaming, third-party links.
3. Processors, cross-border transfers, retention periods, rights workflows,
   account/data deletion procedure (Mobile Issue #48), and handling of minors.
4. Public HTTPS privacy policy URL, applicable terms and clear store disclosures.
5. The exact final notice text in English and Spanish and canonical revision.

The API's `CURRENT_PRIVACY_POLICY_VERSION` and Mobile's
`PRIVACY_POLICY_VERSION` must match **exactly**:
`neuromarket-laz1310-mobile-v1`.

Old `radio-online-hd-mobile-v1` values are **historical consent audit markers**,
not approvals of the NeuroMarket notice. They are permitted only internally
by FastAPI for compatibility with already-installed APKs, and never appear
in public Mobile legal/copy/share screens.

## Deployment ordering (do not invert)

1. Finish policy legal review and update both projects if legal text changes.
   If the legal content changes materially, bump the version and test again.
2. Review/merge/deploy FastAPI compatibility PR first; smoke-test
   `POST /api/v1/me/privacy-consent` with the new version in staging.
3. Only then review/merge Mobile PR; build downloadable Android APK and
   validate registration, policy consent, existing-profile re-consent,
   bilingual policy readability, Support mail composer & fallback,
   and Android/iOS native share (correct NeuroMarket link).
4. Ensure `GET /api/v1/me` shows the new consent version after acceptance;
   existing old-version accounts show pending until new consent is recorded.
5. Respect store policy account deletion gate before public distribution.

## Regression gates

Mobile GitHub CI runs Expo Doctor, Expo version compatibility, TypeScript,
web export, npm audit, plus `npm run check:product-identity`. The latter
rejects outdated vendor references in end-user code and verifies the
centralized support contact, exact policy version and official share URL.

No changes to Firebase token/App Check flows, server-side authorization,
Firestore data shape or the media stream. Roll back Mobile first; only then
consider reverting the API compatibility extension.
