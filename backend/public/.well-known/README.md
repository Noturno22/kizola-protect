# Universal Links & App Links Configuration

This directory contains the configuration files that enable deep linking into the Kizola Protect app from the web.

## Files

| File | Purpose |
|------|---------|
| `apple-app-site-association` | iOS Universal Links config — associates the domain with the iOS app |
| `assetlinks.json` | Android App Links config — verifies app ownership of the domain |

## Serving URLs

Both files must be publicly accessible at these exact URLs:

- **iOS**: `https://kizola.app/.well-known/apple-app-site-association`
- **Android**: `https://kizola.app/.well-known/assetlinks.json`

## Content-Type Requirements

- `apple-app-site-association` must be served with **`Content-Type: application/json`** or **`Content-Type: application/pkcs7-mime`** (Apple prefers `application/json`)
- `assetlinks.json` must be served with **`Content-Type: application/json`**

## Placeholders to Replace

Before going live, update:

### 1. Apple Team ID (`apple-app-site-association`)

Replace `TEAMID` with your actual Apple Developer Team ID:

```
"appID": "TEAMID.app.luar.6xeu64ff9auaiakubrvpo"
```

→ Becomes: `"appID": "ABCDE12345.app.luar.6xeu64ff9auaiakubrvpo"`

You can find your Team ID in the [Apple Developer Portal](https://developer.apple.com/account/#/membership/) under "Membership" > "Team ID".

### 2. SHA256 Certificate Fingerprint (`assetlinks.json`)

Replace `REPLACE_WITH_YOUR_SHA256_FINGERPRINT` with your Android app's signing certificate fingerprint:

```bash
# From your keystore
keytool -list -v -keystore your-release-key.keystore -alias your-alias | grep "SHA256"

# From the Play Console (if using Play App Signing)
# Go to Release > Setup > App Integrity, copy the SHA-256 from "App signing key certificate"
```

## Verification

### iOS (Universal Links)

Use Apple's validation tool:

```bash
curl -v https://kizola.app/.well-known/apple-app-site-association
```

Or use the [Apple App Site Association validator](https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/UniversalLinks.html).

### Android (App Links)

Use the [Statement List Generator & Tester](https://developers.google.com/digital-asset-links/tools/generator) or:

```bash
curl -v https://kizola.app/.well-known/assetlinks.json
```

## App Configuration (for reference)

These files correspond to the following app configuration in `app.json`:

- **iOS Bundle ID**: `app.luar.6xeu64ff9auaiakubrvpo`
- **Android Package**: `com.kizolaprotect.app`
- **Associated Domains**: `applinks:kizola.app`, `applinks:www.kizola.app`
- **expo-router Origin**: `https://kizola.app`
- **URL Scheme**: `kizola://`
