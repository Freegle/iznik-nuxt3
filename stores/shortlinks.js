import { defineStore } from 'pinia'
import api from '~/api'

export const useShortlinkStore = defineStore({
  id: 'shortlink',
  state: () => ({
    list: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id) {
      const { shortlinks, shortlink } = await api(this.config).shortlinks.fetch(
        {
          id,
        }
      )

      if (shortlinks) {
        shortlinks.forEach((shortlink) => {
          this.list[shortlink.id] = shortlink
        })
      } else if (shortlink) {
        this.list[id] = shortlink
      }
    },
    async add(groupid, name) {
      const id = await api(this.config).shortlinks.add({
        groupid,
        name,
      })

      if (id) {
        const { shortlink } = await api(this.config).shortlinks.fetch({
          id,
        })

        this.list[id] = shortlink
      }

      return id
    },
    clear() {
      this.list = {}
    },
  },
  getters: {
    byId: (state) => {
      return (id) => state.list[id]
    },
  },
})
