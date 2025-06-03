import { defineStore } from 'pinia'
import api from '~/api'

export const useAdminsStore = defineStore({
  id: 'admins',
  state: () => ({
    list: [],
  }),
  actions: {
    init(config) {
      this.config = config
      this.$api = api(config)
    },
    clear() {
      this.list = []
    },
    clearAdmin(id) {
      delete this.list[id]
    },
    async fetch(params) {
      const { admin, admins } = await api(this.config).admins.fetch(params)
      if (params && params.id) {
        this.list[params.id] = admin
      } else {
        for (const admin of admins) {
          this.list[admin.id] = admin
        }
      }
    },
    async add(params) {
      await api(this.config).admins.add(params)
    },
    async approve(params) {
      await api(this.config).admins.patch({
        id: params.id,
        pending: 0,
      })
      await this.fetch({ id: params.id })
    },
    async edit(params) {
      await api(this.config).admins.patch(params)
      await api(this.config).admins.fetch(params)
    },
    async delete(params) {
      await api(this.config).admins.del(params)
      this.clearAdmin(params.id)
    },
    async hold(params) {
      await api(this.config).admins.hold(params.id)
      await this.fetch({ id: params.id })
    },
    async release(params) {
      await api(this.config).admins.release(params.id)
      await this.fetch({ id: params.id })
    },
  },
  getters: {
    get: (state) => (id) => {
      id = parseInt(id)
      return state.list[id] ? state.list[id] : null
    },
  },
})
