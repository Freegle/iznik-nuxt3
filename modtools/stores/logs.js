import { defineStore } from 'pinia'
import api from '~/api'

export const useLogsStore = defineStore({
  id: 'logs',
  state: () => ({
    list: [],
    context: null,
    params: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    clear() {
      this.list = []
      this.context = null
    },
    async fetch(params) {
      let ret = null
      delete params.context
      if (this.context) {
        params.context = { id: this.context.id }
      }
      const data = await api(this.config).logs.fetch(params)

      if (params && params.id) {
        this.list.push(...data.log)
      } else {
        this.list.push(...data.logs)
        this.context = data.context

        ret = data.context
      }

      return ret
    },
    /* MT3 UNUSED
    async delete(id) {
      console.log('useLogsStore delete')
    },
    async add(params) {
      console.log('useLogsStore add')
      return 0
    }, */
    setParams(params) {
      this.params = params
    },
  },
  getters: {
    get: (state) => (id) => {
      return state.listById(id)
    },
  },
})
