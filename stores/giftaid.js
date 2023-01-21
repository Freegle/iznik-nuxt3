import { defineStore } from 'pinia'
import api from '~/api'

export const useGiftAidStore = defineStore({
  id: 'giftaid',
  state: () => ({
    giftaid: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch() {
      this.giftaid = await api(this.config).giftaid.get()
      return this.giftaid
    },
    async save() {
      await api(this.config).giftaid.save(this.giftaid)
    },
    async remove() {
      await api(this.config).giftaid.remove()
    },
  },
})
