import { defineStore } from 'pinia'
import api from '~/api'

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    config: {},
    list: {},
    locationList: {},
    fetching: {},
    fetchingLocation: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async emailIsInUse(params) {
      const ret = await api(this.config).user.fetch(params)
      return ret && ret.id
    },
    async fetch(id, force) {
      id = parseInt(id)

      if (force || !this.list[id]) {
        if (this.fetching[id]) {
          await this.fetching[id]
        } else {
          this.fetching[id] = api(this.config).user.fetch(id)
          const user = await this.fetching[id]

          if (user) {
            this.list[id] = user
          }

          this.fetching[id] = null
        }
      }

      return this.list[id]
    },
    async fetchPublicLocation(id, force) {
      id = parseInt(id)

      if (force || !this.locationList[id]) {
        if (this.fetchingLocation[id]) {
          await this.fetchingLocation[id]
        } else {
          this.fetchingLocation[id] = api(this.config).user.fetchPublicLocation(
            id
          )
          const location = await this.fetchingLocation[id]

          if (location) {
            this.locationList[id] = location
          }

          this.fetchingLocation[id] = null
        }
      }

      return this.locationList[id]
    },
    async rate(id, rating, reason, text) {
      await api(this.config).user.rate(id, rating, reason, text)
      await this.fetch(id, true)
    },
    async edit(params) {
      await api(this.config).user.save(params)
      await this.fetchUser()
    },
    async removeEmail(id, email) {
      await api(this.config).user.removeEmail(id, email)
      await this.fetch(id, true)
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.list[id]
    },
    publicLocationById: (state) => {
      return (id) => state.locationList[id]
    },
  },
})
