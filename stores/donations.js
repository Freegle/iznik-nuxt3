import { defineStore } from 'pinia'
import api from '~/api'

export const useDonationStore = defineStore({
  id: 'donation',
  state: () => ({
    target: 2000,
    raised: 0,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(groupid) {
      const vals = await api(this.config).donations.fetch(groupid)
      this.target = vals.target
      this.raised = vals.raised
    },
    async add(userid, amount, date) {
      const ret = await api(this.config).donations.add(userid, amount, date)

      return ret?.id
    },
  },
})
