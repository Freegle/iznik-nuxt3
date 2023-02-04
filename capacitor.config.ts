import { CapacitorConfig } from '@capacitor/cli';

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
  }
};

export default config;
