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
import { useDebugStore } from '~/stores/debug'
import api from '~/api'

// Helper to get debug store safely (may not be initialized early)
function dbg() {
  try {
    return useDebugStore()
  } catch (e) {
    return null
  }
}

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
    appupdaterequired: false,
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

      // Log app and plugin versions for debugging
      const runtimeConfig = useRuntimeConfig()
      const appInfo = await App.getInfo()
      dbg()?.info('=== APP STARTUP ===')
      dbg()?.info('App version', runtimeConfig.public.MOBILE_VERSION)
      dbg()?.info('App build', appInfo.build)
      dbg()?.info('App bundle', appInfo.id)
      dbg()?.info('Platform', Capacitor.getPlatform())
      dbg()?.info('Capacitor native', Capacitor.isNativePlatform())

      // On Android, check for background push log (from when app wasn't running)
      if (Capacitor.getPlatform() === 'android') {
        try {
          const result = await PushNotifications.getBackgroundPushLog()
          if (result?.log && result.log.trim()) {
            dbg()?.info('=== BACKGROUND PUSH LOG ===')
            dbg()?.info(result.log)
            dbg()?.info('=== END BACKGROUND PUSH LOG ===')
            // Clear the log after reading
            await PushNotifications.clearBackgroundPushLog()
          } else {
            dbg()?.debug('No background push log entries')
          }
        } catch (e) {
          dbg()?.warn('Failed to read background push log', e.message)
        }
      }

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

      // Build device info string - avoid duplicates (platform/operatingSystem are often same)
      const parts = []
      if (deviceinfo.manufacturer) parts.push(deviceinfo.manufacturer)
      if (deviceinfo.model) parts.push(deviceinfo.model)
      if (deviceinfo.platform) parts.push(deviceinfo.platform)
      if (deviceinfo.osVersion) parts.push(deviceinfo.osVersion)
      // Only add webViewVersion if different from osVersion
      if (
        deviceinfo.webViewVersion &&
        deviceinfo.webViewVersion !== deviceinfo.osVersion
      ) {
        parts.push('WebView ' + deviceinfo.webViewVersion)
      }
      this.deviceuserinfo = parts.join(' ')

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
      dbg()?.info('initPushNotifications started', { isiOS: this.isiOS })

      if (!this.isiOS) {
        // Delete old channels
        await PushNotifications.deleteChannel({ id: 'PushDefaultForeground' })
        await PushNotifications.deleteChannel({ id: 'NewPosts' })

        // Create notification channels matching server-side categories
        // Channel IDs must match what the server sends in android.notification.channel_id

        // Chat messages - HIGH importance for heads-up notifications
        await PushNotifications.createChannel({
          id: 'chat_messages',
          name: 'Chat Messages',
          description: 'Direct messages with other Freeglers',
          importance: 4, // HIGH - shows as heads-up notification
          visibility: 1,
          lights: true,
          lightColor: '#5ECA24',
          vibration: true,
        })

        // Social - DEFAULT importance for ChitChat comments, replies, loves
        await PushNotifications.createChannel({
          id: 'social',
          name: 'ChitChat & Social',
          description: 'Comments, replies, and likes on your posts',
          importance: 3, // DEFAULT - sound and appears in tray
          visibility: 1,
          lights: true,
          lightColor: '#5ECA24',
          vibration: false,
        })

        // Reminders - DEFAULT importance for post expiry, collection reminders
        await PushNotifications.createChannel({
          id: 'reminders',
          name: 'Reminders',
          description: 'Post expiry warnings and collection reminders',
          importance: 3, // DEFAULT - sound and appears in tray
          visibility: 1,
          lights: true,
          lightColor: '#5ECA24',
          vibration: false,
        })

        // Tips - LOW importance for encouragement/engagement prompts
        await PushNotifications.createChannel({
          id: 'tips',
          name: 'Tips & Suggestions',
          description: 'Helpful tips and encouragement',
          importance: 2, // LOW - no sound, appears in tray
          visibility: 1,
          lights: false,
          lightColor: '#5ECA24',
          vibration: false,
        })

        // New posts - LOW importance for digest/relevant/nearby posts
        await PushNotifications.createChannel({
          id: 'new_posts',
          name: 'New Posts',
          description: 'New offers and wanted posts nearby',
          importance: 2, // LOW - no sound, appears in tray
          visibility: 1,
          lights: false,
          lightColor: '#5ECA24',
          vibration: false,
        })

        console.log('Notification channels created')
        dbg()?.info('Android notification channels created')
      } else {
        // iOS: Register notification action categories
        // This enables Reply, Mark Read, and View action buttons on chat notifications
        try {
          const result = await PushNotifications.registerActionCategories()
          console.log('iOS notification categories registered:', result)
          dbg()?.info('iOS notification categories registered', result)
        } catch (e) {
          console.log('iOS registerActionCategories not available:', e.message)
          dbg()?.warn('iOS registerActionCategories not available', e.message)
        }
      }

      let permStatus = await PushNotifications.checkPermissions()
      console.log('checkPermissions:', permStatus)
      dbg()?.info('Push permission status', permStatus)

      await PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ', token.value)
        dbg()?.info('Push registration success', {
          tokenLength: token.value?.length,
          tokenStart: token.value?.substring(0, 20) + '...',
        })
        this.mobilePushId = token.value
        const authStore = useAuthStore()
        authStore.savePushId()

        if (!this.isiOS) {
          PushNotifications.listChannels().then((result) => {
            for (const channel of result.channels) {
              dbg()?.debug('Channel registered', channel)
            }
          })
        }
      })
      console.log('addListener registration done')

      await PushNotifications.addListener('registrationError', (error) => {
        console.log('Error on registration: ', error)
        dbg()?.error('Push registration ERROR', error)
      })
      console.log('addListener registrationError done')

      await PushNotifications.addListener(
        'pushNotificationReceived',
        (notification) => {
          console.log('============ Push received:', notification)
          dbg()?.info('PUSH RECEIVED', notification)
          this.handleNotification(notification, PushNotifications, Badge)
        }
      )
      console.log('addListener pushNotificationReceived done')

      await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        async (n) => {
          console.log('Push action performed:', n)
          dbg()?.info('PUSH ACTION', {
            actionId: n.actionId,
            inputValue: n.inputValue,
            notification: n.notification,
          })
          const actionId = n.actionId
          const inputValue = n.inputValue

          // Handle specific actions
          if (actionId === 'reply' && inputValue && inputValue.trim()) {
            dbg()?.info('Handling reply action')
            await this.handleReplyAction(n.notification, inputValue.trim())
            return
          } else if (actionId === 'mark_read') {
            dbg()?.info('Handling mark_read action')
            await this.handleMarkReadAction(n.notification)
            return
          }

          // Default behavior - navigate to the notification target
          if (n.notification) n.notification.okToMove = true
          this.handleNotification(n.notification, PushNotifications, Badge)
        }
      )
      console.log('addListener pushNotificationActionPerformed done')

      permStatus = await PushNotifications.requestPermissions()
      console.log('requestPermissions:', permStatus)
      dbg()?.info('Push requestPermissions result', permStatus)
      if (permStatus.receive === 'granted') {
        await PushNotifications.register()
        console.log('PUSH REGISTER OK')
        dbg()?.info('Push register() called successfully')
      } else {
        console.log('Error on request: ', permStatus)
        dbg()?.error('Push permission NOT granted', permStatus)
      }

      this.setBadgeCount(0, Badge)
      dbg()?.info('initPushNotifications completed')
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
      dbg()?.info('handleNotification called', notification)
      if (!notification) {
        console.error('--- notification NOT SET')
        dbg()?.error('handleNotification: notification NOT SET')
        return
      }
      try {
        const data = notification.data
        if (!data) {
          console.error('--- notification.data NOT SET')
          dbg()?.error('handleNotification: notification.data NOT SET')
          return
        }

        // Only process new-style notifications (with channel_id).
        // Legacy notifications without channel_id are for older app versions.
        if (!data.channel_id) {
          console.log('--- Ignoring legacy notification without channel_id')
          dbg()?.warn('Ignoring legacy notification without channel_id', data)
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

        // When a push notification is received while the app is in the foreground,
        // immediately refresh chats to update unread counts and trigger message fetching.
        // This ensures new messages appear without waiting for the 30-second poll.
        if (foreground) {
          console.log('Foreground push received - refreshing chats')
          dbg()?.info('Foreground push - triggering chat refresh')
          const chatStore = useChatStore()
          chatStore.fetchChats(null, false)

          // If the notification includes a specific chat ID, also fetch messages for that chat directly.
          // This is faster than waiting for the unseen watcher in ChatPane.
          if (data.chatids) {
            const chatId = parseInt(data.chatids)
            if (chatId) {
              console.log(
                'Foreground push - fetching messages for chat',
                chatId
              )
              dbg()?.info('Foreground push - fetching messages', { chatId })
              chatStore.fetchMessages(chatId)
            }
          }
        }

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

    async handleReplyAction(notification, replyText) {
      // Send a reply message directly from the notification
      console.log('handleReplyAction', replyText, notification)
      try {
        const data = notification?.data
        if (!data) {
          console.error('handleReplyAction: no notification data')
          return
        }

        // Get chat ID from notification data
        const chatId = parseInt(data.chatids)
        if (!chatId) {
          console.error('handleReplyAction: no chat ID in notification')
          return
        }

        // Send the reply via API
        await api(this.config).chat.send({
          roomid: chatId,
          message: replyText,
        })
        console.log('handleReplyAction: message sent successfully')
      } catch (e) {
        console.error('handleReplyAction error:', e.message)
      }
    },

    async handleMarkReadAction(notification) {
      // Mark the chat as read without opening the app
      console.log('handleMarkReadAction', notification)
      try {
        const data = notification?.data
        if (!data) {
          console.error('handleMarkReadAction: no notification data')
          return
        }

        // Get chat ID from notification data
        const chatId = parseInt(data.chatid || data.chatids)
        if (!chatId) {
          console.error('handleMarkReadAction: no chat ID in notification')
          return
        }

        // Get the message ID from the notification - use the actual message ID, not a magic number
        const messageId = parseInt(data.messageid)
        if (!messageId) {
          console.error('handleMarkReadAction: no message ID in notification')
          return
        }

        // Mark as read up to this specific message ID
        await api(this.config).chat.markRead(chatId, messageId, false)
        console.log(
          'handleMarkReadAction: chat marked as read up to message',
          messageId
        )

        // Update badge count
        const { Badge } = await import('@capawesome/capacitor-badge')
        const newCount = Math.max(0, (parseInt(data.badge) || 1) - 1)
        this.setBadgeCount(newCount, Badge)
      } catch (e) {
        console.error('handleMarkReadAction error:', e.message)
      }
    },

    async checkForAppUpdate() {
      const requiredKey = this.isiOS
        ? 'app_fd_version_ios_required'
        : 'app_fd_version_android_required'

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
