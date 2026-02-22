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
    async fetchMT(params) {
      const { story, stories } = await api(this.config).stories.fetch(params)
      if (params.id && story) {
        this.list[story.id] = story
      } else {
        this.list = {}

        if (stories) {
          for (const story of stories) {
            this.list[story.id] = story
          }
        }
      }
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
      this.recent = await api(this.config).stories.listv2(limit)
    },
    async fetchByAuthority(authorityid, limit) {
      // Not used enough to bother caching.
      const ret = await api(this.config).stories.fetch({
        authorityid,
        limit,
      })

      if (ret?.ret === 0) {
        return ret.stories
      }

      return []
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
