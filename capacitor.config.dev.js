// Development app configuration for Freegle Dev
// This builds a separate "Freegle Dev" app that can coexist with the production app
// and connects to a local development server via QR code or manual URL entry

/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'org.ilovefreegle.dev', // Different ID so both apps can be installed
  appName: 'Freegle Dev',
  webDir: 'dev-app', // Minimal connection screen, not full Nuxt build
  bundledWebRuntime: false,
  zoomEnabled: true,

  // Server URL is set dynamically at runtime from saved preference
  // The DevConnectScreen component handles QR scanning and URL saving
  server: {
    // Use HTTP scheme to allow mixed content requests to dev servers
    androidScheme: 'http',
    // Allow cleartext HTTP for local dev servers
    cleartext: true,
    // Allow navigation to any local network address for live reload
    // This prevents window.location.href from opening the system browser
    allowNavigation: [
      'http://192.168.*',
      'http://10.*',
      'http://172.16.*',
      'http://172.17.*',
      'http://172.18.*',
      'http://172.19.*',
      'http://172.20.*',
      'http://172.21.*',
      'http://172.22.*',
      'http://172.23.*',
      'http://172.24.*',
      'http://172.25.*',
      'http://172.26.*',
      'http://172.27.*',
      'http://172.28.*',
      'http://172.29.*',
      'http://172.30.*',
      'http://172.31.*',
      'http://localhost:*',
    ],
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
