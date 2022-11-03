import { defineStore } from 'pinia'
import api from '~/api'

export const useJobStore = defineStore({
  id: 'job',
  state: () => ({
    config: null,
    list: [],
    fetching: null,
    blocked: false,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(lat, lng) {
      try {
        if (this.fetching) {
          await this.fetching
        } else {
          this.fetching = api(this.config).job.fetchv2(lat, lng)
          this.list = await this.fetching
          this.fetching = null
        }
      } catch (e) {
        console.log('Jobs fetch failed - perhaps ad blocked', e)
        this.blocked = true
      }
    },
    log(params) {
      api(this.config).job.log(params)
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list.find((i) => i.id === id)
    },
  },
})
