# Freegle Direct Mobile App

This document describes the mobile app version of Freegle, which is built using Capacitor to create native Android and iOS apps from the same Nuxt3 codebase.

## Overview

The mobile app is managed in the `app-ci-fd` branch (based on the original `app` branch) and contains extensive modifications to support native mobile functionality. The app shares most of the Vue components and business logic with the web version but uses a different build configuration and includes native platform code.

## App Branch vs Master Branch

The `app-ci-fd` branch (based on the `app` branch) is a **parallel mobile app version** that differs from `master` in several key ways:

### Build Configuration Differences

- **SSR Disabled**: Uses Static Site Generation instead of Server-Side Rendering
- **Build Target**: `static` instead of `server`
- **Environment Flag**: `ISAPP=true` to detect mobile app context
- **No Docker**: Mobile apps don't use the Docker-based infrastructure

### Statistics

- **592 files changed** from master
- **22,115 insertions**
- **48,890 deletions**
- **462+ commits** ahead of master (as of last analysis)

---

## Core Mobile Infrastructure

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

---

## Mobile-Specific Features

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

---

## Mobile Store (`stores/mobile.js`)

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

---

## UI/UX Adjustments

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

---

## Dependencies

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

---

## Version Management

### Android (Automated via CircleCI)

**Version Code**: Auto-incremented by CircleCI
- Queries Google Play Console production track for latest version
- Automatically increments by 1 for each build
- No manual intervention needed

**Version Name**: Manually updated in `VERSION.txt`
- Location: `VERSION.txt` in repository root
- Example: `3.2.0`
- Update this file to change the user-facing version

**Fallback**: If Google Play API is unavailable, defaults to version code `1297`

### iOS (Manual)

Version must be updated in `ios/App/App.xcodeproj/project.pbxproj`:

```
CURRENT_PROJECT_VERSION = 1200;      // Build number
MARKETING_VERSION = 3.2.0;           // User-facing version
```

### Config Version

Also update in `config.js` for runtime version checks:

```javascript
MOBILE_VERSION: '3.2.0'
```

---

## Environment Variables

### Required for CircleCI Android Builds

```bash
# Android Signing (CircleCI)
ANDROID_KEYSTORE_BASE64=...          # Base64-encoded keystore file
ANDROID_KEYSTORE_PASSWORD=...        # Keystore password
ANDROID_KEY_ALIAS=...                # Key alias (e.g., "Freegle Ltd Chris")
ANDROID_KEY_PASSWORD=...             # Key password

# Google Play API (CircleCI)
GOOGLE_PLAY_JSON_KEY=...             # Base64-encoded service account JSON

# Firebase Configuration (CircleCI)
GOOGLE_SERVICES_JSON_BASE64=...      # Base64-encoded google-services.json

# Sentry Error Tracking (CircleCI)
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
   ```bash
   # Encode keystore
   base64 -w 0 your-keystore.jks > keystore_base64.txt

   # Encode Google Play JSON key
   base64 -w 0 google-play-api-key.json > play_key_base64.txt

   # Encode Firebase google-services.json
   base64 -w 0 android/app/google-services.json > google_services_base64.txt
   ```

**Note:** The `google-services.json` file is required for Firebase/Push Notifications to work. Download it from [Firebase Console](https://console.firebase.google.com/) → Project Settings → Your Android app → Download google-services.json

**Note:** `SENTRY_DSN_APP_FD` is optional but recommended for error tracking in the mobile app. If not set, the app will use the default Sentry DSN from `config.js`. Setting a separate DSN for the app prevents conflicts with other pipelines. Get your Sentry DSN from [Sentry](https://sentry.io/) → Project Settings → Client Keys (DSN).

### Verifying GOOGLE_PLAY_JSON_KEY

The `GOOGLE_PLAY_JSON_KEY` environment variable is **CRITICAL** for:
- Auto-incrementing version names and codes from Google Play Console
- Uploading builds to Google Play Internal Testing

**Status**: ✅ Properly configured and working (as of build #596)

**Build Behavior**:
- The build will **FAIL** if `GOOGLE_PLAY_JSON_KEY` is not set, empty, or invalid
- The build will **FAIL** if it cannot fetch version information from Google Play API
- No fallback to VERSION.txt - version must always be auto-incremented from Play Console

**Debug Output**: The decode step now includes extensive validation:
- ✅ Environment variable is set
- ✅ File created successfully with valid size
- ✅ Valid JSON structure
- 📧 Service account email (for debugging)

**Verification**: Check recent CircleCI builds at https://app.circleci.com/pipelines/github/Freegle/iznik-nuxt3?branch=app-ci-fd
- Look for "✅ Google Play API key file validated" in decode step
- Look for "📊 Using Play Console internal version code" in deploy step
- Look for "✅ Successfully uploaded to Google Play Internal Testing!" at end

---

## Build Process

### CircleCI Automated Builds (Android)

**Triggered on**: Pushes to `app-ci-fd` branch

**Build Steps**:
1. Install Node.js dependencies
2. Build Nuxt app with `npm run generate` (static site)
3. Decode and place Firebase `google-services.json` from environment variable
4. Sync Capacitor to Android project
5. Query Google Play Console for latest version code and version name
6. Build signed AAB (Android App Bundle) with auto-incremented version
7. Build signed APK for direct installation
8. Upload AAB to Google Play Internal Testing track
9. Store AAB and APK as CircleCI artifacts

**Artifacts**:
- `android-bundle/app-release.aab` - For Play Store
- `android-apk/app-release.apk` - For direct installation/testing

**Download artifacts**: https://app.circleci.com/pipelines/github/Freegle/iznik-nuxt3?branch=app-ci-fd

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

---

## Testing

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

---

## Removed/Disabled for Mobile

To reduce app size and complexity:

- **CircleCI config**: Different deployment process for mobile
- **Playwright tests**: Not applicable for native apps
- **Docker files**: Mobile apps don't use Docker
- **ModTools folder**: Removed to reduce app file size
- **Some councils data**: Reduced to minimize app size
- **Prebid ads**: Simplified ad system for mobile

---

## Known Issues & Workarounds

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

---

## Deployment

### Android (Automated via CircleCI)

**Automatic Process**:
1. Push to `app-ci-fd` branch triggers CircleCI build
2. CircleCI builds and signs AAB with upload key
3. AAB automatically uploaded to Google Play Internal Testing track
4. APK available as artifact for manual testing

**Google Play Console Access**:
- Internal Testing: https://play.google.com/console → Your App → Testing → Internal testing
- Promote to Beta/Production via Play Console UI

**Play App Signing**:
- App is enrolled in Google Play App Signing
- Upload key (managed by CircleCI) signs AABs before upload
- App signing key (managed by Google) signs final APKs for users

**Manual Override**:
If needed, download AAB artifact from CircleCI and manually upload to Play Console

### iOS (Manual)

1. Build archive in Xcode
2. Upload to App Store Connect via Transporter
3. Deploy to TestFlight → Production

### Fastlane Lanes

Additional Fastlane lanes available:

```bash
# Promote from Internal to Beta
bundle exec fastlane android promote_beta

# Promote from Beta to Production
bundle exec fastlane android promote_production
```

---

## Maintenance

### Keeping Up with Master

The app-ci-fd branch should periodically merge from master to get new features:

```bash
git checkout app-ci-fd
git merge master
# Resolve conflicts, test thoroughly
git push origin app-ci-fd
```

### Capacitor Updates

When updating Capacitor major versions:

1. Update all `@capacitor/*` packages
2. Run `npx cap sync`
3. Review breaking changes in Capacitor release notes
4. Test all native features thoroughly
5. Update this README with any changes

---

## Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **App Release Plan**: `/plans/app-releases.md`
- **Freegle Push Plugin**: https://github.com/Freegle/capacitor-push-notifications
- **Google Play Console**: https://play.google.com/console
- **App Store Connect**: https://appstoreconnect.apple.com

---

## Support

For mobile app specific issues:

1. Check device info in app (Help → Copy app info)
2. Check Sentry for error reports with device context
3. Test on physical devices (simulators may behave differently)
4. Verify all environment variables are set correctly
5. Check native logs in Android Studio / Xcode

---

**Last Updated**: 2025-10-20
**Current Version**: 3.2.x (app-ci-fd branch)
**Capacitor Version**: 7.x
**CI/CD**: CircleCI with Fastlane (Android automated)
