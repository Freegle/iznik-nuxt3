import { defineStore } from 'pinia'
import api from '~/api'

export const useLocationStore = defineStore({
  id: 'location',
  state: () => ({
    list: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(params) {
      return await api(this.config).location.fetch(params)
    },
    async fetchv2(id) {
      const loc = await api(this.config).location.fetchv2(id)

      if (loc) {
        this.list[loc.id] = loc
      }

      return loc
    },
    async delete(loc) {
      await api(this.config).location.del(loc.id, loc.groupid)
      // Server doesn't support fetching of an individual location so we don't fetch.
      delete this.list[loc.id]
    },
    async add(params){
      const { id } = await api(this.config).location.add(params)
      // Server doesn't support fetching of an individual location so we don't fetch.
      return id
  
    },
    async update(params){
      await api(this.config).location.update(params)
    },
    async convertKML(kml) {
      const { wkt } = await api(this.config).location.convertKML(kml)
      return wkt
    }
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
