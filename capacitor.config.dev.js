// Development app configuration for Freegle Dev
// This builds a separate "Freegle Dev" app that can coexist with the production app
// and connects to a local development server via adb reverse port forwarding
//
// SETUP REQUIRED: Connect phone via USB and run:
//   adb reverse tcp:3004 tcp:3004
//
// Then start the freegle-dev-live container from the status page.
// Tap the refresh icon after making code changes (HMR not supported in WebView).

/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'org.ilovefreegle.dev', // Different ID so both apps can be installed
  appName: 'Freegle Dev',
  webDir: 'dev-app', // Minimal connection screen, not full Nuxt build
  bundledWebRuntime: false,
  zoomEnabled: true,

  // Server URL uses localhost - adb reverse forwards to dev machine
  // Run: adb reverse tcp:3004 tcp:3004
  server: {
    url: 'http://localhost:3004',
    // Use HTTP scheme to allow mixed content requests to dev servers
    androidScheme: 'http',
    // Allow cleartext HTTP for local dev servers
    cleartext: true,
    // Allow navigation to any local network address for live reload
    allowNavigation: ['*'],
  },

  cordova: {
    preferences: {
      CameraUsesGeolocation: 'true',
      AndroidLaunchMode: 'singleTask',
    },
  },

  android: {
    // Allow HTTP connections to dev servers
    allowMixedContent: true,
    includePlugins: [
      'cordova-plugin-calendar',
      '@capacitor-community/stripe',
      '@capacitor/app-launcher',
      '@capacitor/browser',
      '@capacitor/device',
      '@capacitor/network',
      '@freegle/capacitor-push-notifications-cap7',
      '@capawesome/capacitor-badge',
      '@capgo/capacitor-social-login',
      '@capacitor/status-bar',
      '@capacitor/camera',
      '@capacitor/share',
      '@capacitor/app',
      '@capacitor/screen-orientation',
    ],
    // Debug build - no signing required
    buildOptions: {
      releaseType: 'APK',
    },
  },

  ios: {
    scheme: 'App',
    contentInset: 'automatic',
    includePlugins: [
      'cordova-plugin-calendar',
      '@capacitor-community/stripe',
      '@capacitor/app-launcher',
      '@capacitor/browser',
      '@capacitor/device',
      '@capacitor/network',
      '@freegle/capacitor-push-notifications-cap7',
      '@capawesome/capacitor-badge',
      '@capacitor-community/apple-sign-in',
      '@capgo/capacitor-social-login',
      '@capacitor/status-bar',
      '@capacitor/camera',
      '@capacitor/share',
      '@capacitor/app',
      '@capacitor/screen-orientation',
    ],
  },

  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#FF5722', // Orange tint to distinguish from production
    },
    PushNotifications: {
      presentationOptions: ['badge', 'alert'],
    },
    Badge: {
      persist: true,
      autoClear: false,
    },
  },
}

module.exports = config
