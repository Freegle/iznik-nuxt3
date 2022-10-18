import { defineStore } from 'pinia'
import api from '~/api'

export const useStoryStore = defineStore({
  id: 'story',
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
          this.fetching[id] = api(this.config).stories.fetchv2(id)
          this.list[id] = await this.fetching[id]
          this.fetching[id] = null
        }
      }

      return this.list[id]
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
