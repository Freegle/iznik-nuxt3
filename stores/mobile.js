// mobile.js: 
// - This code is run once at app startup - and does nothing on the web
// - Then handles push notifications and deeplinks
//
// Initialise app:
// - Get device info and id
// - Set iOS window.open
// - Enable pinch zoom on Android
// - Enable deeplinks
// - Set up push notifications
//
// Ongoing:
// - Handle push notifications TODO

import { defineStore } from 'pinia'
import { Device } from '@capacitor/device'
import { Badge } from '@capawesome/capacitor-badge'
//import { PushNotifications } from '@capacitor/push-notifications'
import { PushNotifications } from '@freegle/capacitor-push-notifications'
import { useAuthStore } from '~/stores/auth'
import { AppLauncher } from '@capacitor/app-launcher'
import api from '~/api'
//import { FreegleFCM } from '@capacitor/freegle-nuxt3-fcm'
//import { FCM } from '@capacitor-community/fcm';
//import { getMessaging, getToken as firebaseGetToken, onMessage, deleteToken, isSupported } from "firebase/messaging";
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { ZoomPlugin } from 'capacitor-zoom-android';
import { App } from '@capacitor/app';
import { useRouter } from '#imports'

export const useMobileStore = defineStore({ // Do not persist
  id: 'mobile',
  state: () => ({
    config: null,
    isApp: false,
    mobileVersion: false,
    isiOS: false,
    osVersion: false,
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
      //await this.initFirebaseMessaging()
      /*if (!this.isiOS) {
        try {
          console.log("PHDCC AAA")
          console.log("PHDCC BBB", FreegleFCM)
          //const rv = FreegleFCM.echo("PHDCC") 32496365
          console.log("PHDCC rv", rv)
          //FreegleFCM.doSomething(1.0,2.0)
        } catch (e) {
          console.log("PHDCC ZZZ ", e.message)
        }
      }*/
      Capacitor.Plugins.ZoomPlugin.enableZoom()
    },

    /*async initFirebaseMessaging() {
      // https://www.npmjs.com/package/@capacitor-firebase/messaging
      // https://github.com/capawesome-team/capacitor-firebase/tree/main/packages/messaging
      console.log('====initFirebaseMessaging===')
      let result = await FirebaseMessaging.checkPermissions();
      console.log('====initFirebaseMessaging===A', result)
      result = await FirebaseMessaging.requestPermissions();
      console.log('====initFirebaseMessaging===B', result)
      result = await FirebaseMessaging.getToken();
      console.log('====initFirebaseMessaging===C', result)
      this.mobilePushId = result.token
      console.log('====initFirebaseMessaging===D', result.token)
      // Tell server now if logged in
      const authStore = useAuthStore()
      authStore.savePushId()

      await FirebaseMessaging.addListener('notificationReceived', event => {
        console.log('###########notificationReceived', { event });
      })
      console.log('====initFirebaseMessaging===E')

      //FCM.subscribeTo({ topic: "test" })
      //  .then((r) => alert(`subscribed to topic`))
      //  .catch((err) => console.log(err));

      //FCM.getToken()
      //  .then((r) => alert(`Token ${r.token}`))
      //  .catch((err) => console.log(err));
      */
      /* const isNtfSupported = await isSupported()
      if (!isNtfSupported) return
      console.log('====initFCM===2')

      // web notifications
      Notification.requestPermission().then(function (permission) {
        console.log('====initFCM===', permission)
        if (permission === 'granted') {
          subscribeTo(destination);
        } else {
          // Show some error
        }
      });

      console.log('====initFCM===3')
      const messaging = getMessaging();
      console.log('====initFCM===4')

      onMessage(messaging, (payload) => {
        console.log('====initFCM===5')
        let notification = payload.data;

        const notificationOptions = {
          badge: notification?.largeIco,
          body: notification?.body,
          icon: notification?.largeIcon
        };

        const title = notification?.title || "";

        // show notification
        navigator.serviceWorker
          .getRegistrations()
          .then((registration) => {
            console.log('====initFCM===6')
            if (notification?.sound) {
              const audio = new Audio(`/notifications/${notification?.sound}`)
              audio.play()
            }
            registration[0].showNotification(title, notificationOptions);
          });
      })
      return
    } */
    /*},*/
    /*async subscribeTo(destination) {
      //subscribe to web topic
      const messaging = getMessaging();
      firebaseGetToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY }).then(
        async (token) => {
          if (token) {
            await myAxios.post("/api/notifications/subscribe-to-topic", { token, destination });
          }
        }).catch((err) => {
          console.log('An error occurred while retrieving token. ', err);
        });
      return
    }*/

    //////////////
    async getDeviceInfo() {
      console.log('--------------initapp--------------')
      const deviceinfo = await Device.getInfo()
      console.log('deviceinfo', deviceinfo)
      this.isiOS = deviceinfo.platform === 'ios'
      this.osVersion = deviceinfo.osVersion
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
      if (!this.isiOS) {
        ZoomPlugin.enableZoom()
      }
    },
    extractQueryStringParams(url) {
      let urlParams = false
      const qm = url.indexOf('?')
      if (qm >= 0) {
        const qs = url.substring(qm + 1)
        // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
        const pl = /\+/g  // Regex for replacing addition symbol with a space
        const search = /([^&=]+)=?([^&]*)/g
        const decode = s => { return decodeURIComponent(s.replace(pl, ' ')) }
        urlParams = {}
        let match
        while ((match = search.exec(qs))) {
          urlParams[decode(match[1]).replace(/\./g, "_")] = decode(match[2]) // Convert period to underscore to get through to openid.php
        }
      }
      return urlParams
    },

    //////////////
    // Needs: https://www.ilovefreegle.org/.well-known/assetlinks.json
    async initDeepLinks() {
      if (process.client) {
        App.addListener('appUrlOpen', async event => {
          // url eg https://www.ilovefreegle.org/chats/123456?u=98765&src=chatnotif
          const lookfor = 'ilovefreegle.org'
          const ilfpos = event.url.indexOf(lookfor)
          if (ilfpos !== false) {
            const route = event.url.substring(ilfpos + lookfor.length)
            const router = useRouter()
            if (route.indexOf('src=forgotpass') !== -1) {  // Special handling of forgotpass
              // /settings?u=uuu&k=kkk&src=forgotpass
              const authStore = useAuthStore()
              await authStore.clearRelated()
              await authStore.logout()
              const params = this.extractQueryStringParams(route)
              // Log in using the username and key.
              await authStore.login({
                u: params.u,
                k: params.k,
              })
            }
            router.push(route)
          }
        })
      }
    },
    //////////////
    // https://developer.android.com/develop/ui/views/notifications
    // https://capacitorjs.com/docs/apis/push-notifications
    async initPushNotifications() {
      if (!this.isiOS) {
        // Delete given Android push channel called PushDefaultForeground
        // This is created if capacitor.config.ts has plugins:PushNotifications:presentationOptions
        // OK if already deleted
        await PushNotifications.deleteChannel({
          id: 'PushDefaultForeground'
        })
        console.log("CHANNEL DELETED: PushDefaultForeground")

        // Create our Android push channel
        await PushNotifications.createChannel({
          id: 'PushDefaultForeground', // PushPluginChannel
          name: 'Freegle chats',
          description: 'Direct messages with other Freeglers',
          //sound: 'res/raw/unconvinced',
          importance: 3,
          visibility: 1,
          lights: true,
          lightColor: '#5ECA24',
          vibration: false
        })
        console.log("CHANNEL CREATED: PushDefaultForeground")
      }

      let permStatus = await PushNotifications.checkPermissions();
      console.log('checkPermissions:', permStatus)
      /* PushNotifications.checkPermissions().then((result) => {
        console.log('checkPermissions:', result) // Android always returns "granted"
      })*/

      // On success, we should be able to receive notifications
      await PushNotifications.addListener('registration',
        (token) => {
          console.log('Push registration success, token: ', token.value)
          this.mobilePushId = token.value
          // Tell server now if logged in
          const authStore = useAuthStore()
          authStore.savePushId()

          if (!this.isiOS) {
            PushNotifications.listChannels().then(result => {
              for (const channel of result.channels) {
                console.log("CHANNEL", channel)
              }
            })
          }
        }
      )
      console.log('addListener registration done')

      // Some issue with our setup and push will not work
      await PushNotifications.addListener('registrationError',
        (error) => {
          console.log('Error on registration: ', error)
        }
      )
      console.log('addListener registrationError done')

      // Show us the notification payload if the app is open on our device
      await PushNotifications.addListener('pushNotificationReceived',
        (notification) => {
          console.log('============ Push received:', notification)
          this.handleNotification(notification)
        }
      )
      console.log('addListener pushNotificationReceived done')

      // Method called when tapping on a notification
      await PushNotifications.addListener('pushNotificationActionPerformed',
        (notification) => {
          console.log('Push action performed:', notification)
        }
      )
      console.log('addListener pushNotificationActionPerformed done')

      // Request permission to use push notifications
      // iOS will prompt user and return if they granted permission or not
      // Android will just grant without prompting
      permStatus = await PushNotifications.requestPermissions()
      console.log('requestPermissions:', permStatus)
      if (permStatus.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register()
        console.log('PUSH REGISTER OK')
      } else {
        // Show some error
        console.log('Error on request: ', permStatus)
      }

      //PushNotifications.getDeliveredNotifications().then(notificationList => {
      //  console.log("getDeliveredNotifications")
      //  console.log("getDeliveredNotifications", notificationList)
      //})
      this.setBadgeCount(99)
    },
    //////////////
    async setBadgeCount(badgeCount) { // TODO
      if (!this.isApp) return
      if (isNaN(badgeCount)) badgeCount = 0
      if (badgeCount !== this.lastBadgeCount) {
        console.log('setBadgeCount', badgeCount)
        //const rv = await Badge.isSupported();
        //console.log('isSupported', rv.isSupported)
        await Badge.set({ count: badgeCount });
        //mobilePush.setApplicationIconBadgeNumber(function () { }, function () { }, badgeCount)
        //const result = await Badge.get();
        //console.log("Get Badge Count: ", result.count);
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

      console.log('handleNotification', notification)
      PushNotifications.getDeliveredNotifications().then(notificationList => {
        console.log("getDeliveredNotifications")
        console.log("getDeliveredNotifications", notificationList)
      })

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
        //PushNotifications.removeAllDeliveredNotifications()
        //mobilePush.clearAllNotifications() // no success and error fns given
        console.log('clearAllNotifications TODO')
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

