import { defineStore } from 'pinia'
import api from '~/api'
import { useUserStore } from '~/stores/user'

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
      // Convert context object to URL-safe format (URLSearchParams can't serialize objects)
      if (params.context) {
        for (const key of Object.keys(params.context)) {
          params[`context[${key}]`] = params.context[key]
        }
        delete params.context
      }

      const data = await api(this.config).comment.fetch(params)

      if (params && params.id) {
        // V2 single: flat comment returned directly (no wrapper)
        this.list[data.id] = data
        await this._fetchUsersForComments([data])
      } else {
        // V2 list: {comments: [...], context: {...}}
        for (const comment of data.comments) {
          this.list[comment.id] = comment
        }
        this.context = data.context

        await this._fetchUsersForComments(data.comments)
      }
    },
    async _fetchUsersForComments(comments) {
      // Collect unique user IDs from flat comments
      const userIds = new Set()
      for (const c of comments) {
        if (c.userid) userIds.add(c.userid)
        if (c.byuserid) userIds.add(c.byuserid)
      }

      if (userIds.size === 0) return

      // Fetch users via user store (uses batching/caching)
      const userStore = useUserStore()
      await Promise.all([...userIds].map((id) => userStore.fetch(id)))

      // Attach user objects to comments in our list
      for (const c of comments) {
        const stored = this.list[c.id]
        if (!stored) continue

        if (c.userid) {
          stored.user = userStore.list[c.userid] || { id: c.userid }
        }
        if (c.byuserid) {
          stored.byuser = userStore.list[c.byuserid] || { id: c.byuserid }
        }
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
