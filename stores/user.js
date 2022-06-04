import { defineStore } from 'pinia'
import api from '~/api'

export const useUserStore = defineStore({
  id: 'user',
  state: () => ({
    config: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },

    async emailIsInUse(params) {
      const ret = await api(this.config).user.fetch(params)
      return ret && ret.id
    },
  },
})
