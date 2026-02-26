import { defineStore } from 'pinia'
import api from '~/api'
import { useUserStore } from '~/stores/user'

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
      // V2: single GET returns flat noticeboard directly
      const noticeboard = await api(this.config).noticeboard.fetch(id)

      this.list[id] = noticeboard

      // Fetch user details for addedby and check userids
      await this._fetchUsersForNoticeboard(noticeboard)

      return this.list
    },
    async fetchList(params) {
      const { noticeboards } = await api(this.config).noticeboard.fetchList(
        params
      )

      if (noticeboards) {
        for (const item of noticeboards) {
          this.list[item.id] = item
        }
      }

      return this.list
    },
    async fetchAuthority(authorityid) {
      return await this.fetchList({ authorityid })
    },
    async _fetchUsersForNoticeboard(noticeboard) {
      const userIds = new Set()

      if (noticeboard.addedby) {
        userIds.add(noticeboard.addedby)
      }

      if (noticeboard.checks) {
        for (const check of noticeboard.checks) {
          if (check.userid) {
            userIds.add(check.userid)
          }
        }
      }

      if (userIds.size === 0) return

      const userStore = useUserStore()
      await Promise.all([...userIds].map((id) => userStore.fetch(id)))

      // Attach user objects
      if (noticeboard.addedby) {
        noticeboard.addedbyuser = userStore.list[noticeboard.addedby] || null
      }

      if (noticeboard.checks) {
        for (const check of noticeboard.checks) {
          if (check.userid) {
            check.user = userStore.list[check.userid] || null
          }
        }
      }
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
