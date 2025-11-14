import { defineStore } from 'pinia'
// import api from '~/api' // REMOVE FROM MT AS GENERATES SOME CIRCULAR REFERENCE

export const useMiscStore = defineStore({
  id: 'misc',
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    pick: ['vals', 'source', 'marketingConsent'],
  },
  state: () => ({
    time: null,
    breakpoint: null,
    vals: {},
    somethingWentWrong: false,
    errorDetails: null,
    needToReload: false,
    visible: true,
    apiCount: 0,
    unloading: false,
    onlineTimer: null,
    online: true,
    pageTitle: null,
    stickyAdRendered: 0,
    adsDisabled: false,
    boredWithJobs: false,
    lastTyping: null,
    modtools: false,
    modtoolsediting: false, // Set when editing message in situ: do not check for work
    worktimer: false,
    deferGetMessages: false,
    source: null,
    marketingConsent: true,
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
    setSource(val) {
      this.source = val
      // api(this.config).logs.src(val) // REMOVE FROM MT AS GENERATES SOME CIRCULAR REFERENCE
    },
    setErrorDetails(error) {
      this.somethingWentWrong = true
      this.errorDetails = {
        message: error?.message || 'Unknown error',
        stack: error?.stack || null,
        timestamp: new Date().toISOString(),
        name: error?.name || 'Error',
        cause: error?.cause || null,
      }
    },
    clearError() {
      this.somethingWentWrong = false
      this.errorDetails = null
    },
    api(diff) {
      this.apiCount += diff

      if (this.apiCount < 0) {
        console.error('API count went negative')
        console.trace()
        this.apiCount = 0
      }
    },
    startOnlineCheck() {
      // navigator.onLine is not reliable, so we ping the server.
      if (!this.onlineTimer) {
        this.checkOnline()
      }
    },
    async fetchWithTimeout(url, options, timeout = 7000) {
      const controller = new AbortController()
      const signal = controller.signal
      options = options || {}
      options.signal = signal

      const p = fetch(url, options)
      let timedout = false
      let ret = null

      let timer = setTimeout(() => {
        console.log('Request timed out', url)
        timedout = true
        controller.abort()
      }, timeout)

      try {
        ret = await p

        if (timer) {
          clearTimeout(timer)
          timer = null
        }

        return ret
      } catch (e) {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }

        if (timedout) {
          throw new Error('timeout')
        } else {
          throw e
        }
      }
    },
    async checkOnline() {
      if (this.visible) {
        try {
          const response = await this.fetchWithTimeout(
            this.config.public.APIv2 + '/online',
            null,
            5000
          )

          if (response?.status === 200) {
            const rsp = await response.json()

            if (!this.online) {
              console.log('Back online')
              this.online = rsp.online
            }
          } else {
            // Null response happens when we time out
            console.log('Offline', response)
            this.online = false
          }
        } catch (e) {
          if (this.online) {
            console.log('Gone offline', e)
            this.online = false
          }
        }
      }

      this.onlineTimer = setTimeout(this.checkOnline, 1000)
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
    setMarketingConsent(value) {
      this.marketingConsent = value
    },
    async fetchLatestMessage() {
      try {
        const response = await fetch(
          this.config.public.APIv2 + '/latestmessage'
        )
        const data = await response.json()
        return data
      } catch (e) {
        console.log('Failed to fetch latest message time', e)
        return { ret: 1, status: 'Error' }
      }
    },
  },
  getters: {
    get: (state) => (key) => {
      return state.vals[key]
    },
  },
})
