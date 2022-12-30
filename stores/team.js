import { defineStore } from 'pinia'
import api from '~/api'

export const useTeamStore = defineStore({
  id: 'team',
  state: () => ({
    config: null,
    list: [],
    fetching: null,
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(team) {
      if (this.fetching) {
        await this.fetching
      } else {
        this.fetching = api(this.config).team.fetch({
          name: team,
        })
        this.list = await this.fetching
        this.fetching = null
      }

      return this.list
    },
  },
  getters: {
    get: (state) => (id) => {
      return state.list.find((i) => i.id === id)
    },
  },
})
