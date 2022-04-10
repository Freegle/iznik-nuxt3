import { defineStore } from 'pinia'
import api from '~/api'

export const useIsochroneStore = defineStore({
  id: 'isochrone',
  state: () => ({
    list: [],
  }),
  actions: {
    async fetch() {
      console.log('Fetch')
      const ret = await api().isochrone.fetch({
        jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjM1OTA5MjAwIiwiZXhwIjoxNjQ5NTI2NzEyfQ.6fEn8p6pFcgnjZeDZCEcfnDaAoK06pb3N1Cf1FtLHKc',
      })

      console.log('Returned', ret)
      this.list = ret
    },
  },
  getters: {
    get: (state) => () => state.list,
  },
})
