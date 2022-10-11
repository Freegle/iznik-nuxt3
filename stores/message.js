import { defineStore } from 'pinia'
import api from '~/api'

export const useMessageStore = defineStore({
  id: 'message',
  state: () => ({
    config: {},
    list: {},

    // In bounds
    bounds: {},

    // Messages we're in the process of fetching
    fetching: {},
    fetchingCount: 0,
    fetchingMyGroups: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id, force) {
      id = parseInt(id)

      if (force || !this.list[id]) {
        if (this.fetching[id]) {
          // Already fetching
          await this.fetching[id]
        } else {
          this.fetchingCount++
          this.fetching[id] = api(this.config).message.fetch(id)
          this.fetchingCount--

          const message = await this.fetching[id]
          this.fetching[id] = null

          if (message) {
            this.list[id] = message
          }
        }
      }

      return this.list[id]
    },
    async fetchMultiple(ids, force) {
      const left = []

      ids.forEach((id) => {
        id = parseInt(id)

        if ((force || !this.list[id]) && !this.fetching[id]) {
          // This is a message we need to fetch and aren't currently fetching.
          left.push(id)
        }
      })

      if (left.length) {
        this.fetchingCount++
        const msgs = await api(this.config).message.fetch(left.join(','))

        msgs.forEach((msg) => {
          this.list[msg.id] = msg
        })

        this.fetchingCount--
      }
    },
    async fetchInBounds(swlat, swlng, nelat, nelng, groupid) {
      // Don't cache this, as it might change.
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
      let ret = null

      if (this.fetchingMyGroups) {
        ret = await this.fetchingMyGroups
      } else {
        this.fetchingMyGroups = api(this.config).message.mygroups()
        ret = await this.fetchingMyGroups
        this.fetchingMyGroups = null
      }
      return ret
    },
    async fetchByUser(userid, active) {
      return await api(this.config).message.fetchByUser(userid, active)
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
    async promise(id, userid) {
      await api(this.config).message.update({
        id,
        userid,
        action: 'Promise',
      })

      await this.fetch(id, true)
    },
    async renege(id, userid) {
      await api(this.config).message.update({
        id,
        userid,
        action: 'Renege',
      })

      await this.fetch(id, true)
    },
    async addBy(id, userid, count) {
      await api(this.config).message.addBy(id, userid, count)
      await this.fetch(id, true)
    },
    async removeBy(id, userid) {
      await api(this.config).message.removeBy(id, userid)
      await this.fetch(id, true)
    },
    async intend(id, outcome) {
      await api(this.config).message.intend(id, outcome)
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
