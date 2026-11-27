# chemacabeza.dev for Android

Android Trusted Web Activity for the existing https://chemacabeza.dev website,
generated with GoogleChromeLabs Bubblewrap 1.28.0. This directory is the Android
source project; its presence does not mean the app is published on Google Play.

| Setting | Value |
| --- | --- |
| App / launcher name | `chemacabeza.dev` |
| Package ID | `dev.chemacabeza.app` |
| Initial version | `1.0.0` / version code `1` |
| Minimum Android API | 24 (Android 7.0) |
| Compile / target API | 36 |
| Android Browser Helper | 2.8.0 |
| Launch URL | `https://chemacabeza.dev/` |

The app uses the website's existing icon and opens the live website through a
compatible browser. Unsupported browsers fall back to a Custom Tab. Articles
require an internet connection. After an online visit, a static connection
message is available for failed public document loads; private pages, APIs,
articles and user data are never stored by this offline worker.

## Build

Install Node.js 18 or newer, JDK 17, Android SDK Platform 36 and Build Tools
36.1.0. From this directory:

```sh
npm ci
npm run doctor
npm run build
```

Restore the existing private signing backup into `android/signing/` first, so
`signing/upload-key.jks` exists. The key alias is `chemacabeza-upload`. Bubblewrap
asks for the keystore and key passwords, or reads the standard
`BUBBLEWRAP_KEYSTORE_PASSWORD` and `BUBBLEWRAP_KEY_PASSWORD` environment variables.
Use a secret manager or a private local environment; never put passwords in
commands, committed files, build logs, or screenshots. `local.properties` is
machine-specific and ignored.

Successful builds produce:

- `app-release-signed.apk`: direct Android installation and device testing.
- `app-release-bundle.aab`: upload artifact for Google Play Console; it is not
  directly installable on a phone.

The project uses Google Maven and Maven Central. If regenerating from
`twa-manifest.json` with `npm run generate`, inspect the resulting diff:
Bubblewrap can overwrite generated Gradle files, including repository choices.
Preserve `mavenCentral()` in place of the template's retired `jcenter()` entries.
Increase the version code before uploading an update to an existing Play app.

## Signing and website verification

The local APK and upload bundle use a dedicated private key kept outside Git.
Its public SHA-256 certificate fingerprint is:

```text
EB:87:1D:1A:81:6A:BD:1C:3E:8C:83:C7:17:FB:AA:07:55:A5:75:A7:F5:25:D6:CD:73:C8:87:CE:89:37:AF:24
```

The corresponding Digital Asset Links statement lives at
`public/.well-known/assetlinks.json`. The production URL must return HTTP 200
with JSON and no redirect. When Play App Signing is configured, add the **actual
Play app signing certificate** fingerprint alongside this local APK fingerprint.
An upload certificate is not automatically the certificate used on users'
Play-installed apps. Never substitute a guessed or sample fingerprint.

Preserve the private signing backup securely. Do not replace the key for an
existing application, share the backup publicly, or commit the ignored signing
directory. A Play-generated signing key can make a Play install incompatible
with a direct APK signed by this local key; test each distribution separately.

## Release

See [PLAY_RELEASE.md](PLAY_RELEASE.md) for account, policy, signing, device
testing and store listing work that must be completed before publication. The
draft English listing is in `store-listing/en-US.txt`. Package availability must
be checked in the owner's Play Console before creating the permanent app record.

Official references:

- https://github.com/GoogleChromeLabs/bubblewrap/tree/main/packages/cli
- https://developer.android.com/training/app-links/configure-assetlinks
- https://support.google.com/googleplay/android-developer/answer/9859152
