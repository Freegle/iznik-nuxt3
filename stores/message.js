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

    // Messages we're in the process of fetching
    // TODO
    fetching: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id, force) {
      id = parseInt(id)

      if (force || !this.list[id]) {
        const message = await api(this.config).message.fetch(id)

        if (message) {
          this.list[id] = message
        }
      }

      return this.list[id]
    },
    async view(id) {
      await api(this.config).message.view(id)
    },
    clear() {
      this.list = {}
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.list[id]
    },
  },
})
