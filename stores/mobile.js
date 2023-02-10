// app-init.js: 
// - This code is run once at app startup - and does nothing on the web
// - Then handles push notifications and deeplinks
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
import api from '~/api'

export const useMobileStore = defineStore({ // Do not persist
  id: 'mobile',
  state: () => ({
    config: null,
    isApp: false,
    mobileVersion: false,
    isiOS: false,
    devicePersistentId: null,
    lastBadgeCount: -1,
    modtools: false,
    inlineReply: false,
    chatid: false,
    pushed: false, // Set to true to handle push in Vue context
    route: false,
    apprequiredversion: false,
    applatestversion: false,
    appupdaterequired: false,
    appupdateavailable: false,
  }),
  actions: {
    //////////////
    init(config) {
      this.config = config
      this.isApp = config.public.ISAPP
      if (!this.isApp) return

      this.mobileVersion = config.public.MOBILE_VERSION

      this.initApp()
    },
    //////////////
    async initApp() {
      await this.getDeviceInfo()
      await this.fixIOSwindowOpen()
      await this.enableAndroidPinchZoom()
      await this.initDeepLinks()
      await this.initPushNotifications()
      await this.checkForAppUpdate()
    },
    //////////////
    async getDeviceInfo() {
      console.log('--------------initapp--------------')
      const deviceinfo = await Device.getInfo()
      console.log('deviceinfo', deviceinfo)
      this.isiOS = deviceinfo.platform === 'ios'
      const deviceid = await Device.getId()
      console.log('deviceid', deviceid)
      this.devicePersistentId = deviceid.uuid
    },
    //////////////
    async fixIOSwindowOpen() {

      // Make window.open work in iOS app TODO is this needed?
      const prevwindowopener = window.open
      window.open = (url) => {
        console.log('App window.open', url)
        AppLauncher.openUrl({ url: this.href })
      }
    },
    //////////////
    async enableAndroidPinchZoom() {

      /* TODO
      if (!this.isiOS) {
        // Enable pinch zoom on Android
        cordova.plugins.ZoomControl.ZoomControl('true') // enabling zoom control: setBuiltInZoomControls(true), setDefaultZoom(ZoomDensity.MEDIUM), setSupportZoom(true)
        cordova.plugins.ZoomControl.setBuiltInZoomControls('true') // Sets whether the WebView should use its built-in zoom mechanisms
        cordova.plugins.ZoomControl.setDisplayZoomControls('false') // Sets whether the WebView should display on-screen zoom controls when using the built-in zoom mechanisms.
        cordova.plugins.ZoomControl.setUseWideViewPort('false') // Sets whether the WebView should enable support for the "viewport" HTML meta tag or should use a wide viewport.
      }*/
    },
    //////////////
    async initDeepLinks() {

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
    },
    //////////////
    async initPushNotifications() {
      /*if (!this.isiOS) {
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
        // This is created if capacitor.config.ts has plugins:PushNotifications:presentationOptions
        // OK if already deleted
        PushNotifications.deleteChannel({
          id: 'PushDefaultForeground'
        }).then((x) => {
          console.log("CHANNEL DELETED: PushDefaultForeground")
        })
      }*/

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

          /*if (!this.isiOS) {
            PushNotifications.listChannels().then(result => {
              for (const channel of result.channels) {
                console.log("CHANNEL", channel)
              }
            })
          }*/
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
          this.handleNotification(notification)
        }
      )

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed',
        (notification) => {
          console.log('Push action performed:', notification)
        }
      )
    },
    //////////////
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
    //////////////
    // https://capacitorjs.com/docs/apis/push-notifications
    // Usually receives a clear to zero notification followed by the real one
    //  notification.data:
    //    badge: "9"
    //    chatcount: "9"
    //    chatids: "13246706"
    //    content-available: "1"
    //    count: "9"
    //    image: "www/images/user_logo.png"
    //    message: ""
    //    modtools: ""
    //    notId: "1675884730"
    //    notifcount: "0"
    //    route: "/chats"
    //    sound: "default"
    //    title: "You have 9 new messages"
    async handleNotification(notification) {
      const router = useRouter()

      //console.log('push notification', notificationType)
      console.log(notification)
      const data = notification.data
      // const foreground = data.foreground.toString() === 'true' // Was first called in foreground or background
      // let msgid = new Date().getTime() // Can't tell if double event if notId not given
      let msgid = 0
      if ('notId' in data) {
        msgid = data.notId
      }
      //const doubleEvent = !foreground && msgid !== 0 && msgid === lastPushMsgid
      //lastPushMsgid = msgid
      if (!('count' in data)) {
        data.count = 0
      }
      if (!('modtools' in data)) {
        data.modtools = 0
      }
      const modtools = data.modtools == '1'
      this.modtools = modtools
      data.count = parseInt(data.badge)
      //console.log('foreground ' + foreground + ' double ' + doubleEvent + ' msgid: ' + msgid + ' count: ' + data.count + ' modtools: ' + modtools)
      if (data.count === 0) {
        PushNotifications.removeAllDeliveredNotifications()
        //mobilePush.clearAllNotifications() // no success and error fns given
        console.log('clearAllNotifications')
      }
      console.log('handleNotification badgeCount', data.count)
      this.setBadgeCount(data.count)
      //mobilePush.setApplicationIconBadgeNumber(function () { }, function () { }, data.count)

      if (!this.isiOS && 'inlineReply' in data) {
        const inlineReply = data.inlineReply.trim()
        console.log('======== inlineReply', inlineReply)
        if (inlineReply) {
          this.inlineReply = inlineReply
          this.chatid = parseInt(data.chatids)
        }
      }

      // Pass route to go to (or update) but only if in background or just starting app
      // Note: if in foreground then rely on count updates to inform user
      if ('route' in data) {
        this.route = data.route // eg /chat/123456 or /chats
      }

      if (this.inlineReply) {
        const params = {
          roomid: this.chatid,
          message: this.inlineReply
        }
        // CC TODO store.$api.chat.send(params)
        this.inlineReply = false
        this.pushed = false
        this.route = false
        return
      }
      //store.dispatch('notifications/count')
      //store.dispatch('chats/listChats')
      //await api(this.config).chat.listChats(since, search)
      /*if (this.modtools) {
        store.dispatch('auth/fetchUser', {
          components: ['work'],
          force: true
        })
      }*/

      if (this.route) {
        this.route = this.route.replace('/chat/', '/chats/') // Match redirects in nuxt.config.js
        console.log('router.currentRoute', router.currentRoute)
        if (router.currentRoute.path !== this.route) {
          console.log('GO TO ', this.route)
          router.push({ path: this.route })  // Often doesn't work as intended when starting app from scratch as this routing is too early. Delaying doesn't seem to help.
        }
      }

      this.route = false


      // iOS needs to be told when we've finished: do it after a short delay to allow our code to run
      /*if (this.isiOS) {
        setTimeout(function () {
          mobilePush.finish(
            function () {
              console.log('iOS push finished OK')
            },
            function () {
              console.log('iOS push finished error')
            },
            data.notId
          )
        }, 50)
      }*/
    },
    //////////////
    async checkForAppUpdate($api, $axios, store, router) {
      const requiredKey = this.isiOS ? 'app_fd_version_ios_required' : 'app_fd_version_android_required'
      const latestKey = this.isiOS ? 'app_fd_version_ios_latest' : 'app_fd_version_android_latest'

      const reqdValues = await api(this.config).config.get({ key: requiredKey })
      if (reqdValues && reqdValues.length === 1) {
        const requiredVersion = reqdValues[0].value
        if (requiredVersion) {
          this.apprequiredversion = requiredVersion
          if (this.versionOutOfDate(requiredVersion)) {
            this.appupdaterequired = true
            console.log('==========appupdate required!')
          }
        }
      }

      const latestValues = await api(this.config).config.get({ key: latestKey })
      if (latestValues && latestValues.length === 1) {
        const latestVersion = latestValues[0].value
        if (latestVersion) {
          this.applatestversion = latestVersion
          if (this.versionOutOfDate(latestVersion)) {
            this.appupdateavailable = true
          }
        }
      }
    },
    versionOutOfDate(newver) {
      const runtimeConfig = useRuntimeConfig()
      const currentver = runtimeConfig.public.MOBILE_VERSION
      if (!newver) return false
      const anewver = newver.split('.')
      const acurrentver = currentver.split('.')
      for (let vno = 0; vno < 3; vno++) {
        const cv = parseInt(acurrentver[vno])
        const nv = parseInt(anewver[vno])
        if (nv > cv) return true
        if (nv < cv) return false
      }
      return false
    },
  }
})

