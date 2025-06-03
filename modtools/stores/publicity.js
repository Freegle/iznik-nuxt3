import { defineStore } from 'pinia'
import api from '~/api'

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
    async fetch(params) {
      const { socialaction, socialactions, popularposts } = await api(
        this.config
      ).socialactions.fetch(params)
      if (params.id) {
        this.socialaction = socialaction
      } else {
        if (socialactions) {
          for (const item of socialactions) {
            item.iframe = item.iframe.replace('height="500"', 'height="550"') // Tell Ed to fix at server
            this.list[item.id] = item
          }
        }

        if (popularposts) {
          for (const item of popularposts) {
            this.popularposts[item.id] = item
          }
        }
      }
    },
    clearOne(id) {
      delete this.list[id]
    },
    async share(params) {
      await api(this.config).socialactions.share(params.id, params.uid)
    },

    async hide(params) {
      await api(this.config).socialactions.hide(params.id, params.uid)
    },

    async sharePopularPost(params) {
      await api(this.config).socialactions.sharePopularPost(
        params.groupid,
        params.msgid
      )
    },

    async hidePopularPost(params) {
      await api(this.config).socialactions.hidePopularPost(
        params.groupid,
        params.msgid
      )
    },
  },
})
