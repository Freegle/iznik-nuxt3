import { defineStore } from 'pinia'

export const usePublicityStore = defineStore({
  id: 'publicity',
  state: () => ({
    list: [],
    popularposts: [],
  }),
  actions: {
    init(config) {
      this.config = config
    },
    clear() {
      this.list = []
      this.context = null
    },
    async fetch() {},
    clearOne() {},
    async share() {},
    async hide() {},
    async sharePopularPost() {},
    async hidePopularPost() {},
  },
})
