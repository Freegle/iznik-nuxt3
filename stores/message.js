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
    // TODO
    fetching: {},
  }),
  actions: {
    async fetch(id, force) {
      id = parseInt(id)
      console.log('Message fetch')

      if (force || !this.list[id]) {
        const message = await api(this.$nuxt, this.$nuxt.$config).message.fetch(
          id
        )

        if (message) {
          this.list[id] = message
        }
      }

      console.log('Message fetched')

      return this.list[id]
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.list[id]
    },
  },
})
