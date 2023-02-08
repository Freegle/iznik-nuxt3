// app-init.js: 
// - This code is run once at app startup - and does nothing on the web
// - Then handles push notifications and deeplinks
//
// State:
// - mobilestate
// - pushstate
//
// Initialise app:
// - Get device info and id
// - Set iOS window.open TODO
// - Enable pinch zoom on Android TODO
// - Enable deeplinks TODO
// - Set up push notifications
//
// Ongoing:
// - Handle push notifications TODO

import { defineStore } from 'pinia'
import { Device } from '@capacitor/device'
import { Badge } from '@capawesome/capacitor-badge'
import { PushNotifications } from '@capacitor/push-notifications'
import { useAuthStore } from '~/stores/auth'
import { AppLauncher } from '@capacitor/app-launcher'

let mobilePush = false
let lastPushMsgid = false
let checkedForUpdate = false

/*export const mobilestate = {
  isiOS: false,
  devicePersistentId: null
}

export const pushstate = {
  pushed: false, // Set to true to handle push in Vue context
  isiOS: false,
  route: false,
  modtools: false,
  acceptedMobilePushId: false,
  mobilePushId: false, // Note: mobilePushId is the same regardless of which user is logged in
  inlineReply: false,
  chatid: false,
  apprequiredversion: false,
  applatestversion: false,
  checkForUpdate: false
}
*/

export const useMobileStore = defineStore({ // Do not persist
  id: 'mobile',
  state: () => ({
    config: null,
    isApp: false,
    mobileVersion: false,
    isiOS: false,
    devicePersistentId: null,
    lastBadgeCount: -1,
  }),
  actions: {
    init(config) {
      this.config = config
      this.isApp = config.public.ISAPP
      if (!this.isApp) return

      this.mobileVersion = config.public.MOBILE_VERSION

      this.initApp()
    },
    async initApp() {
      console.log('--------------initapp--------------')
      const deviceinfo = await Device.getInfo()
      console.log('deviceinfo', deviceinfo)
      this.isiOS = deviceinfo.platform === 'ios'
      const deviceid = await Device.getId()
      console.log('deviceid', deviceid)
      this.devicePersistentId = deviceid.uuid

      // Make window.open work in iOS app TODO is this needed?
      const prevwindowopener = window.open
      window.open = (url) => {
        console.log('App window.open', url)
        AppLauncher.openUrl({ url: this.href })
      }

      /* TODO
      if (!this.isiOS) {
        // Enable pinch zoom on Android
        cordova.plugins.ZoomControl.ZoomControl('true') // enabling zoom control: setBuiltInZoomControls(true), setDefaultZoom(ZoomDensity.MEDIUM), setSupportZoom(true)
        cordova.plugins.ZoomControl.setBuiltInZoomControls('true') // Sets whether the WebView should use its built-in zoom mechanisms
        cordova.plugins.ZoomControl.setDisplayZoomControls('false') // Sets whether the WebView should display on-screen zoom controls when using the built-in zoom mechanisms.
        cordova.plugins.ZoomControl.setUseWideViewPort('false') // Sets whether the WebView should enable support for the "viewport" HTML meta tag or should use a wide viewport.
      }*/

      /* TODO
      window.IonicDeeplink.route({
        '/': {
          target: '',
          parent: ''
        }
      }, function (match) {
        console.log('========== Universal/App-link NOT HANDLED', match)
      }, function (nomatch) {
        //console.log('========== Universal/App-link', nomatch.$link.path)
        if (nomatch && nomatch.$link) {
          console.log('linkstate.route', nomatch.$link)
          linkstate.route = nomatch.$link
          linkstate.received = true
        }
      })*/

      // Create our Android push channel
      PushNotifications.createChannel({
        id: 'PushPluginChannel',
        name: 'Freegle chats',
        description: 'Direct messages with other Freeglers',
        //sound: 'res/raw/unconvinced',
        importance: 3,
        visibility: 1,
        lights: true,
        lightColor: '#5ECA24',
        vibration: false
      }).then(() => {
        console.log("CHANNEL CREATED: PushPluginChannel")
      });

      // Delete given Android push channel called PushDefaultForeground
      // OK if already deleted
      PushNotifications.deleteChannel({
        id: 'PushDefaultForeground'
      }).then((x) => {
        console.log("CHANNEL DELETED: PushDefaultForeground")
      })

      /* PushNotifications.checkPermissions().then((result) => {
        console.log('checkPermissions:', result) // Android always returns "granted"
      })*/

      // Request permission to use push notifications
      // iOS will prompt user and return if they granted permission or not
      // Android will just grant without prompting
      PushNotifications.requestPermissions().then(result => {
        console.log('requestPermissions:', result)
        if (result.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register()
        } else {
          // Show some error
          console.log('Error on request: ', result)
        }
      })

      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration',
        (token) => {
          console.log('Push registration success, token: ', token.value)
          this.mobilePushId = token.value
          // Tell server now if logged in
          const authStore = useAuthStore()
          authStore.savePushId()

          /*PushNotifications.listChannels().then(result => {
            for (const channel of result.channels) {
              console.log("CHANNEL", channel)
            }
          })*/
        }
      )
      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError',
        (error) => {
          console.log('Error on registration: ', error)
        }
      )

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived',
        (notification) => {
          console.log('============ Push received:', notification)
        }
      )

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed',
        (notification) => {
          console.log('Push action performed:', notification)
        }
      )

    },
    async setBadgeCount(badgeCount) { // TODO
      if (!this.isApp) return
      if (isNaN(badgeCount)) badgeCount = 0
      if (badgeCount !== this.lastBadgeCount) {
        console.log('setBadgeCount', badgeCount)
        await Badge.set({ badgeCount });
        //mobilePush.setApplicationIconBadgeNumber(function () { }, function () { }, badgeCount)
        this.lastBadgeCount = badgeCount
      }
    },
    // TODO async function checkForAppUpdate($api, $axios, store, router) {
  }
})

