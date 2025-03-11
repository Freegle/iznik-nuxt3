import { CapacitorConfig } from '@capacitor/cli';

// App-specific tests
// - Status bar shows correctly on A15, pre-A15 and iOS - AOK iOK 11/3/25
// - Camera: take photo and select one or more photos - AOK iOK 11/3/25
// - Yahoo: login - AOK iOK 11/3/25
// - Google: login - capacitor-social-login - OK 11/3/25
// - Facebook: login - capacitor-social-login - OK 11/3/25
// - Apple: login - iOK 11/3/25
// - Stripe payment
// - Push notifications - OK 11/3/25
// - Home screen badge count 
// - Share
// - Deep links = AOK 11/3/25
// - Android pinch zoom
// - Set iOS window.open
// - Get device info
// - Add to calendar

const frconfig = {  // TODO
  GOOGLE_CLIENT_ID: '423761283916-1rpa8120tpudgv4nf44cpmlf8slqbf4f.apps.googleusercontent.com',  // OK as serverClientId - SERVER_CLIENT_ID
  GOOGLE_IOS_CLIENT_ID: '423761283916-2kavl4pp132cmjormmifomo2r8hhta52.apps.googleusercontent.com'
}

const AndroidKeyStorePath = process.env['FREEGLE_NUXT3_KEYSTORE_PATH']
if (typeof AndroidKeyStorePath !== "string") throw "process.env.FREEGLE_NUXT3_KEYSTORE_PATH not set"
const AndroidKeyStorePassword = process.env['FREEGLE_NUXT3_KEYSTORE_PASSWORD']
if (typeof AndroidKeyStorePassword !== "string") throw "process.env.FREEGLE_NUXT3_KEYSTORE_PASSWORD not set"
const AndroidKeyStoreAlias = process.env['FREEGLE_NUXT3_KEYSTORE_ALIAS']
if (typeof AndroidKeyStoreAlias !== "string") throw "process.env.FREEGLE_NUXT3_KEYSTORE_ALIAS not set"
const AndroidKeyAliasPassword = process.env['FREEGLE_NUXT3_KEYALIAS_PASSWORD']
if (typeof AndroidKeyAliasPassword !== "string") throw "process.env.FREEGLE_NUXT3_KEYALIAS_PASSWORD not set"

const config: CapacitorConfig = {
  appId: 'org.ilovefreegle.direct',  // Fix back to .direct
  appName: 'Freegle',
  webDir: '.output/public',
  bundledWebRuntime: false,
  zoomEnabled: true,
  cordova: {
    "preferences": { // Get from iznik-nuxt/mobile/freegle/android/config.xml and package.json
      "CameraUsesGeolocation": "true",
      AndroidLaunchMode: "singleTask"
    }
  },
  server: {
    // hostname: 'ilovefreegle.org', localhost by default
    //hostname: 'www.ilovefreegle.org', // localhost by default
    androidScheme: "http" // https by default but keep as http for backwards compatibility
    //androidScheme: "https" // https by default but keep as http for backwards compatibility
  },
  android: {
    includePlugins: [
      "cordova-plugin-calendar", // C6 https://github.com/uzurv/Calendar-PhoneGap-Plugin-ios-17-support
      "cordova-plugin-inappbrowser", // C7 OK Yahoo
      "@capacitor-community/stripe",
      "@capacitor/app-launcher", // C7 OK eg donate
      "@capacitor/browser",
      "@capacitor/device", // C6 OK
      "@capacitor/network",
      // "@capacitor/push-notifications",
      // "@freegle/capacitor-push-notifications-cap6", // 2024-08
      "@freegle/capacitor-push-notifications-cap7", // 2025-03
      "@capawesome/capacitor-badge",
      //"@capacitor-community/facebook-login", // C6 OK
      //"@whiteguru/capacitor-plugin-facebook-login", // C6
      // "@codetrix-studio/capacitor-google-auth", // C6 on github repo OK
      "@capgo/capacitor-social-login", // C7
      "@capacitor/status-bar", // C7 OK
      "@capacitor/camera", // C7 OK
      "@capacitor/share",
      "@capacitor/app",
    ],
    buildOptions: { // new creds which are not used. unsigned version needs signed with FREEGLE_KEYSTORE and FREEGLE_KEYSTORE_PASSWORD
      "keystorePath": AndroidKeyStorePath,
      "keystorePassword": AndroidKeyStorePassword,
      "keystoreAlias": AndroidKeyStoreAlias,
      "keystoreAliasPassword": AndroidKeyAliasPassword,
      "releaseType": "APK",
    }
  },
  ios: {
  	scheme: 'App', // Freegle
    contentInset: 'automatic',
    includePlugins: [
      "cordova-plugin-calendar", // iOS 17: https://github.com/uzurv/Calendar-PhoneGap-Plugin-ios-17-support
      "cordova-plugin-inappbrowser",
      "@capacitor-community/stripe",
      "@capacitor/app-launcher",
      "@capacitor/browser",
      "@capacitor/device",
      "@capacitor/network",
      //"@capacitor/push-notifications",
      //"@freegle/capacitor-push-notifications-cap6", // 2024-08
      "@freegle/capacitor-push-notifications-cap7", // 2025-03
      "@capawesome/capacitor-badge",
      //"@capacitor-community/facebook-login", // C6: broken: limited login
      //"@whiteguru/capacitor-plugin-facebook-login", // C6
      "@capacitor-community/apple-sign-in", // C6 OK
      // "@codetrix-studio/capacitor-google-auth", // C6 on github repo OK
      "@capgo/capacitor-social-login", // C7
      "@capacitor/status-bar",
      "@capacitor/camera",
      "@capacitor/share",
      "@capacitor/app",
    ] 
  },
  plugins: {
    StatusBar: { 
      // android\app\src\main\res\values\styles.xml
      // Add this twice: <item name="android:windowOptOutEdgeToEdgeEnforcement">true</item>
      overlaysWebView: false,
      "backgroundColor": "#33880800" // Nominally green but completely transparent
    },
    PushNotifications: {
      //presentationOptions: ["badge", "sound", "alert"],
      presentationOptions: ["badge", "alert"],
    },
    Badge: {
      "persist": true,
      "autoClear": false
    },
    /* "GoogleAuth": { // TODOTODO
      "scopes": ["profile", "email"],
      "serverClientId": frconfig.GOOGLE_CLIENT_ID,
      "forceCodeForRefreshToken": true,
      "androidClientId": frconfig.GOOGLE_CLIENT_ID,
      "iosClientId": frconfig.GOOGLE_IOS_CLIENT_ID,
    },*/
  },
};

export default config;
