import { CapacitorConfig } from '@capacitor/cli';

//import * as frconfig2 from './config'
//console.log(frconfig2.GOOGLE_CLIENT_ID)

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
  cordova: {
    "preferences": { // Get from iznik-nuxt/mobile/freegle/android/config.xml and package.json
      "CameraUsesGeolocation": "true",
      AndroidLaunchMode: "singleTask"
      // cordova-plugin-facebook-connect
      // @havesource/cordova-plugin-push
      // cordova-plugin-google-signin
      // ionic-plugin-deeplinks
      // sentry-cordova
      // cordova-plugin-geolocation "GPS_REQUIRED": "false"
    }
  },
  android: {
    includePlugins: [
      "cordova-plugin-inappbrowser",
      "@capacitor/app-launcher",
      "@capacitor/browser",
      "@capacitor/device",
      "@capacitor/network",
      "@capacitor/push-notifications",
      "@capawesome/capacitor-badge",
      "@capacitor-community/facebook-login",
      "@codetrix-studio/capacitor-google-auth",
      //"@capacitor/freegle-nuxt3-fcm",
      "@capacitor-community/fcm",
      "@capacitor-firebase/messaging",
      "@capacitor/camera",
      "@capacitor/share",
      "@capacitor-community/contacts",
    ],
    buildOptions: {
      "keystorePath": AndroidKeyStorePath,
      "keystorePassword": AndroidKeyStorePassword,
      "keystoreAlias": AndroidKeyStoreAlias,
      "keystoreAliasPassword": AndroidKeyAliasPassword,
      "releaseType": "APK",
    }
  },
  ios: {
  	scheme: 'Freegle',
    contentInset: 'automatic',
    includePlugins: [
      "cordova-plugin-inappbrowser",
      "@capacitor/app-launcher",
      "@capacitor/browser",
      "@capacitor/device",
      "@capacitor/network",
      "@capacitor/push-notifications",
      "@capawesome/capacitor-badge",
      "@capacitor-community/facebook-login",
      "@capacitor-community/apple-sign-in",
      "@codetrix-studio/capacitor-google-auth",
      "@capacitor/camera",
      "@capacitor/share",
      "@capacitor-community/contacts",
    ] 
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    FirebaseMessaging: {
      presentationOptions: ["badge", "sound", "alert"],
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
