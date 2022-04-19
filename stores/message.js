import { defineStore } from 'pinia'
import api from '~/api'

export const useMessageStore = defineStore({
  id: 'message',
  state: () => ({
    // We use Map so that we can have quick access by id and also preserve order.
    // TODO Do we need this?  Or do we have ordering in the caller?
    list: new Map(),

    // Lists for Browse
    primaryList: [],
    secondaryList: [],

    // Messages we're in the process of fetching
    fetching: {},
  }),
  actions: {
    async fetch(id) {
      // TODO Caching/force
      const message = await api().message.fetch(id)

      if (message) {
        this.list.set(message.id, message)
      }
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.list.get(id)
    },
  },
})
