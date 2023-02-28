import { defineStore } from 'pinia'
import api from '~/api'

export const useNoticeboardStore = defineStore({
  id: 'noticeboard',
  state: () => ({
    list: [],
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async add(lat, lng) {
      return await api(this.config).noticeboard.add({
        lat,
        lng,
      })
    },
    async edit(id, name, description) {
      await api(this.config).noticeboard.save({
        id,
        name,
        description,
      })
    },
  },
})
