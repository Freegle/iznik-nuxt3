# Freegle Direct Mobile App

This document describes the mobile app version of Freegle, which is built using Capacitor to create native Android and iOS apps from the same Nuxt3 codebase.

---

## ✅ iOS and Android Automated

**Both iOS and Android releases are fully automated via CircleCI.** The CI/CD pipeline builds, version manages, and deploys both platforms in parallel using a shared version number to ensure consistency.

---

## Overview

The mobile app is built from the `production` branch (same as the web app) and includes native Android and iOS platform code. The app shares all Vue components and business logic with the web version but uses a different build configuration controlled by the `ISAPP` environment variable.

<details>
<summary><h2>Mobile App vs Web App</h2></summary>

Understanding the differences between mobile and web builds helps when debugging platform-specific issues.

The mobile and web apps are built from the **same codebase** (`production` branch) with build-time differences:

### Build Configuration Differences

- **SSR Disabled**: Mobile uses Static Site Generation instead of Server-Side Rendering
- **Build Target**: `static` (mobile) instead of `server` (web)
- **Environment Flag**: `ISAPP=true` to detect mobile app context
- **Build Pipeline**: CircleCI (mobile) vs Netlify (web)
- **Deploy Trigger**: Both deploy from `production` branch after tests pass on `master`

### Unified Codebase Benefits

- **Single Source of Truth**: All code in one place, no branch divergence
- **Automatic Sync**: Fixes automatically apply to both platforms
- **Consistent Testing**: Same tests validate both web and mobile code
- **Simplified Maintenance**: No need to manually sync branches

</details>

---

<details>
<summary><h2>Core Mobile Infrastructure</h2></summary>

The app uses Capacitor to bridge web code with native device features. This section covers the core configuration and project structure.

### Capacitor Framework

The app uses Capacitor 7 to bridge web code with native functionality:

- **App ID**: `org.ilovefreegle.direct`
- **App Name**: Freegle
- **Config File**: `capacitor.config.ts`
- **Web Directory**: `.output/public` (from Nuxt static build)

### Android Native Files

Located in `android/` directory:

- Complete Android Studio project structure
- Gradle build configuration (`android/app/build.gradle`)
- App icons, splash screens, and resources
- Android manifest with permissions (Camera, Storage, etc.)
- **Version Management**:
  - `versionCode`: Integer build number (e.g., 1202)
  - `versionName`: User-facing version string (e.g., "3.2.0")

### iOS Native Files

Located in `ios/` directory:

- Complete Xcode project structure
- Podfile for CocoaPods dependencies
- iOS-specific icons and assets
- GoogleService-Info.plist for Firebase integration
- **Version Management**:
  - `CURRENT_PROJECT_VERSION`: Build number (e.g., 1200)
  - `MARKETING_VERSION`: User-facing version (e.g., "3.1.9")

</details>

---

<details>
<summary><h2>Mobile-Specific Features</h2></summary>

These features use native device capabilities not available in web browsers.

### Authentication Methods

The mobile app supports multiple authentication methods with native implementations:

1. **Google Sign-In**
   - Package: `@codetrix-studio/capacitor-google-auth`
   - Platform-specific client IDs for Android and iOS
   - Native Google Sign-In UI

2. **Facebook Login**
   - Package: Custom Capacitor Social Login plugin
   - Support for "Limited Login" on iOS
   - Native Facebook authentication

3. **Apple Sign In**
   - iOS only
   - Native Sign in with Apple integration
   - Identity token handling

4. **Yahoo Login**
   - Uses in-app browser (Cordova InAppBrowser)
   - OAuth flow with native browser

### Push Notifications

Custom implementation using Freegle's fork:

- **Package**: `@freegle/capacitor-push-notifications-cap7`
- **Features**:
  - Foreground and background push handling
  - Badge count management on home screen icon
  - Deep linking from notifications
  - Multiple notification channels (Android)
  - Sound and vibration control
  - Notification permissions handling

### Camera & Photo Management

- **Native camera access** for taking photos
- **Photo picker** for selecting from gallery (single/multiple)
- **Photo size optimization**: Reduces to 800x800 to manage app size
- **Permissions**: Automatic camera permission requests
- Special handling for Android/iOS differences

### Payment Integration (Stripe)

Mobile-specific Stripe implementation:

- **Google Pay** (Android - live)
- **Apple Pay** (iOS)
- Native payment sheets
- Donation flows optimized for mobile
- Test mode support for development

### Device Features

1. **Deep Linking**
   - Custom URL scheme support
   - Handle app links from external sources
   - One-click unsubscribe links
   - Push notification routing

2. **Native Share**
   - Share posts using native share sheet
   - Platform-specific share UI

3. **Calendar Integration**
   - Add events to native calendar
   - Permission handling (iOS requires multiple permission types)
   - Uses Cordova Calendar plugin

4. **Pinch Zoom**
   - Enabled for Android
   - Native zoom gestures

5. **Device Information**
   - Collect device details for debugging
   - Persistent device ID
   - OS version tracking
   - Send to Sentry for error context

6. **App Updates**
   - Check for required updates
   - Check for available updates
   - Version comparison logic
   - Update prompts

7. **Rate App**
   - Native rating prompts
   - Timing logic to avoid annoying users
   - Platform-specific app store links

</details>

---

<details>
<summary><h2>Mobile Store (stores/mobile.js)</h2></summary>

All mobile-specific state and functionality is managed through a dedicated Pinia store.

A dedicated Pinia store handles all mobile-specific state and functionality:

### State

- `isApp`: Boolean flag for mobile app context
- `mobileVersion`: Current app version string
- `deviceinfo`: Device information object
- `devicePersistentId`: Unique device identifier
- `isiOS`: Platform detection
- `osVersion`: Operating system version
- `lastBadgeCount`: Last set notification badge count
- `appupdaterequired`: Flag for mandatory updates
- `appupdateavailable`: Flag for optional updates

### Actions

- `init()`: Initialize mobile app features
- `initApp()`: Set up device info, deep links, push notifications
- `getDeviceInfo()`: Collect device information
- `fixWindowOpen()`: Handle iOS window.open behavior
- `initDeepLinks()`: Set up deep link handling
- `initPushNotifications()`: Configure push notification system
- `checkForAppUpdate()`: Check for app updates
- `initWakeUpActions()`: Handle app resume/wake events

</details>

---

<details>
<summary><h2>UI/UX Adjustments</h2></summary>

Several components have mobile-specific behavior to optimize for touch screens and native capabilities.

### Modified Components

Several components have mobile-specific behavior:

1. **ExternalLink.vue**
   - Opens links in in-app browser instead of external browser
   - Uses Cordova InAppBrowser plugin

2. **AddToCalendar.vue**
   - Uses native calendar plugin
   - Handles iOS calendar permissions

3. **DraggableMap.vue**
   - Adjusted for mobile touch interactions

4. **EmailValidator.vue**
   - Mobile-optimized validation flow

5. **Chat Components**
   - Optimized for mobile screens
   - Native sharing integration

### Ads & Analytics

- **CookieYes**: App-specific version (`cookieyesapp.js`)
- **Google AdSense**: Modified for HTTPS enforcement
- **Matomo**: Mobile app tracking
- **Sentry**: Error reporting with device context
- **Ad Behavior**: Some ads disabled or modified for mobile

### Status Bar

- Android and iOS status bar handling
- Light/dark theme support
- Overlay configuration

</details>

---

<details>
<summary><h2>Dependencies</h2></summary>

The mobile app requires specific Capacitor plugins and dependencies for native functionality.

### Capacitor Core Packages

```json
{
  "@capacitor/core": "^7.x",
  "@capacitor/cli": "^7.x",
  "@capacitor/android": "^7.x",
  "@capacitor/ios": "^7.x"
}
```

### Capacitor Plugins

```json
{
  "@capacitor/app": "Native app lifecycle",
  "@capacitor/app-launcher": "Launch other apps",
  "@capacitor/camera": "Camera and photo picker",
  "@capacitor/device": "Device information",
  "@capacitor/share": "Native share sheet",
  "@capawesome/capacitor-badge": "App icon badge management"
}
```

### Custom Freegle Plugins

```json
{
  "@freegle/capacitor-push-notifications-cap7": "Push notifications"
}
```

### Social Login

```json
{
  "@codetrix-studio/capacitor-google-auth": "Google Sign-In"
}
```

### Cordova Plugins

```json
{
  "cordova-plugin-inappbrowser": "In-app browser for OAuth",
  "cordova-plugin-calendar": "Calendar integration"
}
```

</details>

---

<details>
<summary><h2>Version Management</h2></summary>

Version numbers are managed automatically by CircleCI to ensure consistency across platforms.

### Unified Version Management (Both Platforms)

**Shared Version Strategy**: Both iOS and Android use the **same version number** to ensure consistency across platforms. A single `increment-version` job runs before both builds, calculates the new version, and shares it via CircleCI workspace.

**Version Name** (e.g., "3.2.38"): Auto-incremented once, shared between platforms
- Stored in CircleCI environment variable `CURRENT_VERSION`
- CircleCI reads current version, increments patch version (3.2.37 → 3.2.38)
- Creates `.new_version` file in workspace with new version
- Both Android and iOS jobs read from this shared file
- **No race conditions** - version calculated once before parallel builds
- Build will FAIL if `CURRENT_VERSION` is not set or has invalid format (must be X.Y.Z)
- **No manual intervention needed** - fully automated

**Version Code/Build Number**: Platform-specific, auto-incremented from stores
- **Android**: Queries Google Play Console (all tracks) for latest version code
- **iOS**: Queries TestFlight for latest build number
- Automatically increments by 1 for each build
- **Minimum version code: 1272** (jumps from lower values if needed, then increments normally)
- Build will FAIL if store APIs are unavailable

### Android Version Management

**Version Code** (e.g., 1272): Auto-incremented from Google Play
- Queries Google Play Console across ALL tracks (internal, beta, production)
- Finds maximum version code across all tracks
- Automatically increments by 1 for each build (1272 → 1273)
- Minimum enforced: if calculated code < 1272, jumps to 1272
- Build will FAIL if Google Play API is unavailable or no releases exist
- **No manual intervention needed** - fully automated

**How Android build works**:
1. CircleCI `increment-version` job reads `CURRENT_VERSION` (e.g., "3.2.37")
2. Auto-increments patch version (3.2.37 → 3.2.38)
3. Saves to `.new_version` in workspace
4. Android job attaches workspace and reads `.new_version`
5. **Updates `config.js` MOBILE_VERSION** with new version (ensures Help page shows correct version)
6. Builds Nuxt app with updated version
7. Queries Google Play for latest version code (e.g., 1271)
8. Auto-increments version code (1271 → 1272, or enforces minimum 1272)
9. Builds AAB and APK with new version (3.2.38 / 1272)
10. Uploads to Google Play Beta Testing (Open Testing)

### iOS Version Management

**Build Number** (e.g., 1272): Auto-incremented from TestFlight
- Queries TestFlight for latest build number for this version
- Automatically increments by 1 for each build (1272 → 1273)
- Minimum enforced: if calculated build < 1272, jumps to 1272
- If no builds exist for this version, starts at 1272
- **No manual intervention needed** - fully automated

**How iOS build works**:
1. CircleCI `increment-version` job creates shared `.new_version` (e.g., "3.2.38")
2. iOS job attaches workspace and reads `.new_version`
3. **Updates `config.js` MOBILE_VERSION** with new version (same as Android)
4. Builds Nuxt app with updated version
5. Queries TestFlight for latest build number for version 3.2.38
6. Auto-increments build number (or enforces minimum 1272)
7. Sets version in Xcode project: `MARKETING_VERSION = 3.2.38`, `CURRENT_PROJECT_VERSION = 1272`
8. Builds IPA with new version (3.2.38 / 1272)
9. Uploads to TestFlight
10. **Auto-submit to App Store review after 24 hours** (scheduled job)

### Config Version

The `MOBILE_VERSION` in `config.js` is **automatically updated** by BOTH CircleCI jobs before each build:

```javascript
MOBILE_VERSION: '3.2.38'  // Auto-updated by both jobs from shared workspace version
```

This ensures the version shown in the app's Help page matches the actual build version on both platforms. **No manual updates needed** - the version is synchronized automatically during the build process.

### Initial Setup (one-time)

1. Go to CircleCI Project Settings → Environment Variables
2. Add `CURRENT_VERSION` = `3.2.37` (starting version)

**To manually bump major/minor version**:
- Update `CURRENT_VERSION` in CircleCI: `3.2.37` → `4.0.0` or `3.3.0`
- Next build will auto-increment from there: `4.0.0` → `4.0.1`
- Both platforms will use the same version number

</details>

---

<details>
<summary><h2>Environment Variables</h2></summary>

CircleCI builds require various environment variables for signing, store APIs, and service integrations.

### Required for CircleCI Builds

#### Android-Specific

```bash
# Android Signing
ANDROID_KEYSTORE_BASE64=...          # Base64-encoded keystore file
ANDROID_KEYSTORE_PASSWORD=...        # Keystore password
ANDROID_KEY_ALIAS=...                # Key alias (e.g., "Freegle Ltd Chris")
ANDROID_KEY_PASSWORD=...             # Key password

# Google Play API
GOOGLE_PLAY_JSON_KEY=...             # Base64-encoded service account JSON

# Firebase Configuration (Android)
GOOGLE_SERVICES_JSON_BASE64=...      # Base64-encoded google-services.json
```

#### iOS-Specific

```bash
# App Store Connect API
APP_STORE_CONNECT_API_KEY_KEY_ID=... # API Key ID from App Store Connect
APP_STORE_CONNECT_API_KEY_ISSUER_ID=...  # Issuer ID from App Store Connect
APP_STORE_CONNECT_API_KEY_KEY=...    # Base64-encoded .p8 private key file

# iOS Code Signing
IOS_DISTRIBUTION_CERT=...            # Base64-encoded iOS distribution certificate (.p12)
IOS_CERTIFICATE_PASSWORD=...         # Password for the .p12 certificate
IOS_PROVISIONING_PROFILE=...         # Base64-encoded provisioning profile (.mobileprovision)

# Keychain Configuration
KEYCHAIN_PASSWORD=...                # Password for temporary keychain (e.g., "circleci")
KEYCHAIN_NAME=...                    # Name of temporary keychain (e.g., "temp.keychain-db")

# Firebase Configuration (iOS)
GOOGLE_SERVICE_INFO_PLIST_BASE64=... # Base64-encoded GoogleService-Info.plist
```

#### Shared Configuration

```bash
# Sentry Error Tracking
SENTRY_DSN_APP_FD=...                # Sentry DSN for app error tracking (optional)

# App Configuration
ISAPP=true                           # Enable mobile app mode
APP_ENV=production                   # Build environment

# Google
GOOGLE_CLIENT_ID=...                 # Android client ID
GOOGLE_IOS_CLIENT_ID=...            # iOS client ID

# Facebook
FACEBOOK_APPID=...
FACEBOOK_CLIENTID=...

# Stripe
STRIPE_PUBLISHABLE_KEY=...

# Other
USE_COOKIES=false                    # Cookie behavior for mobile
```

### Setting Up CircleCI Environment Variables

1. Go to CircleCI Project Settings: https://app.circleci.com/settings/project/github/Freegle/iznik-nuxt3
2. Click "Environment Variables"
3. Add the required variables listed above
4. For base64 encoding:

   **Android:**
   ```bash
   # Encode Android keystore
   base64 -w 0 your-keystore.jks > keystore_base64.txt

   # Encode Google Play JSON key
   base64 -w 0 google-play-api-key.json > play_key_base64.txt

   # Encode Firebase google-services.json (Android)
   base64 -w 0 android/app/google-services.json > google_services_base64.txt
   ```

   **iOS:**
   ```bash
   # Encode iOS distribution certificate
   base64 -w 0 ios_distribution.p12 > ios_cert_base64.txt

   # Encode iOS provisioning profile
   base64 -w 0 ios_appstore.mobileprovision > ios_profile_base64.txt

   # Encode App Store Connect API key (.p8 file)
   base64 -w 0 AuthKey_XXXXXXXXXX.p8 > appstore_key_base64.txt

   # Encode Firebase GoogleService-Info.plist (iOS)
   base64 -w 0 ios/App/App/GoogleService-Info.plist > google_service_info_base64.txt
   ```

**Notes:**
- **Firebase files** (`google-services.json` for Android, `GoogleService-Info.plist` for iOS) are required for Firebase/Push Notifications. Download from [Firebase Console](https://console.firebase.google.com/) → Project Settings → Your app → Download config file
- **App Store Connect API Key**: Create at [App Store Connect](https://appstoreconnect.apple.com/) → Users and Access → Keys → App Store Connect API
- **iOS Certificates**: Export from Xcode or Apple Developer portal as .p12 with a password
- **SENTRY_DSN_APP_FD** is optional but recommended for error tracking. Get from [Sentry](https://sentry.io/) → Project Settings → Client Keys (DSN)

### Verifying GOOGLE_PLAY_JSON_KEY

The `GOOGLE_PLAY_JSON_KEY` environment variable is **CRITICAL** for:
- Auto-incrementing version codes from Google Play Console
- Uploading builds to Google Play Internal Testing

**Status**: ✅ Properly configured and working (as of build #596)

**Build Behavior**:
- The build will **FAIL** if `GOOGLE_PLAY_JSON_KEY` is not set, empty, or invalid
- The build will **FAIL** if it cannot fetch version CODES from Google Play API
- The build will **FAIL** if `CURRENT_VERSION` is not set or has invalid format
- Version NAME is auto-incremented from `CURRENT_VERSION` env var (3.2.29 → 3.2.30)
- Version CODE is auto-incremented from Google Play API (1300 → 1301)
- `CURRENT_VERSION` is updated via CircleCI API after successful build

**Debug Output**: The decode step includes extensive validation:
- ✅ Environment variable is set
- ✅ File created successfully with valid size
- ✅ Valid JSON structure
- 📧 Service account email (for debugging)

**Verification**: Check recent CircleCI builds at https://app.circleci.com/pipelines/github/Freegle/iznik-nuxt3?branch=production
- Look for "✅ Google Play API key file validated" in decode step
- Look for "📱 Current version from CircleCI: X.Y.Z" in deploy step
- Look for "📱 Auto-incremented version name: X.Y.Z → X.Y.(Z+1)" in deploy step
- Look for "📊 Using Play Console internal version code: XXXX" in deploy step
- Look for "📊 New version code: XXXX" in deploy step
- Look for "✅ Successfully uploaded to Google Play Internal Testing!" at end
- Look for "✅ Updated CURRENT_VERSION to X.Y.(Z+1)" in update version step

</details>

---

<details>
<summary><h2>Build Process</h2></summary>

Production builds are fully automated via CircleCI. Local builds are useful for testing.

### CircleCI Automated Builds (Both Platforms)

**Triggered on**: Pushes to `production` branch (after tests pass on `master`)

**Jobs Workflow**:

1. **increment-version** (runs first):
   - Reads `CURRENT_VERSION` from environment
   - Increments patch version (3.2.37 → 3.2.38)
   - Saves to `.new_version` in workspace

2. **build-android** and **build-ios** (run in parallel):
   - Both require `increment-version` to complete first
   - Both attach workspace to read shared `.new_version`

**Android Build Steps**:
1. Install Node.js 22 dependencies
2. Read version from workspace `.new_version` file
3. Update `config.js` MOBILE_VERSION with new version
4. Build Nuxt app with `npm run generate` (static site)
5. Decode and place Firebase `google-services.json`
6. Sync Capacitor to Android project
7. Query Google Play Console for latest version code (across all tracks)
8. Build signed AAB with auto-incremented version code (minimum 1272)
9. Build signed APK for direct installation
10. Upload AAB to Google Play Beta (Open Testing) track
11. Store AAB and APK as CircleCI artifacts

**iOS Build Steps**:
1. Install Node.js 22 (via nvm on macOS)
2. Read version from workspace `.new_version` file
3. Update `config.js` MOBILE_VERSION with new version
4. Build Nuxt app with `npm run generate` (static site)
5. Sync Capacitor to iOS project
6. Decode and place Firebase `GoogleService-Info.plist`
7. Install Fastlane and dependencies (Ruby gems)
8. Set up iOS certificates and provisioning profile
9. Query TestFlight for latest build number
10. Build IPA with auto-incremented build number (minimum 1272)
11. Upload to TestFlight
12. Store IPA as CircleCI artifact

**Artifacts**:
- **Android**: `android-bundle/app-release.aab`, `android-apk/app-release.apk`
- **iOS**: IPA file in artifacts

**Download artifacts**: https://app.circleci.com/pipelines/github/Freegle/iznik-nuxt3?branch=production

### Local Development

```bash
# Install dependencies
npm install

# Sync web code to native projects
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode
npx cap open ios
```

### Manual Production Build

```bash
# Build Nuxt app as static site
npm run build

# Sync to native projects
npx cap sync

# Build Android (via Android Studio or Gradle)
cd android
./gradlew bundleRelease

# Build iOS (via Xcode or xcodebuild)
cd ios/App
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release
```

</details>

---

<details>
<summary><h2>Freegle Dev App (Live Reload)</h2></summary>

A separate development app allows rapid iteration by loading code from your local dev server instead of bundled assets.

### Overview

The "Freegle Dev" app is a separate Android app that:
- Has a different package ID (`org.ilovefreegle.dev`) so it can coexist with the production app
- Connects to `freegle-app-dev.local` via mDNS (no IP address needed)
- Supports hot module reloading (HMR) for instant code updates
- Only needs rebuilding when Capacitor plugins change

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Phone                                                      │
│  ┌───────────────────┐  ┌───────────────────┐              │
│  │ Freegle           │  │ Freegle Dev       │              │
│  │ (Production)      │  │ (Development)     │              │
│  │                   │  │                   │              │
│  │ Bundled assets    │  │ Connects via      │              │
│  │ Works offline     │  │ mDNS hostname     │              │
│  └───────────────────┘  └─────────┬─────────┘              │
└───────────────────────────────────┼─────────────────────────┘
                                    │ HTTP (WiFi) + WebSocket (HMR)
                                    │ freegle-app-dev.local:3004
                                    │ freegle-app-dev.local:24678
                                    ▼
┌─────────────────────────────────────────────────────────────┐
│  Developer Machine                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ freegle-dev-live container                           │   │
│  │ Port 3004: Nuxt app server                          │   │
│  │ Port 24678: Vite HMR WebSocket                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  mDNS broadcast: freegle-app-dev.local                     │
└─────────────────────────────────────────────────────────────┘
```

### Setup

1. **Build the dev APK** (one-time or when Capacitor plugins change):
   - Trigger the `build-dev-app` job in CircleCI
   - Download `freegle-dev.apk` from artifacts
   - Install on your Android device (enable "Install from unknown sources")

2. **Start the dev-live container**:
   - Go to `http://status.localhost`
   - Click "Start" on the freegle-dev-live container (requires confirmation as it uses live APIs)

3. **Set up mDNS hostname broadcast** (Windows with Bonjour):
   ```cmd
   dns-sd -P "Freegle App Dev" _http._tcp local 3004 freegle-app-dev.local YOUR_IP
   ```
   Replace `YOUR_IP` with your LAN IP (e.g., `192.168.1.50`). Keep this window open.

4. **Set up port forwarding** (WSL users - run in PowerShell as Admin):
   ```powershell
   # Port forwarding
   netsh interface portproxy add v4tov4 listenport=3004 listenaddress=0.0.0.0 connectport=3004 connectaddress=127.0.0.1
   netsh interface portproxy add v4tov4 listenport=24678 listenaddress=0.0.0.0 connectport=24678 connectaddress=127.0.0.1

   # Firewall rules
   New-NetFirewallRule -DisplayName "WSL Freegle Dev App" -Direction Inbound -LocalPort 3004 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "WSL Freegle Dev HMR" -Direction Inbound -LocalPort 24678 -Protocol TCP -Action Allow
   ```

5. **Connect the app**:
   - Open Freegle Dev on your phone (must be on same WiFi network)
   - App automatically connects to `freegle-app-dev.local:3004`
   - If connection fails, check mDNS setup and port forwarding

6. **Develop**:
   - Make code changes → app hot reloads via HMR
   - No rebuild needed for Vue/JS/CSS changes
   - Only rebuild APK when Capacitor plugins change

### App Comparison

| Aspect | Freegle (Production) | Freegle Dev |
|--------|---------------------|-------------|
| **Package ID** | `org.ilovefreegle.direct` | `org.ilovefreegle.dev` |
| **App Name** | Freegle | Freegle Dev |
| **Icon** | Normal | Orange tint |
| **Assets** | Bundled | From dev server |
| **Connection** | N/A | mDNS auto-connect |
| **APIs** | Production | Production (live data!) |
| **Play Store** | Published | Never published |

### Network Requirements

- Phone and dev machine on same WiFi network
- mDNS broadcast running (`dns-sd` command)
- Port 3004 (app) and 24678 (HMR) accessible
- For WSL: port forwarding configured

### Troubleshooting

**Cannot resolve freegle-app-dev.local:**
- Ensure Bonjour is installed and `dns-sd` command is running
- Check phone is on same WiFi as dev machine
- Some corporate networks block mDNS - try a home network

**App loads but HMR not working:**
- Check port 24678 is forwarded and accessible
- Check firewall allows port 24678
- Check container logs for HMR errors

**Cannot connect to dev server:**
- Ensure freegle-dev-live container is running
- Check mDNS is broadcasting (should show in dns-sd output)
- Try pinging `freegle-app-dev.local` from another device

**Changes not appearing:**
- Nuxt dev server should auto-reload
- Try refreshing the app or reconnecting

</details>

---

<details>
<summary><h2>Testing</h2></summary>

Testing the mobile app requires checking native features that cannot be tested via browser automation.

### App-Specific Test Checklist

From `capacitor.config.ts` comments:

- [ ] Status bar shows correctly on Android pre-A15, A15+ and iOS
- [ ] Camera: take photo and select one or more photos
- [ ] Yahoo login works
- [ ] Google login works (Android & iOS)
- [ ] Facebook login works (Android & iOS)
- [ ] Apple login works (iOS only)
- [ ] Stripe payment flows work
- [ ] Push notifications received
- [ ] Home screen badge count updates
- [ ] Share functionality works
- [ ] Deep links open correctly
- [ ] Android pinch zoom works
- [ ] Add to calendar works
- [ ] Device info collected properly

### Testing Donations

Enable donation modal for testing:

```javascript
// In pages/myposts.vue:
showDonationAskModal.value = true
```

</details>

---

<details>
<summary><h2>Removed/Disabled for Mobile</h2></summary>

Some features are excluded from the mobile build to reduce app size and complexity.

To reduce app size and complexity:

- **CircleCI config**: Different deployment process for mobile
- **Playwright tests**: Not applicable for native apps
- **Docker files**: Mobile apps don't use Docker
- **ModTools folder**: Removed to reduce app file size
- **Some councils data**: Reduced to minimize app size
- **Prebid ads**: Simplified ad system for mobile

</details>

---

<details>
<summary><h2>Known Issues & Workarounds</h2></summary>

Common issues encountered during development and their solutions.

### npm Install Issues

If npm reinstall needed, comment out this line:
```
node_modules/@capacitor/cli/dist/android/run.js:40
// await common_1.runTask
```

### Android Manifest

Ensure camera permission is present:
```xml
<uses-permission android:name="android.permission.CAMERA" />
```

### Package Overrides

Some packages require specific versions for compatibility. Check `package.json` overrides section.

</details>

---

<details>
<summary><h2>Deployment</h2></summary>

Production releases are fully automated with scheduled promotions to app stores.

### Fully Automated Dual-Platform Deployment

Both iOS and Android are built and deployed in parallel with shared version numbers. The workflow ensures consistency across platforms.

**Build Workflow**:

1. **Version Increment Job** (runs first):
   - Reads `CURRENT_VERSION` environment variable (e.g., "3.2.37")
   - Auto-increments patch version (3.2.37 → 3.2.38)
   - Saves to workspace file `.new_version`
   - Both platform jobs read from this shared file

2. **Android and iOS Jobs** (run in parallel):
   - Both attach workspace to read shared version
   - Both update `config.js` MOBILE_VERSION with new version
   - Both build Nuxt app with identical version
   - Both query their respective stores for build numbers
   - Both build and upload to beta/testing tracks
   - **Artifacts stored** for both platforms

**Deployment Workflow**:

1. **Development**:
   - Code committed to `master` branch
   - Tests run automatically (Playwright, PHPUnit, Go tests)

2. **Production Merge**:
   - When tests pass, `master` is auto-merged to `production` branch
   - Only tested code reaches production

3. **Deployment Triggers** (from `production` branch):
   - **Web**: Netlify deploys web application
   - **Mobile**: CircleCI builds and deploys iOS/Android apps
   - Both platforms deploy from same tested code

2. **Build and Deploy (11:00-11:30 PM UTC)**:
   - **Android**: Uploads to Google Play Beta (Open Testing)
   - **iOS**: Uploads to TestFlight
   - Both use version X.Y.Z (shared) with platform-specific build numbers (minimum 1272)
   - Release notes: "Version X.Y.Z - Bug fixes and improvements"

3. **Auto-Promote/Submit (24 hours later)**:
   - **Android**: Auto-promotes Beta → Production (if not already promoted)
   - **iOS**: Auto-submits latest TestFlight build to App Store review (if not already submitted)
   - Only the LATEST build from last 24 hours is submitted/promoted

### Android-Specific

**Build Process**:
- Queries Google Play for max version code across all tracks
- Auto-increments version code (enforces minimum 1272)
- Builds AAB (for Play Store) and APK (for direct install)
- Uploads to Beta (Open Testing) track
- Auto-promotes to Production after 24 hours

**Google Play Console**:
- Beta Testing: https://play.google.com/console → Your App → Testing → Open testing
- Production: https://play.google.com/console → Your App → Production

**Play App Signing**:
- Enrolled in Google Play App Signing
- Upload key (CircleCI) signs AABs
- App signing key (Google) signs final APKs

**Artifacts**:
- `android-bundle/app-release.aab`
- `android-apk/app-release.apk`

### iOS-Specific

**Build Process**:
- Queries TestFlight for latest build number
- Auto-increments build number (enforces minimum 1272)
- Sets Xcode version: `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION`
- Builds IPA with manual code signing
- Uploads to TestFlight
- Auto-submits to App Store review after 24 hours (latest build only)

**App Store Connect**:
- TestFlight: https://appstoreconnect.apple.com → Your App → TestFlight
- App Store: https://appstoreconnect.apple.com → Your App → App Store

**Submission Notes**:
- **One submission per day is safe** - well within Apple's limits
- TestFlight has no daily submission issues
- App Store review typically takes 24 hours (90% of submissions)
- Auto-submit checks for blocking versions before submission
- Auto-submit will skip if another version is in review/approved
- If submission fails, check App Store Connect for versions blocking submission
- The auto_submit lane provides detailed error messages for troubleshooting

**Artifacts**:
- IPA file stored in CircleCI artifacts

### Manual Triggers

**Build Workflow:**
- Push to `production` branch: triggers full build workflow
- Rerun CircleCI workflow: rebuilds current commit

**Manual Promotion/Submission (via CircleCI):**
To manually trigger promotion/submission before the scheduled time:

1. Go to [CircleCI Pipelines](https://app.circleci.com/pipelines/github/Freegle/iznik-nuxt3?branch=production)
2. Click "Trigger Pipeline" (top right)
3. Select branch: `production`
4. Click "Add Parameters" (expand the parameters section)
5. Add parameter:
   - Name: `run_manual_promote`
   - Type: `boolean`
   - Value: `true`
6. Click "Trigger Pipeline"
7. The `manual-promote-submit` workflow will start immediately
8. Both `auto-promote-production` (Android) and `auto-submit-ios` will run in parallel

This allows you to promote/submit releases early without waiting for the midnight scheduled run, and without consuming CircleCI concurrency slots while waiting for approval.

**Alternative - Direct Fastlane:**
- Android: `bundle exec fastlane android auto_promote`
- iOS: `bundle exec fastlane ios auto_submit`
- Manual promotion/submission via store consoles (Google Play Console / App Store Connect)

### Timeline

```
Day 1, 11:00 PM: Build triggered (production merge or manual push)
Day 1, 11:30 PM: Builds complete
                 → Android uploaded to Beta (Open Testing)
                 → iOS uploaded to TestFlight

Day 2, 11:30 PM: Auto-promotion check (24 hours later)
                 → Android: Beta promoted to Production
                 → iOS: Latest build submitted to App Store review

Day 3-4:         iOS app review by Apple (typically 24 hours)
                 → iOS approved and available on App Store
```

### Fastlane Lanes

Available Fastlane lanes for manual operations:

**Android:**
```bash
# Build and deploy to Beta (automated in CI)
bundle exec fastlane android beta

# Promote from Beta to Production (automated in CI)
bundle exec fastlane android promote_production

# Auto-promote check (automated in CI, runs daily)
bundle exec fastlane android auto_promote
```

**iOS:**
```bash
# Build and deploy to TestFlight (automated in CI)
bundle exec fastlane ios beta

# Submit to App Store review (manual if needed)
bundle exec fastlane ios release

# Auto-submit latest build (automated in CI, runs daily)
bundle exec fastlane ios auto_submit
```

</details>

---

<details>
<summary><h2>Maintenance</h2></summary>

Guidelines for keeping the mobile app codebase up to date.

### Development Workflow

The production branch receives tested code automatically from master after tests pass. Manual merges are rarely needed, but if required:

```bash
git checkout production
git merge master  # Only merge after tests pass on master
# Resolve conflicts, test thoroughly
git push origin production
```

**Note**: The mobile app now builds from the same `production` branch as the web app. There is no longer a separate `app-ci-fd` branch.

### Capacitor Updates

When updating Capacitor major versions:

1. Update all `@capacitor/*` packages
2. Run `npx cap sync`
3. Review breaking changes in Capacitor release notes
4. Test all native features thoroughly
5. Update this README with any changes

</details>

---

<details>
<summary><h2>Resources</h2></summary>

Useful links for mobile app development.

- **Capacitor Docs**: https://capacitorjs.com/docs
- **App Release Plan**: `/plans/app-releases.md`
- **Freegle Push Plugin**: https://github.com/Freegle/capacitor-push-notifications
- **Google Play Console**: https://play.google.com/console
- **App Store Connect**: https://appstoreconnect.apple.com

</details>

---

<details>
<summary><h2>Support</h2></summary>

Steps for debugging mobile app issues.

For mobile app specific issues:

1. Check device info in app (Help → Copy app info)
2. Check Sentry for error reports with device context
3. Test on physical devices (simulators may behave differently)
4. Verify all environment variables are set correctly
5. Check native logs in Android Studio / Xcode

</details>

---

**Last Updated**: 2025-11-29
**Current Version**: 3.2.x (production branch)
**Capacitor Version**: 7.x
**CI/CD**: CircleCI with Fastlane (iOS and Android fully automated)
