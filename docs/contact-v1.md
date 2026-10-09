# LA Z 1310 Mobile — Contact & advertising V1

Issue: #54

## Product scope

Contact and advertising are independent **public** flows from Explore. They
require no account, authentication, database write, API endpoint, third-party
SDK or new native permissions. They use React Native's native Linking.

### Contact / Contacto (route: `/contact`)

Show the four product-provided public LA Z destinations in this order:

1. Website — https://laz1310.com
2. Facebook — https://www.facebook.com/laz1310
3. Instagram — https://www.instagram.com/laz1310am/
4. WhatsApp — https://wa.me/13132911310

Each accessible row opens the exact HTTPS URL in the OS-selected
browser/application. Website, social app and WhatsApp availability are controlled
by device/app configuration. Users may copy the visible destination details.
On failure, show localized feedback with the URL as a fallback.

### Promote your business / Promociónate con nosotros (route: `/advertise`)

Provide a dedicated commercial information screen with a CTA that invokes
the system email app via a `mailto:` link:

- Recipient: `sales@laz1310.com`
- Subject (ES): `Quiero promocionarme en LA Z 1310`
- Subject (EN): `Advertising with LA Z 1310`

The address remains visible and selectable. No automatic send happens:
the listener reviews and sends the email in their own app. Missing mail apps
produce localized fallback guidance with the sales address. The app does not
collect commercial leads or email contents.

**Do not confuse** `sales@laz1310.com` (station advertising)
with `Support@neuromarket.io` (NeuroMarket technical/privacy support).
Do not brand a third-party streaming host as operator.

## UX/navigation invariants

- Explore retains existing Dynamics, Weather and Programs modules and adds
  Contact and Advertise as new working options; nothing is disabled.
- The approved Home hierarchy and four persistent bottom destinations do not
  change. Secondary Contact/Advertise screens use back-navigation, and scrolling
  reserves space for the MiniPlayer.
- English and Spanish typography, dark/light theming, 48dp+ hit targets,
  screen-reader names and graceful external-app failures must be maintained.
- URLs and sales email are constants in `src/config/contact.ts`, consumed by
  typed linking actions; no user input or untrusted server URL construction.

## Verification

CI: Expo dependency compatibility, Expo Doctor, TypeScript, static public-link
regression check, web export smoke build and dependency audit.

Physical device QA (Android and iOS):
1. Logged out, enter Explore > Contact. Open all four links; verify correct
   domain/profile/phone as provided. Try a device without WhatsApp.
2. Enter Explore > Advertise. Tap Contact Sales. Confirm system composer
   recipient, language-specific subject, and that nothing is sent by the app.
3. Dismiss composer; ensure navigation, direct radio playback and MiniPlayer
   continue uninterrupted. Try without a configured email client.
4. Test Spanish/English, light/dark, small displays, large font and screen reader.
5. Verify technical Support from Profile/Settings remains distinct from sales.
6. Revisit Home/Radio/Dynamics/Programs; no structural regressions.

## SDLC / rollback

Issue -> feature branch based on fresh `main` -> focused PR -> CI -> device QA
-> manual review/merge -> downloadable APK acceptance.
No FastAPI/Admin changes, secrets or migrations. Rollback by reverting this PR;
native store releases still require separate approval.
