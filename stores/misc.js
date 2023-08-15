import { defineStore } from 'pinia'

export const useMiscStore = defineStore({
  id: 'misc',
  persist: {
    enabled: true,
    strategies:
      typeof localStorage === 'undefined'
        ? []
        : [
            // These are sticky preferences.
            {
              storage: localStorage,
              paths: ['vals'],
            },
          ],
  },
  state: () => ({
    time: null,
    breakpoint: null,
    vals: {},
    somethingWentWrong: false,
    needToReload: false,
    visible: true,
    apiCount: 0,
    unloading: false,
    onlineTimer: null,
    online: true,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    set(params) {
      this.vals[params.key] = params.value
    },
    setTime() {
      this.time = new Date()
    },
    setBreakpoint(val) {
      this.breakpoint = val
    },
    api(diff) {
      this.apiCount += diff
    },
    startOnlineCheck() {
      // navigator.onLine is not reliable, so we ping the server.
      if (!this.onlineTimer) {
        this.checkOnline()
      }
    },
    fetchWithTimeout(url, options, timeout = 7000) {
      return Promise.race([
        fetch(url, options),
        new Promise((resolve, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeout)
        ),
      ])
    },
    async checkOnline() {
      try {
        const response = await this.fetchWithTimeout(
          this.config.public.APIv2 + '/online',
          null,
          5000
        )
        const rsp = await response.json()

        if (!this.online) {
          console.log('Back online')
          this.online = rsp.online
        }
      } catch (e) {
        if (this.online) {
          console.log('Gone offline')
          this.online = false
        }
      }

      this.onlineTimer = setTimeout(
        this.checkOnline,
        this.visible ? 1000 : 30000
      )
    },
    waitForOnline() {
      if (this.online) {
        return
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          if (this.online) {
            resolve()
          } else {
            this.waitForOnline().then(resolve)
          }
        }, 1000)
      })
    },
  },
  getters: {
    get: (state) => (key) => {
      return state.vals[key]
    },
  },
})
