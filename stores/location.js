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
    async typeahead(query) {
      return await api(this.config).location.typeahead(query)
    },
    async fetchByLatLng(lat, lng) {
      return await api(this.config).location.latlng(lat, lng)
    },
    async fetchv2(id) {
      const loc = await api(this.config).location.fetchv2(id)

      if (loc) {
        this.list[loc.id] = loc
      }

      return loc
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
