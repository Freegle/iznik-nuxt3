import { defineStore } from 'pinia'

export const useGiftAidStore = defineStore({
  id: 'giftaid-modtools',
  state: () => ({
    list: {},
  }),
  actions: {
    clear() {
      this.list = {}
    },
    add(item) {
      this.list[item.id] = item
    },
  },
  getters: {
    byId: (state) => (id) => {
      id = parseInt(id)
      return state.list[id] ? state.list[id] : null
    },
  },
})
