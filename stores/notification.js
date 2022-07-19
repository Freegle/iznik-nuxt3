import { defineStore } from 'pinia'

export const useNotificationStore = defineStore({
  id: 'notification',
  state: () => ({
    config: null,
    list: [],
    count: 0,
  }),
  actions: {
    init(config) {
      this.config = config
    },
  },
})
