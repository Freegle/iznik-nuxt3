// Stub mobile store for web builds
// The real mobile store exists only in the app-ci-fd branch
import { defineStore } from 'pinia'

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
      // For web builds, isApp is always false
      this.isApp = false
    },
  },
})
