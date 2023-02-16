import { CapacitorConfig } from '@capacitor/cli';

//import * as frconfig2 from './config'
//console.log(frconfig2.GOOGLE_CLIENT_ID)

const frconfig = {  // TODO
  GOOGLE_CLIENT_ID: '423761283916-1rpa8120tpudgv4nf44cpmlf8slqbf4f.apps.googleusercontent.com'  // OK as serverClientId - SERVER_CLIENT_ID
}

const AndroidKeyStorePath = process.env['FREEGLE_NUXT3_KEYSTORE_PATH']
if( typeof AndroidKeyStorePath!=="string") throw "process.env.FREEGLE_NUXT3_KEYSTORE_PATH not set"
const AndroidKeyStorePassword = process.env['FREEGLE_NUXT3_KEYSTORE_PASSWORD']
if( typeof AndroidKeyStorePassword!=="string") throw "process.env.FREEGLE_NUXT3_KEYSTORE_PASSWORD not set"
const AndroidKeyStoreAlias = process.env['FREEGLE_NUXT3_KEYSTORE_ALIAS']
if( typeof AndroidKeyStoreAlias!=="string") throw "process.env.FREEGLE_NUXT3_KEYSTORE_ALIAS not set"
const AndroidKeyAliasPassword = process.env['FREEGLE_NUXT3_KEYALIAS_PASSWORD']
if( typeof AndroidKeyAliasPassword!=="string") throw "process.env.FREEGLE_NUXT3_KEYALIAS_PASSWORD not set"

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
    buildOptions: {
      "keystorePath": AndroidKeyStorePath,
      "keystorePassword": AndroidKeyStorePassword,
      "keystoreAlias": AndroidKeyStoreAlias,
      "keystoreAliasPassword": AndroidKeyAliasPassword,
      "releaseType": "APK",
    }
  },
  ios:{
    includePlugins: [ 
    "@capacitor/app-launcher",
    "@capacitor/device",
    "@capacitor/push-notifications",
    "@capacitor/status-bar",
    "@capawesome/capacitor-badge",
	"@codetrix-studio/capacitor-google-auth",
    "@capacitor-community/apple-sign-in"]
  },
  plugins: {
    PushNotifications: {
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
    },
  },
};

export default config;
