// Do not persist
export const useMobileStore = defineStore({
  id: 'mobile',
  state: () => ({
    config: null,
    isApp: false,
    mobileVersion: false,
    isiOS: false,
    devicePersistentId: null
  }),
  actions: {
    init(config) {
      console.log("===mobile store init", config)
      this.config = config
      this.isApp = config.ISAPP
      this.mobileVersion = config.MOBILE_VERSION
    },
  },
})