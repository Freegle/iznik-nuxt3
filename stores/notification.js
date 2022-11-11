import { defineStore } from 'pinia'
import api from '~/api'

export const useNotificationStore = defineStore({
  id: 'notification',
  state: () => ({
    config: null,
    list: [],
    listById: {},
    count: 0,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetchCount() {
      const ret = await api(this.config).notification.count()
      this.count = ret?.count
      return this.count
    },
    async fetchList() {
      this.list = await api(this.config).notification.list()

      this.list.forEach((item) => {
        this.listById[item.id] = item
      })

      return this.list
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.listById[id]
    },
  },
})
