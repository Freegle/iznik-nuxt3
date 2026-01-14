import { CapacitorConfig } from '@capacitor/cli';

// App-specific tests
// - Status bar shows correctly on A15, pre-A15 and iOS - AOK iOK 11/3/25
// - Camera: take photo and select one or more photos - AOK iOK 11/3/25
// - Google: login - capacitor-social-login - AOK iOK 12/3/25
// - Facebook: login - capacitor-social-login - AOK iOK 11/3/25
// - Apple: login - iOK 11/3/25
// - Stripe payment - pages/myposts.vue#L215 - AOK iOK 12/3/25
// - Push notifications - AOK iOK 12/3/25
// - Home screen badge count - AOK iOK 12/3/25
// - Share - AOK iOK 12/3/25
// - Deep links = AOK iOK 11/3/25
// - Android pinch zoom - AOK 12/3/25
// - Set iOS window.open
// - Get device info
// - Add to calendar
//
// Test donations with pages/myposts.vue: showDonationAskModal.value = true

const AndroidKeyStorePath = process.env['FREEGLE_NUXT3_KEYSTORE_PATH']
if (typeof AndroidKeyStorePath !== "string") throw "process.env.FREEGLE_NUXT3_KEYSTORE_PATH not set"
const AndroidKeyStorePassword = process.env['FREEGLE_NUXT3_KEYSTORE_PASSWORD']
if (typeof AndroidKeyStorePassword !== "string") throw "process.env.FREEGLE_NUXT3_KEYSTORE_PASSWORD not set"
const AndroidKeyStoreAlias = process.env['FREEGLE_NUXT3_KEYSTORE_ALIAS']
if (typeof AndroidKeyStoreAlias !== "string") throw "process.env.FREEGLE_NUXT3_KEYSTORE_ALIAS not set"
const AndroidKeyAliasPassword = process.env['FREEGLE_NUXT3_KEYALIAS_PASSWORD']
if (typeof AndroidKeyAliasPassword !== "string") throw "process.env.FREEGLE_NUXT3_KEYALIAS_PASSWORD not set"

// eslint cannot parse this colon ie type definition
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
  server: { // SET BELOW FOR ANDROID
    //hostname: 'ilovefreegle.org', // localhost by default
    ////hostname: 'www.ilovefreegle.org', // localhost by default
    ////androidScheme: "http" // https by default but keep as http for backwards compatibility
    ////iosScheme: 'https', // https: cannot be used - becomes capacitor:
    //androidScheme: 'https' // https by default but keep as http for backwards compatibility
  },
  android: {
    includePlugins: [
      "cordova-plugin-calendar", // C6 https://github.com/uzurv/Calendar-PhoneGap-Plugin-ios-17-support
      "@capacitor-community/stripe",
      "@capacitor/app-launcher", // C7 OK eg donate
      "@capacitor/browser",
      "@capacitor/device", // C7 OK
      "@capacitor/network",
      // "@capacitor/push-notifications",
      "@freegle/capacitor-push-notifications-cap7", // C7 2025-03
      "@capawesome/capacitor-badge",
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
      "@capacitor-community/stripe",
      "@capacitor/app-launcher",
      "@capacitor/browser",
      "@capacitor/device",
      "@capacitor/network",
      //"@capacitor/push-notifications",
      "@freegle/capacitor-push-notifications-cap7", // 2025-03
      "@capawesome/capacitor-badge",
      "@capacitor-community/apple-sign-in", // C7 OK
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
      presentationOptions: ["badge", "sound", "alert"],
    },
    Badge: {
      "persist": true,
      "autoClear": false
    },
    //"CapacitorCookies": { // https://capacitorjs.com/docs/apis/cookies
    //  "enabled": true
    //}
  },
};

if( process.env['USE_COOKIES']==='True') { // Android
  console.log('SET CAPACITOR base to https://ilovefreegle.org')
  config.server.hostname = 'ilovefreegle.org'
  config.server.androidScheme = 'https'
} else { // iOS
  config.appId = 'org.ilovefreegle.iphone'
}

export default config;
