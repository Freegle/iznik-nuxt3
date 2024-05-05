import { defineStore } from 'pinia'
import api from '~/api'

export const useNoticeboardStore = defineStore({
  id: 'noticeboard',
  state: () => ({
    list: {},
    members: [],
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
    async edit(id, name, description, active, photoid) {
      await api(this.config).noticeboard.save({
        id,
        name,
        description,
        active,
        photoid,
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
    async fetchAuthority(authorityid) {
      const { noticeboard, noticeboards, members } = await api(
        this.config
      ).noticeboard.fetch({
        authorityid,
      })

      if (noticeboard) {
        this.list[authorityid] = noticeboard
      } else {
        for (const item of noticeboards) {
          this.list[item.id] = item
        }

        this.members = members
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
    async saveComments(id, comments) {
      await api(this.config).noticeboard.action({
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
