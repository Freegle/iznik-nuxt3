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
// - Handle push notifications

import { defineStore } from 'pinia'
import { Capacitor } from '@capacitor/core'
import { useAuthStore } from '~/stores/auth'
import { useChatStore } from '~/stores/chat'
import { useNotificationStore } from '~/stores/notification'
import api from '~/api'

export const useMobileStore = defineStore({
  id: 'mobile',
  state: () => ({
    config: null,
    isApp: false,
    mobileVersion: false,
    deviceinfo: null,
    deviceuserinfo: '',
    isiOS: false,
    osVersion: false,
    devicePersistentId: null,
    lastBadgeCount: -1,
    modtools: false,
    inlineReply: false,
    chatid: false,
    pushed: false,
    route: false,
    apprequiredversion: false,
    applatestversion: false,
    appupdaterequired: false,
    appupdateavailable: false,
  }),
  actions: {
    init(config) {
      this.config = config

      // Detect if running in a native Capacitor app
      // This works for both app and web builds
      const platform = Capacitor.getPlatform()
      this.isApp = platform === 'ios' || platform === 'android'
      this.isiOS = platform === 'ios'

      if (this.isApp) {
        console.log(
          'Mobile store initialized - running in Capacitor app:',
          platform
        )
        this.mobileVersion = config.public.MOBILE_VERSION
        this.initApp()
      } else {
        console.log('Mobile store initialized - running in web browser')
      }
    },

    async initApp() {
      // Only run app-specific initialization
      // Import app-specific modules dynamically to avoid issues in web build
      const { Device } = await import('@capacitor/device')
      const { Badge } = await import('@capawesome/capacitor-badge')
      const { PushNotifications } = await import(
        '@freegle/capacitor-push-notifications-cap7'
      )
      const { AppLauncher } = await import('@capacitor/app-launcher')
      const { App } = await import('@capacitor/app')

      await this.getDeviceInfo(Device)
      this.fixWindowOpen(AppLauncher)
      this.initDeepLinks(App)
      await this.initPushNotifications(PushNotifications, Badge)
      await this.checkForAppUpdate()
      this.initWakeUpActions(App)
    },

    async getDeviceInfo(Device) {
      console.log('--------------initapp--------------')
      const deviceinfo = await Device.getInfo()
      console.log('deviceinfo', deviceinfo)
      this.deviceinfo = deviceinfo
      this.deviceuserinfo = ''
      if (deviceinfo.manufacturer)
        this.deviceuserinfo += deviceinfo.manufacturer + ' '
      if (deviceinfo.model) this.deviceuserinfo += deviceinfo.model + ' '
      if (deviceinfo.platform) this.deviceuserinfo += deviceinfo.platform + ' '
      if (deviceinfo.operatingSystem)
        this.deviceuserinfo += deviceinfo.operatingSystem + ' '
      if (deviceinfo.osVersion)
        this.deviceuserinfo += deviceinfo.osVersion + ' '
      if (deviceinfo.webViewVersion)
        this.deviceuserinfo += deviceinfo.webViewVersion
      console.log('deviceuserinfo', this.deviceuserinfo)
      this.isiOS = deviceinfo.platform === 'ios'
      this.osVersion = deviceinfo.osVersion
      const deviceid = await Device.getId()
      console.log('deviceid', deviceid)
      this.devicePersistentId = deviceid.identifier
    },

    fixWindowOpen(AppLauncher) {
      // External links should be opened with ExternalLink but catch calls to window.open here
      // Internal links are handled internally and external links use AppLauncher
      window.open = (url) => {
        console.log('App window.open', url)
        if (url.substring(0, 4) !== 'http') {
          const router = useRouter()
          router.push(url)
        } else {
          AppLauncher.openUrl({ url })
        }
      }
    },

    extractQueryStringParams(url) {
      let urlParams = false
      const qm = url.indexOf('?')
      if (qm >= 0) {
        const qs = url.substring(qm + 1)
        const pl = /\+/g
        const search = /([^&=]+)=?([^&]*)/g
        const decode = (s) => {
          return decodeURIComponent(s.replace(pl, ' '))
        }
        urlParams = {}
        let match
        while ((match = search.exec(qs))) {
          urlParams[decode(match[1]).replace(/\./g, '_')] = decode(match[2])
        }
      }
      return urlParams
    },

    initWakeUpActions(App) {
      if (process.client) {
        App.addListener('resume', (event) => {
          try {
            const notificationStore = useNotificationStore()
            notificationStore.fetchCount()

            const chatStore = useChatStore()
            chatStore.fetchChats(null, false)
          } catch (e) {}
        })
      }
    },

    initDeepLinks(App) {
      if (process.client) {
        App.addListener('appUrlOpen', async (event) => {
          console.log('appUrlOpen', event.url)
          const lookfor = 'ilovefreegle.org'
          const ilfpos = event.url.indexOf(lookfor)
          if (ilfpos !== false) {
            const route = event.url.substring(ilfpos + lookfor.length)
            console.log('appUrlOpen route', route)
            const router = useRouter()
            if (route.includes('src=forgotpass')) {
              const authStore = useAuthStore()
              await authStore.clearRelated()
              await authStore.logout()
              const params = this.extractQueryStringParams(route)
              await authStore.login({
                u: params.u,
                k: params.k,
              })
            }
            if (route.includes('one-click-unsubscribe')) {
              const ustart = route.indexOf('/', 1)
              if (ustart !== -1) {
                const kstart = route.indexOf('/', ustart + 1)
                if (kstart !== -1) {
                  const uid = parseInt(route.substring(ustart + 1, kstart))
                  const authStore = useAuthStore()
                  const loggedInAs = authStore.user?.id
                  if (loggedInAs === uid) {
                    const ret = await authStore.forget()
                    if (!ret) {
                      authStore.forceLogin = false
                      router.push('/unsubscribe/unsubscribed')
                      return
                    }
                  }
                }
              }
              router.push('/unsubscribe')
              return
            }
            setTimeout(() => {
              console.log('appUrlOpen route push', route)
              router.push(route)
            }, 500)
          }
        })
      }
    },

    async initPushNotifications(PushNotifications, Badge) {
      if (!this.isiOS) {
        // Clean up old channels - no longer needed as we use the default channel
        await PushNotifications.deleteChannel({ id: 'PushDefaultForeground' })
        await PushNotifications.deleteChannel({ id: 'NewPosts' })
      }

      let permStatus = await PushNotifications.checkPermissions()
      console.log('checkPermissions:', permStatus)

      await PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ', token.value)
        this.mobilePushId = token.value
        const authStore = useAuthStore()
        authStore.savePushId()

        if (!this.isiOS) {
          PushNotifications.listChannels().then((result) => {
            for (const channel of result.channels) {
              console.log('CHANNEL', channel)
            }
          })
        }
      })
      console.log('addListener registration done')

      await PushNotifications.addListener('registrationError', (error) => {
        console.log('Error on registration: ', error)
      })
      console.log('addListener registrationError done')

      await PushNotifications.addListener(
        'pushNotificationReceived',
        (notification) => {
          console.log('============ Push received:', notification)
          this.handleNotification(notification, PushNotifications, Badge)
        }
      )
      console.log('addListener pushNotificationReceived done')

      await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (n) => {
          console.log('Push action performed:', n)
          if (n.notification) n.notification.okToMove = true
          this.handleNotification(n.notification, PushNotifications, Badge)
        }
      )
      console.log('addListener pushNotificationActionPerformed done')

      permStatus = await PushNotifications.requestPermissions()
      console.log('requestPermissions:', permStatus)
      if (permStatus.receive === 'granted') {
        await PushNotifications.register()
        console.log('PUSH REGISTER OK')
      } else {
        console.log('Error on request: ', permStatus)
      }

      this.setBadgeCount(0, Badge)
    },

    async setBadgeCount(badgeCount, Badge) {
      if (!this.isApp) return
      if (isNaN(badgeCount)) badgeCount = 0
      if (badgeCount !== this.lastBadgeCount) {
        console.log('setBadgeCount', badgeCount)
        if (!Badge) {
          Badge = (await import('@capawesome/capacitor-badge')).Badge
        }
        await Badge.set({ count: badgeCount })
        this.lastBadgeCount = badgeCount
      }
    },

    async handleNotification(notification, PushNotifications, Badge) {
      const router = useRouter()
      console.log('handleNotification A', notification)
      if (!notification) {
        console.error('--- notification NOT SET')
        return
      }
      try {
        const data = notification.data
        if (!data) {
          console.error('--- notification.data NOT SET')
          return
        }

        // Only process legacy notifications (no channel specified).
        // New notifications with channel_id are for newer app versions.
        if (data.channel_id) {
          console.log(
            '--- Ignoring notification with channel_id:',
            data.channel_id
          )
          return
        }

        let foreground = false
        if ('foreground' in data) {
          console.log('--- FOREGROUND', data.foreground)
          foreground = data.foreground
        } else console.log('--- FOREGROUND NOT SET')

        if (!('count' in data)) {
          data.count = 0
        }
        if (!('modtools' in data)) {
          data.modtools = 0
        }
        const modtools = data.modtools === '1'
        this.modtools = modtools
        data.count = parseInt(data.badge)

        if (data.count === 0) {
          console.log('clearAllNotifications TODO')
        }
        console.log('handleNotification badgeCount', data.count)
        this.setBadgeCount(data.count, Badge)

        if (!this.isiOS && 'inlineReply' in data) {
          const inlineReply = data.inlineReply.trim()
          console.log('======== inlineReply', inlineReply)
          if (inlineReply) {
            this.inlineReply = inlineReply
            this.chatid = parseInt(data.chatids)
          }
        }
        console.log('handleNotification B', this.inlineReply, this.chatid)

        if ('route' in data) {
          this.route = data.route
        }
        console.log('handleNotification C', this.route)

        if (this.inlineReply) {
          this.inlineReply = false
          this.pushed = false
          this.route = false
          return
        }

        const { App } = await import('@capacitor/app')
        const appState = await App.getState()
        const active = appState ? appState.isActive : false
        let okToMove = false
        if (this.isiOS) {
          okToMove = !active
        } else {
          okToMove = (!foreground && active) || (foreground && !active)
        }
        if (notification.okToMove) okToMove = true
        console.log(
          'this.isiOS',
          this.isiOS,
          'active',
          active,
          'okToMove',
          okToMove
        )

        if (this.route && okToMove) {
          this.route = this.route.replace('/chat/', '/chats/')
          console.log('router.currentRoute', router.currentRoute)
          if (router.currentRoute.path !== this.route) {
            console.log('GO TO ', this.route)
            router.push(this.route)
          }
        }

        this.route = false
      } catch (e) {
        console.log('hangleNotification exception', e.message)
      }
    },

    async checkForAppUpdate() {
      const requiredKey = this.isiOS
        ? 'app_fd_version_ios_required'
        : 'app_fd_version_android_required'
      const latestKey = this.isiOS
        ? 'app_fd_version_ios_latest'
        : 'app_fd_version_android_latest'

      const reqdValues = await api(this.config).config.fetchv2(requiredKey)
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

      const latestValues = await api(this.config).config.fetchv2(latestKey)
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
  },
})
