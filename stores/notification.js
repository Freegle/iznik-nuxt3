import { defineStore } from 'pinia'
import api from '~/api'

// TODO Old client uses notification poll to record active users - how should we do that?
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
        // Notifications are immutable so we can avoid triggering a re-render.
        if (!this.listById[item.id]) {
          this.listById[item.id] = item
        }
      })

      return this.list
    },
    async seen(id) {
      await api(this.config).notification.seen(id)
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.listById[id]
    },
  },
})
