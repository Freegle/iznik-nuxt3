import { defineStore } from 'pinia'
import api from '~/api'

export const useMessageStore = defineStore({
  id: 'message',
  state: () => ({
    list: {},

    // Lists for Browse
    primaryList: [],
    secondaryList: [],

    // Messages we're in the process of fetching
    fetching: {},
  }),
  actions: {
    async fetch(id, force) {
      // TODO Caching/force
      const message = await api().message.fetch(id)

      if (message) {
        this.list[message.id] = message
      }
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.list[id]
    },
  },
})
