import { defineStore } from 'pinia'
import api from '~/api'

export const useNoticeboardStore = defineStore({
  id: 'noticeboard',
  state: () => ({
    list: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async add(lat, lng, active) {
      return await api(this.config).noticeboard.add({
        lat,
        lng,
        active,
      })
    },
    async edit(id, name, description, active) {
      await api(this.config).noticeboard.save({
        id,
        name,
        description,
        active,
      })
    },
    async fetch(id) {
      const { noticeboard, noticeboards } = await api(
        this.config
      ).noticeboard.fetch({
        id,
      })

      if (noticeboard) {
        this.list[id] = noticeboard
      } else {
        for (const item of noticeboards) {
          this.list[item.id] = item
        }
      }

      return this.list
    },
    async refresh(id) {
      await api(this.config).noticeboard.action({
        action: 'Refreshed',
        id,
      })
      await this.fetch(id)
    },
    async decline(id) {
      await api(this.config).noticeboard.action({
        action: 'Declined',
        id,
      })
      await this.fetch(id)
    },
    async inactive(id) {
      await api(this.config).noticeboard.action({
        action: 'Inactive',
        id,
      })
      await this.fetch(id)
    },
    async comments(id, comments) {
      await this.$api.noticeboard.action({
        action: 'Comments',
        id,
        comments,
      })
      await this.fetch(id)
    },
    clear() {
      this.$reset()
    },
  },
  getters: {
    byId: (state) => (id) => {
      return state.list[id]
    },
  },
})
