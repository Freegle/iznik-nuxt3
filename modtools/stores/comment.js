import { defineStore } from 'pinia'
import api from '~/api'

export const useCommentStore = defineStore({
  id: 'comment',
  state: () => ({
    list: {},
    context: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    clear() {
      this.list = {}
      this.context = null
    },
    async fetch(params) {
      const data = await api(this.config).comment.fetch(params)
      if (params && params.id) {
        this.list[data.comment.id] = data.comment
      } else {
        for (const comment of data.comments) {
          this.list[comment.id] = comment
        }
        this.context = data.context
      }
    },
  },
  getters: {
    byId: (state) => (id) => {
      id = parseInt(id)
      return state.list[id] ? state.list[id] : null
    },
    sortedList: (state) => {
      const k = Object.values(state.list)

      // Sort by flag then reviewed date descending
      return k.sort((a, b) => {
        if (a.flagged && !b.flagged) {
          return -1
        } else if (!a.flagged && b.flagged) {
          return 1
        } else {
          return new Date(b.reviewed).getTime() - new Date(a.reviewed).getTime()
        }
      })
    },
  },
})
