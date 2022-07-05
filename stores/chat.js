import { defineStore } from 'pinia'
import api from '~/api'

export const useChatStore = defineStore({
  id: 'chat',
  state: () => ({
    list: [],
    byId: {},
    messages: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetchChats() {
      // TODO Don't lose currently selected old chat - see store in old code.
      const chats = await api(this.config).chat.listChats()
      this.list = chats

      chats.forEach((c) => {
        this.byId[c.id] = c
      })
    },
    async fetchMessages(id) {
      const messages = await api(this.config).chat.fetchMessages(id)
      this.messages[id] = messages
      return messages
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.byId[id]
    },
    messagesById: (state) => {
      return (id) => state.messages[id]
    },
  },
})
