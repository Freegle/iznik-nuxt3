import { CapacitorConfig } from '@capacitor/cli';

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
      "cordova-plugin-inappbrowser", // C6 OK
      "@capacitor-community/stripe",
      "@capacitor/app-launcher", // C6 OK
      "@capacitor/browser",
      "@capacitor/device", // C6 OK
      "@capacitor/network",
      "@freegle/capacitor-push-notifications-cap6", // 2024-08
      // "@capacitor/push-notifications",
      "@capawesome/capacitor-badge",
      //"@capacitor-community/facebook-login", // C6 OK
      "@whiteguru/capacitor-plugin-facebook-login", // C6
      "@codetrix-studio/capacitor-google-auth", // C6 on github repo OK
      "@capacitor/camera",
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
      "@freegle/capacitor-push-notifications-cap6", // 2024-08
      "@capawesome/capacitor-badge",
      //"@capacitor-community/facebook-login", // C6: broken: limited login
      "@whiteguru/capacitor-plugin-facebook-login", // C6
      "@capacitor-community/apple-sign-in", // C6 OK
      "@codetrix-studio/capacitor-google-auth", // C6 on github repo OK
      "@capacitor/camera",
      "@capacitor/share",
      "@capacitor/app",
    ] 
  },
  plugins: {
    PushNotifications: {
      //presentationOptions: ["badge", "sound", "alert"],
      presentationOptions: ["badge", "alert"],
    },
    Badge: {
      "persist": true,
      "autoClear": false
    },
    "GoogleAuth": {
      "scopes": ["profile", "email"],
      "serverClientId": frconfig.GOOGLE_CLIENT_ID,
      "forceCodeForRefreshToken": true,
      "androidClientId": frconfig.GOOGLE_CLIENT_ID,
      "iosClientId": frconfig.GOOGLE_IOS_CLIENT_ID,
    },
  },
};

export default config;
