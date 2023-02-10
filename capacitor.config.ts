import { CapacitorConfig } from '@capacitor/cli';

//import * as frconfig2 from './config'
//console.log(frconfig2.GOOGLE_CLIENT_ID)

const frconfig = {  // TODO
  GOOGLE_CLIENT_ID: '423761283916-1rpa8120tpudgv4nf44cpmlf8slqbf4f.apps.googleusercontent.com'
}

const config: CapacitorConfig = {
  appId: 'org.ilovefreegle.direct',  // Fix back to .direct
  appName: 'Freegle',
  webDir: '.output/public',
  bundledWebRuntime: false,
  "cordova": {
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
