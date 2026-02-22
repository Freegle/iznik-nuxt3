import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import api from '~/api'

export const useStoryStore = defineStore({
  id: 'story',
  state: () => ({
    list: {},
    recent: [],
  }),
  actions: {
    init(config) {
      this.config = config
      this.fetching = {}
    },
    async fetchReviewing() {
      // V2 pattern: get IDs of stories needing review, then fetch each.
      const ids =
        (await api(this.config).stories.listv2({
          reviewed: 0,
          public: 0,
          dontzapfalsey: true,
        })) || []

      this.list = {}
      await Promise.all(ids.map((id) => this.fetch(id, true)))
    },
    async fetchNewsletterReviewing() {
      // V2 pattern: get IDs of stories needing newsletter review.
      // reviewed=1, public=1 are the defaults, so only need newsletterreviewed=0.
      const ids =
        (await api(this.config).stories.listv2({
          newsletterreviewed: 0,
          dontzapfalsey: true,
        })) || []

      this.list = {}
      await Promise.all(ids.map((id) => this.fetch(id, true)))
    },
    async fetch(id, force) {
      if (force || !this.list[id]) {
        if (this.fetching[id]) {
          await this.fetching[id]
          await nextTick()
        } else {
          this.fetching[id] = api(this.config).stories.fetchv2(id, false)
          this.list[id] = await this.fetching[id]
          this.fetching[id] = null
        }
      }

      return this.list[id]
    },
    async fetchRecent(limit) {
      this.recent = await api(this.config).stories.listv2({ limit })
    },
    async fetchByAuthority(authorityid, limit) {
      // V2 pattern: get IDs then fetch each.
      const ids =
        (await api(this.config).stories.fetch({
          authorityid,
          limit,
        })) || []

      await Promise.all(ids.map((id) => this.fetch(id, true)))
      return ids.map((id) => this.list[id]).filter(Boolean)
    },
    async fetchByGroup(groupid, limit) {
      // Not used enough to bother caching.
      this.recent = await api(this.config).stories.byGroupv2(groupid, limit)
    },
    add(headline, story, photo, allowpublic) {
      return api(this.config).stories.add({
        headline,
        story,
        photo,
        public: allowpublic,
      })
    },
    async love(id) {
      await api(this.config).stories.love(id)
    },
    async unlove(id) {
      await api(this.config).stories.unlove(id)
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
