import { defineStore } from 'pinia'
import api from '~/api'

export const useVolunteeringStore = defineStore({
  id: 'volunteering',
  state: () => ({
    config: null,
    list: {},
    fetching: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id, force) {
      if (force || !this.list[id]) {
        if (this.fetching[id]) {
          await this.fetching[id]
        } else {
          this.fetching[id] = api(this.config).volunteering.fetchv2(id)
          this.list[id] = await this.fetching[id]
          this.fetching[id] = null
        }
      }

      return this.list[id]
    },
    async setPhoto(id, photoid) {
      await api(this.config).volunteering.setPhoto(id, photoid)
      await this.fetch(id, true)
    },
    async addGroup(id, groupid) {
      await api(this.config).volunteering.addGroup(id, groupid)
      await this.fetch(id, true)
    },
    async removeGroup(id, groupid) {
      await api(this.config).volunteering.removeGroup(id, groupid)
      await this.fetch(id, true)
    },
    async delete(id) {
      await api(this.config).address.del(id)
    },
    async setDates(params) {
      const promises = []

      for (const date of params.olddates) {
        promises.push(
          api(this.config).volunteering.removeDate(params.id, date.id)
        )
      }

      for (const date of params.newdates) {
        promises.push(
          api(this.config).volunteering.addDate(params.id, date.start, date.end)
        )
      }

      await Promise.all(promises)
      await this.fetch(params.id, true)
    },
    async save(data) {
      await api(this.config).volunteering.save(data)
      // Fetch back to update store and thereby components
      await this.fetch(data.id)
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
