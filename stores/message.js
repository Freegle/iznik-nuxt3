import { defineStore } from 'pinia'
import api from '~/api'

export const useMessageStore = defineStore({
  id: 'message',
  state: () => ({
    config: {},
    list: {},

    // Lists for Browse
    primaryList: [],
    secondaryList: [],

    // In bounds
    bounds: {},

    // Messages we're in the process of fetching
    // TODO
    fetching: {},
    fetchingCount: 0,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id, force) {
      id = parseInt(id)

      if (force || !this.list[id]) {
        this.fetchingCount++
        const message = await api(this.config).message.fetch(id)
        this.fetchingCount--

        if (message) {
          this.list[id] = message
        }
      }

      return this.list[id]
    },
    async fetchInBounds(swlat, swlng, nelat, nelng, groupid) {
      // TODO Cache
      const ret = await api(this.config).message.inbounds(
        swlat,
        swlng,
        nelat,
        nelng,
        groupid
      )

      const key =
        swlat + ':' + swlng + ':' + nelat + ':' + nelng + ':' + groupid

      this.bounds[key] = ret
      return ret
    },
    async view(id) {
      await api(this.config).message.view(id)
    },
    clear() {
      this.list = {}
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.list[id]
    },
    inBounds: (state) => (swlat, swlng, nelat, nelng, groupid) => {
      const key =
        swlat + ':' + swlng + ':' + nelat + ':' + nelng + ':' + groupid

      return key in this.bounds ? this.bounds[key] : []
    },
  },
})
