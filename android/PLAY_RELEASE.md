# Google Play release preparation

This is a preparation checklist, not a completed policy declaration or proof of
publication. Building an APK or Android App Bundle does not publish it to Google
Play. Play Console account access and the declaration answers below remain to be
verified by the owner.

## Intended release

- App name: **chemacabeza.dev**
- Proposed package: **dev.chemacabeza.app**
- Initial version: **1.0.0**, version code **1**
- Website: <https://chemacabeza.dev/>
- Privacy policy: <https://chemacabeza.dev/privacy-policy>
- Support: <https://chemacabeza.dev/support>
- Existing public contact: **chema@chemacabeza.dev**
- Listing draft: [`store-listing/en-US.txt`](store-listing/en-US.txt)

Confirm that the owner has no existing release under a different package or
signing identity before the first upload. Package names are permanent once used
on Google Play. Increment the version code for subsequent uploads.

## Build, signing, and domain association

- [x] Verify the generated package, version, release configuration, and current
  Play target-API requirements. Inspect the final merged Android manifest and
  included SDKs; do not infer permissions from the web app alone.
- [x] Build and validate a signed release APK for device testing and an AAB for
  Play upload. Retain the exact source revision used for the artifacts.
- [x] Confirm the owner controls the signing identity and has a durable, secure
  backup. Keep keystores, passwords, private keys, and secret environment files
  out of Git, published archives, logs, screenshots, and store assets.
- [ ] Configure Play App Signing. Obtain the **app-signing certificate** SHA-256
  fingerprint from Play Console. It can differ from the upload-key fingerprint
  and from the certificate used for a directly installed APK.
- [ ] Serve `/.well-known/assetlinks.json` over HTTPS on `chemacabeza.dev`, with
  the exact package name and fingerprints of the actual distributed app-signing
  certificates. Verify a public HTTP 200 response without an authentication wall
  or redirect. A certificate fingerprint is public; the private signing key is
  not.
- [ ] Verify Digital Asset Links on the actual installed release. Confirm the
  website opens as a Trusted Web Activity; a visible browser toolbar can indicate
  that association verification failed.

Build verification on November 27, 2026: APK signature schemes v2/v3 verified;
AAB JAR signature verified; both ZIP containers passed integrity checks. The
compiled APK identifies `dev.chemacabeza.app`, version `1.0.0` / code `1`, minimum
API 24 and target API 36. Its only declared permission is the package's own
signature-protected `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`. The website and
its external services still have the separate data practices listed below.
No Android phone or Play-distributed install has been tested yet.

## Real-device acceptance checks

- [ ] Install the release APK on an Android phone, then also test the bundle
  distributed by Play's internal testing track with its Play signing identity.
- [ ] Check first launch, purple gear icon, splash screen, navigation, Back,
  rotation, text scaling, external links, and returning from another app.
- [ ] Open the home page, project pages, articles, newsletter, and contact links.
  Verify the behavior of the external Marketplace and Calendly destinations.
- [ ] After an online launch, disconnect the network and reload a public page.
  The offline feature provides a generic connection/retry message; it does not
  download articles or make the full site work offline. Reconnect and retry.
- [ ] Confirm private `/admin` pages, API responses, and Next.js navigation data
  are not cached by the service worker. Do not include owner administration as a
  public store feature or expose owner credentials to testers.

## Privacy and Data safety: unresolved owner facts

The current site includes these integrations:

| Behavior | Repository evidence |
| --- | --- |
| Global Vercel Web Analytics and Speed Insights | `app/layout.tsx` |
| Embedded Substack newsletter on the writing index and articles | `components/NewsletterForm.tsx`, `app/writing/` |
| Remote badge image from websitelaunches.com | `components/Footer.tsx` |
| Remote code-highlighting script from cdnjs.cloudflare.com | `components/SyntaxHighlighter.tsx` |
| External free/paid Calendly bookings | `app/contact/page.tsx` |
| External digital-model Marketplace | `components/Navbar.tsx` |
| Private owner login with an eight-hour HttpOnly session cookie | `app/api/admin/session/route.ts`, `lib/admin-auth.ts` |

- [ ] Update the privacy policy to describe the actual website and Android app.
  The existing page is dated May 5, 2025 and omits the Substack embed and remote
  resources above. Verify its retention, deletion, and service-provider claims;
  do not invent a retention period or promise unimplemented deletion behavior.
- [ ] Review the actual Vercel, Substack, booking, hosting, and Marketplace data
  practices and configuration. Confirm what is collected, for which purposes,
  whether it is optional, how it is retained/deleted, and whether each transfer
  qualifies as sharing under Google's definitions.
- [ ] Complete Data safety for the final app and its controlled web content.
  "Anonymous analytics" and a small Android wrapper do not establish that no
  data is collected. Third-party behavior must be assessed too.
- [ ] Confirm publisher identity, public contact information, intended countries,
  target audience, content rating, advertising/sponsorship, and app-access
  answers. Public portfolio content is browseable without an account; external
  services and owner administration have separate access behavior.

## Purchases and external payment links

The navbar links to a separate LoRA Marketplace that advertises paid downloadable
models and custom-model requests involving uploaded photos. Contact includes a
paid Calendly session link. The existing privacy/terms pages mention Stripe;
they do not establish the current behavior of every linked checkout.

- [ ] Resolve the Marketplace's ownership, account/photo handling, purchase flow,
  and applicable Google Play payment requirements before production submission.
  Opening an external website does not by itself exempt a digital purchase or a
  link leading to an alternative payment method.
- [ ] Confirm whether paid consulting is a service between two individuals and
  whether recordings, replay access, or reusable digital content are included.
  These facts affect the applicable payment-policy exception.
- [ ] Confirm any paid newsletter tiers, ads, sponsorships, or other monetization.
  Do not prefill "no purchases," "no ads," or a payment-program exemption from
  the source inspection alone.

## Store and release steps

- [ ] Use the verified Play Console developer account and complete its account
  verification and device-verification tasks where applicable.
- [ ] Review the listing draft against the shipped build. Do not advertise native
  AI tools merely because portfolio pages describe those projects.
- [ ] Capture screenshots from the actual Android release. Supply the icon,
  feature graphic, and required phone screenshots in the formats and dimensions
  requested by Play Console. Do not use the user's home-screen photo as a store
  screenshot or include personal data in release assets.
- [ ] Complete the store listing, privacy link, app-content questionnaires,
  reviewer access instructions, pricing, countries, and applicable declarations.
- [ ] Run internal testing and any closed-test/production-access process required
  for this developer account. Uploading an internal build is not a production
  release.
- [ ] Submit for review only after the unresolved facts are answered. Record the
  actual review and rollout status; call the app published only when Play serves
  the intended release to its intended audience.

## Official references

- [Create and set up an app](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en)
- [Data safety guidance](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
- [Payments policy](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en)
- [Payments policy exceptions and examples](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en)
- [Testing requirements for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [Trusted Web Activity guide](https://developer.android.com/develop/ui/views/layout/webapps/guide-trusted-web-activities-version2)
- [Vercel Web Analytics privacy](https://vercel.com/docs/analytics/privacy-policy)
- [Vercel Speed Insights privacy](https://vercel.com/docs/speed-insights/privacy-policy)
