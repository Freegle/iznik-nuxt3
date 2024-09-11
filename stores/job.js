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

      // We want to show jobs with the ones with the highest CPC first, because that will generate the most
      // for us.  But if the CPC is the same, then we can randomise the order - perhaps increasing the
      // chances of a click.
      this.list.forEach((j) => {
        const dist = j.dist ? j.dist : 0.01
        j.sortBy = (j.cpc / dist).toFixed(3) + '-' + Math.random()
      })

      this.list.sort((a, b) => {
        return a.sortBy.localeCompare(b.sortBy)
      })

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
