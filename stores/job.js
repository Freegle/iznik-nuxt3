import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import api from '~/api'

export const useJobStore = defineStore({
  id: 'job',
  state: () => ({
    list: [],
    fetching: null,
    blocked: false,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetchOne(id) {
      let job = null

      try {
        job = await api(this.config).job.fetchOnev2(id, false)
      } catch (e) {
        console.log('Jobs fetch failed - perhaps ad blocked', e)
        this.blocked = true
      }

      return job
    },
    async fetch(lat, lng, category = null, force = false) {
      try {
        if (!this.list?.length || force) {
          if (this.fetching) {
            await this.fetching
            await nextTick()
          } else {
            this.fetching = api(this.config).job.fetchv2(lat, lng, category)
            this.list = await this.fetching
            this.fetching = null
          }
        }
      } catch (e) {
        console.log('Jobs fetch failed - perhaps ad blocked', e)
        this.blocked = true
      }

      return this.list
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
