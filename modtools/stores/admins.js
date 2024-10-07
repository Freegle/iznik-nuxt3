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
      console.log('useAdminsStore',admin, admins)
      if (params && params.id) {
        this.list[params.id] = admin
      } else {
        for( const admin of admins){
          this.list[admin.id] = admin
        }
      }
    }
  },
  getters: {
    get: (state) => (id) => {
      id = parseInt(id)
      return state.list[id] ? state.list[id] : null
    },
  },
})
