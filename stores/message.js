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
    async fetchMyGroups() {
      // TODO Cache
      return await api(this.config).message.mygroups()
    },
    async view(id) {
      await api(this.config).message.view(id)
    },
    async update(params) {
      const data = await api(this.config).message.update(params)

      if (!data.deleted) {
        // Fetch back the updated version.
        await this.fetch({ id: params.id, force: true })
      }

      return data
    },
    async patch(params) {
      const data = await api(this.config).message.save(params)

      // Clear from store to ensure no attachments.
      this.remove({
        id: params.id,
      })

      await this.fetch({ id: params.id, force: true })

      return data
    },
    remove(item) {
      this.list = this.list.filter((obj) => {
        return parseInt(obj.id) !== parseInt(item.id)
      })

      delete this.index[parseInt(item.id)]
    },
    clear() {
      this.$reset()
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
    all: (state) => Object.values(state.list),
  },
})
