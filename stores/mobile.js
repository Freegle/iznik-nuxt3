import { defineStore } from 'pinia'
import { Capacitor } from '@capacitor/core'

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
    modtools: false,
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
      } else {
        console.log('Mobile store initialized - running in web browser')
      }
    },
  },
})
