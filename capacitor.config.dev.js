// Development app configuration for Freegle Dev
// This builds a separate "Freegle Dev" app that can coexist with the production app
// and connects to a local development server via mDNS hostname
//
// SETUP REQUIRED: Developer must broadcast 'freegle-app-dev.local' via mDNS
// On Windows with Bonjour: dns-sd -P "Freegle App Dev" _http._tcp local 3004 freegle-app-dev.local <YOUR_IP>
// Or install an mDNS responder that advertises this hostname

/** @type {import('@capacitor/cli').CapacitorConfig} */
const config = {
  appId: 'org.ilovefreegle.dev', // Different ID so both apps can be installed
  appName: 'Freegle Dev',
  webDir: 'dev-app', // Minimal connection screen, not full Nuxt build
  bundledWebRuntime: false,
  zoomEnabled: true,

  // Fixed server URL using mDNS hostname
  // Android resolves .local hostnames via mDNS (Bonjour)
  // Developer must broadcast this hostname from their machine
  server: {
    url: 'http://freegle-app-dev.local:3004',
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
